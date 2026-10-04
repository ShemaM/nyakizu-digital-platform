from unittest import mock

import requests
from django.test import TestCase, override_settings

from billing import daraja

CREDS = dict(
    DARAJA_CONSUMER_KEY="key123", DARAJA_CONSUMER_SECRET="secret456",
    DARAJA_SHORTCODE="174379", DARAJA_PASSKEY="passkeyABC", DARAJA_ENV="sandbox",
    DARAJA_TRANSACTION_TYPE="CustomerPayBillOnline", DARAJA_CALLBACK_URL="https://example.com/cb",
    MPESA_DARAJA_ENABLED=True,
)


def reply(body, status=200):
    response = mock.Mock()
    response.status_code = status
    response.json.return_value = body
    return response


@override_settings(**CREDS)
class AccessTokenTests(TestCase):
    def test_fetches_a_token_with_basic_auth(self):
        ok = reply({"access_token": "tok123", "expires_in": "3599"})
        with mock.patch("billing.daraja.requests.get", return_value=ok) as get:
            token = daraja.get_access_token()
        self.assertEqual(token, "tok123")
        args, kwargs = get.call_args
        self.assertEqual(args, ("https://sandbox.safaricom.co.ke/oauth/v1/generate",))
        self.assertEqual(kwargs["params"], {"grant_type": "client_credentials"})
        self.assertEqual(kwargs["auth"], ("key123", "secret456"))
        self.assertEqual(kwargs["timeout"], daraja.TIMEOUT)

    @override_settings(DARAJA_ENV="production")
    def test_uses_the_production_host_when_configured(self):
        with mock.patch("billing.daraja.requests.get", return_value=reply({"access_token": "t"})) as get:
            daraja.get_access_token()
        self.assertEqual(get.call_args.args, ("https://api.safaricom.co.ke/oauth/v1/generate",))

    def test_a_refusal_becomes_a_daraja_error_with_detail(self):
        with mock.patch("billing.daraja.requests.get", return_value=reply({"error_description": "Bad Credentials"}, 400)):
            with self.assertRaisesMessage(daraja.DarajaError, "Bad Credentials") as caught:
                daraja.get_access_token()
        self.assertEqual(caught.exception.detail, {"error_description": "Bad Credentials"})

    def test_network_failures_raise(self):
        for exc in (requests.ConnectionError("down"), requests.Timeout("slow")):
            with self.subTest(exc=type(exc).__name__):
                with mock.patch("billing.daraja.requests.get", side_effect=exc):
                    with self.assertRaises(daraja.DarajaError):
                        daraja.get_access_token()

    def test_an_unreadable_reply_raises_with_a_snippet_of_the_body(self):
        bad = mock.Mock(status_code=403, text="<html>Access Forbidden</html>")
        bad.json.side_effect = ValueError("not json")
        with mock.patch("billing.daraja.requests.get", return_value=bad):
            with self.assertRaisesMessage(daraja.DarajaError, "HTTP 403") as caught:
                daraja.get_access_token()
        self.assertEqual(caught.exception.detail, {"body": "<html>Access Forbidden</html>"})

    def test_the_secret_never_appears_in_an_error_or_a_log_line(self):
        with self.assertLogs("billing", level="WARNING") as logs:
            with self.assertRaises(daraja.DarajaError) as caught:
                with mock.patch("billing.daraja.requests.get", return_value=reply({}, 401)):
                    daraja.get_access_token()
        self.assertNotIn("secret456", str(caught.exception))
        self.assertNotIn("secret456", "\n".join(logs.output))

    @override_settings(DARAJA_CONSUMER_SECRET="")
    def test_without_credentials_nothing_is_sent_at_all(self):
        with mock.patch("billing.daraja.requests.get") as get:
            with self.assertRaises(daraja.DarajaNotConfigured):
                daraja.get_access_token()
        get.assert_not_called()


@override_settings(**CREDS)
class StkPushTests(TestCase):
    def test_sends_the_documented_request(self):
        ok = reply({"ResponseCode": "0", "CheckoutRequestID": "ws_CO_1", "MerchantRequestID": "m1"})
        with mock.patch("billing.daraja.get_access_token", return_value="tok123"), \
                mock.patch("billing.daraja.requests.post", return_value=ok) as post:
            result = daraja.stk_push(phone="254712345678", amount_kes=150, account_reference="NYK-0007-longer-than-12")

        args, kwargs = post.call_args
        self.assertEqual(args, ("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",))
        self.assertEqual(kwargs["headers"], {"Authorization": "Bearer tok123"})
        body = kwargs["json"]
        self.assertEqual(body["BusinessShortCode"], "174379")
        self.assertEqual(body["Amount"], 150)
        self.assertEqual((body["PartyA"], body["PartyB"], body["PhoneNumber"]), ("254712345678", "174379", "254712345678"))
        self.assertEqual(body["CallBackURL"], "https://example.com/cb")
        self.assertEqual(body["TransactionType"], "CustomerPayBillOnline")
        # Trimmed to fit Daraja's historical field limits, never sent oversized.
        self.assertLessEqual(len(body["AccountReference"]), 12)
        self.assertLessEqual(len(body["TransactionDesc"]), 13)
        self.assertEqual(len(body["Password"]), 40)  # base64 of shortcode(6)+passkey(10)+timestamp(14), no padding
        self.assertEqual(len(body["Timestamp"]), 14)
        self.assertEqual(kwargs["timeout"], daraja.TIMEOUT)
        self.assertEqual(result, {"checkout_request_id": "ws_CO_1", "raw": ok.json.return_value})

    def test_a_rejected_push_raises_with_detail(self):
        bad = reply({"ResponseCode": "1", "ResponseDescription": "Invalid PartyA"})
        with mock.patch("billing.daraja.get_access_token", return_value="tok123"), \
                mock.patch("billing.daraja.requests.post", return_value=bad):
            with self.assertRaisesMessage(daraja.DarajaError, "Invalid PartyA") as caught:
                daraja.stk_push(phone="254712345678", amount_kes=50, account_reference="NYK-0001")
        self.assertEqual(caught.exception.detail["ResponseCode"], "1")

    def test_an_http_error_without_a_body_still_raises(self):
        with mock.patch("billing.daraja.get_access_token", return_value="tok123"), \
                mock.patch("billing.daraja.requests.post", return_value=reply({}, 500)):
            with self.assertRaises(daraja.DarajaError):
                daraja.stk_push(phone="254712345678", amount_kes=50, account_reference="NYK-0001")

    def test_an_accepted_reply_missing_the_checkout_id_still_raises(self):
        with mock.patch("billing.daraja.get_access_token", return_value="tok123"), \
                mock.patch("billing.daraja.requests.post", return_value=reply({"ResponseCode": "0"})):
            with self.assertRaises(daraja.DarajaError):
                daraja.stk_push(phone="254712345678", amount_kes=50, account_reference="NYK-0001")


@override_settings(**CREDS)
class StkQueryTests(TestCase):
    def query(self, body, status=200):
        with mock.patch("billing.daraja.get_access_token", return_value="tok123"), \
                mock.patch("billing.daraja.requests.post", return_value=reply(body, status)) as post:
            result = daraja.stk_query("ws_CO_1")
        return result, post

    def test_sends_the_documented_request(self):
        _, post = self.query({"ResultCode": "0", "ResultDesc": "ok"})
        args, kwargs = post.call_args
        self.assertEqual(args, ("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",))
        self.assertEqual(kwargs["json"]["CheckoutRequestID"], "ws_CO_1")
        self.assertEqual(kwargs["json"]["BusinessShortCode"], "174379")

    def test_a_clean_zero_result_code_is_a_settled_success(self):
        result, _ = self.query({"ResultCode": "0", "ResultDesc": "The service request is processed successfully."})
        self.assertEqual(result, {"settled": True, "success": True, "raw": result["raw"]})

    def test_a_clean_nonzero_result_code_is_a_settled_failure(self):
        for code in (1032, 1037, "1", 2001):
            with self.subTest(code=code):
                result, _ = self.query({"ResultCode": code, "ResultDesc": "Request cancelled by user"})
                self.assertEqual((result["settled"], result["success"]), (True, False))

    def test_daraja_ambiguous_envelope_is_never_read_as_a_failure(self):
        # The documented {"errorCode": ...} shape — can appear even for a
        # transaction that later succeeds. Must never be treated as final.
        result, _ = self.query({"requestId": "x", "errorCode": "500.001.1001", "errorMessage": "The transaction is being processed"}, status=500)
        self.assertEqual(result["settled"], False)
        self.assertNotIn("success", result)

    def test_a_clean_but_unrecognised_result_code_is_also_never_read_as_a_failure(self):
        # Observed on a real sandbox transaction: a well-formed ResultCode that
        # still isn't final. Regression test for the bug this shipped with at
        # first, where any non-"0" ResultCode was treated as a failure.
        result, _ = self.query({"ResultCode": "4999", "ResultDesc": "The transaction is still under processing"})
        self.assertEqual(result["settled"], False)
        self.assertNotIn("success", result)

    def test_only_the_presence_of_result_code_decides_settled_not_http_status(self):
        result, _ = self.query({"ResultCode": "0"}, status=500)
        self.assertEqual(result["settled"], True)

    def test_a_genuine_network_failure_raises_rather_than_reading_as_pending(self):
        with mock.patch("billing.daraja.get_access_token", return_value="tok123"), \
                mock.patch("billing.daraja.requests.post", side_effect=requests.ConnectionError("down")):
            with self.assertRaises(daraja.DarajaError):
                daraja.stk_query("ws_CO_1")


class CleanTests(TestCase):
    def test_keeps_only_the_documented_fields(self):
        body = {"ResultCode": "0", "ResultDesc": "ok", "SecretStuff": "nope", "CheckoutRequestID": "x"}
        self.assertEqual(daraja.clean(body), {"ResultCode": "0", "ResultDesc": "ok", "CheckoutRequestID": "x"})
