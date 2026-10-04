import json
from decimal import Decimal
from io import StringIO
from unittest import mock

from django.core.cache import cache
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import Client, TestCase, override_settings
from rest_framework.test import APIClient

from billing.daraja import DarajaError, DarajaNotConfigured
from billing.models import CreditEntry, Payment, SellerAccount
from billing.payments import normalize_phone, settle_payment, start_topup
from billing.services import ensure_account, ledger_mismatch
from billing.testing import make_buyer, make_seller
from billing.views import DarajaWebhookView, TopUpStatusView, TopUpView
from django.conf import settings

PUSH = "billing.payments.stk_push"
QUERY = "billing.payments.stk_query"

CREDS = dict(DARAJA_CONSUMER_KEY="key123", DARAJA_CONSUMER_SECRET="secret456", DARAJA_SHORTCODE="174379", DARAJA_PASSKEY="passkeyABC")


def accepted(checkout_request_id="ws_CO_1"):
    return {"checkout_request_id": checkout_request_id, "raw": {"ResponseCode": "0", "CheckoutRequestID": checkout_request_id}}


def settled(success=True, extra=None):
    return {"settled": True, "success": success, "raw": {"ResultCode": "0" if success else "1", **(extra or {})}}


def pending():
    return {"settled": False, "raw": {"errorCode": "500.001.1001", "errorMessage": "The transaction is being processed"}}


def initiated(account, amount=140, reference="ws_CO_TEST"):
    return Payment.objects.create(account=account, reference=reference, amount_kes=Decimal(amount), phone="+254712345678")


def balance(account):
    return SellerAccount.objects.get(pk=account.pk).credit_kes


class NormalizePhoneTests(TestCase):
    def test_accepts_every_common_way_of_writing_a_safaricom_number(self):
        for raw in ("0712345678", "0112345678", "254712345678", "+254712345678", "0712 345 678", "0712-345-678", " 0712345678 "):
            with self.subTest(raw=raw):
                self.assertEqual(normalize_phone(raw)[:4], "+254")
        self.assertEqual(normalize_phone("0712 345 678"), "+254712345678")
        self.assertEqual(normalize_phone("0112345678"), "+254112345678")

    def test_rejects_anything_else(self):
        for raw in ("0812345678", "071234567", "07123456789", "abc", "", None, "+255712345678"):
            with self.subTest(raw=raw):
                self.assertIsNone(normalize_phone(raw))


@override_settings(**CREDS)
class StartTopUpTests(TestCase):
    def setUp(self):
        self.account = ensure_account(make_seller(1))

    def start(self, **kw):
        return start_topup(self.account, amount=140, phone="+254712345678")

    def test_records_an_initiated_payment_and_credits_nothing(self):
        with mock.patch(PUSH, return_value=accepted()) as push:
            payment = self.start()
        self.assertEqual((payment.status, payment.amount_kes, payment.account), ("initiated", Decimal("140"), self.account))
        # Daraja's phone format has no "+" — the app-wide "+254..." form is only for storage/display.
        self.assertEqual(push.call_args.kwargs["phone"], "254712345678")
        self.assertEqual(balance(self.account), 0)
        self.assertFalse(CreditEntry.objects.exists())

    def test_the_stored_reference_is_daraja_own_checkout_request_id(self):
        with mock.patch(PUSH, return_value=accepted(checkout_request_id="ws_CO_theirs")):
            payment = self.start()
        self.assertEqual(payment.reference, "ws_CO_theirs")

    def test_a_refused_push_marks_the_payment_failed_and_raises(self):
        with mock.patch(PUSH, side_effect=DarajaError("declined")):
            with self.assertRaises(DarajaError):
                self.start()
        self.assertEqual(Payment.objects.get().status, "failed")

    def test_a_refusals_real_detail_is_kept_for_diagnosis_not_a_generic_marker(self):
        with mock.patch(PUSH, side_effect=DarajaError("Invalid PartyA", detail={"ResponseCode": "1", "ResponseDescription": "Invalid PartyA"})):
            with self.assertRaises(DarajaError):
                self.start()
        self.assertEqual(Payment.objects.get().raw_payload["detail"], {"ResponseCode": "1", "ResponseDescription": "Invalid PartyA"})

    def test_a_network_failures_empty_detail_does_not_break_saving(self):
        with mock.patch(PUSH, side_effect=DarajaError("Could not reach Daraja.")):
            with self.assertRaises(DarajaError):
                self.start()
        self.assertEqual(Payment.objects.get().raw_payload["detail"], {})


class SettlePaymentTests(TestCase):
    def setUp(self):
        self.account = ensure_account(make_seller(1))
        self.payment = initiated(self.account)

    def settle(self, **kw):
        with mock.patch(QUERY, return_value=settled(**kw)) as query:
            result = settle_payment(self.payment.reference)
        return result, query

    def test_a_settled_success_credits_once_and_writes_a_linked_ledger_entry(self):
        result, _ = self.settle()
        self.assertEqual(result.status, "success")
        self.assertEqual(balance(self.account), Decimal("140.00"))
        entry = CreditEntry.objects.get()
        self.assertEqual((entry.kind, entry.amount_kes, entry.payment), ("top_up", Decimal("140.00"), self.payment))
        self.assertIsNone(ledger_mismatch(self.account))

    def test_settling_again_never_asks_daraja_or_credits_twice(self):
        self.settle()
        _, query = self.settle()
        query.assert_not_called()
        self.assertEqual(balance(self.account), Decimal("140.00"))
        self.assertEqual(CreditEntry.objects.count(), 1)

    def test_a_settled_failure_is_marked_failed(self):
        result, _ = self.settle(success=False)
        self.assertEqual((result.status, balance(self.account)), ("failed", 0))

    def test_daraja_ambiguous_reply_leaves_the_payment_exactly_as_it_was(self):
        with mock.patch(QUERY, return_value=pending()):
            result = settle_payment(self.payment.reference)
        self.assertEqual((result.status, balance(self.account)), ("initiated", 0))

    def test_an_unknown_reference_is_ignored_without_asking_daraja(self):
        with mock.patch(QUERY) as query:
            self.assertIsNone(settle_payment("NOPE"))
        query.assert_not_called()

    def test_if_daraja_cannot_be_asked_nothing_changes_and_the_error_reaches_the_caller(self):
        with mock.patch(QUERY, side_effect=DarajaError("down")):
            with self.assertRaises(DarajaError):
                settle_payment(self.payment.reference)
        self.payment.refresh_from_db()
        self.assertEqual((self.payment.status, balance(self.account)), ("initiated", 0))

    def test_a_request_that_loses_the_race_does_not_credit_a_second_time(self):
        def another_request_settles_first(reference):
            Payment.objects.filter(reference=reference).update(status="success")
            return settled()

        with mock.patch(QUERY, side_effect=another_request_settles_first):
            settle_payment(self.payment.reference)
        self.assertEqual(balance(self.account), 0)  # the other request owns the credit, not this one

    def test_a_payment_whose_account_is_gone_is_never_credited_anywhere(self):
        self.account.delete()
        self.payment.refresh_from_db()
        with self.assertLogs("billing", level="ERROR"):
            result, _ = self.settle()
        self.assertEqual(result.status, "initiated")


class TopUpEndpointTests(TestCase):
    def setUp(self):
        cache.clear()  # DRF keeps throttle counts in the cache, which outlives a test's database rollback
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)
        self.client = APIClient()
        self.client.force_authenticate(self.seller.user)

    def post(self, body):
        return self.client.post("/api/billing/pay/", body, format="json")

    def test_needs_an_approved_seller(self):
        self.assertEqual(APIClient().post("/api/billing/pay/", {}, format="json").status_code, 403)
        self.client.force_authenticate(make_buyer("b"))
        self.assertEqual(self.post({"amount_kes": 100, "phone": "0712345678"}).status_code, 403)
        self.client.force_authenticate(make_seller(2, "pending").user)
        self.assertEqual(self.post({"amount_kes": 100, "phone": "0712345678"}).status_code, 403)

    def test_starts_a_top_up_with_the_amount_and_a_normalised_phone(self):
        with mock.patch(PUSH, return_value=accepted()) as push:
            response = self.post({"amount_kes": 140, "phone": "0712 345 678"})

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual((data["status"], data["amount_kes"]), ("initiated", "140.00"))
        self.assertIn("PIN", data["detail"])
        kwargs = push.call_args.kwargs
        self.assertEqual((kwargs["phone"], kwargs["amount_kes"]), ("254712345678", Decimal("140")))
        self.assertEqual(Payment.objects.get().reference, data["reference"])
        self.assertEqual(balance(self.account), 0)  # starting a top-up never credits anything

    def test_refuses_bad_amounts_and_phones_without_calling_daraja(self):
        bad = [
            {"amount_kes": 49, "phone": "0712345678"},
            {"amount_kes": 20001, "phone": "0712345678"},
            {"amount_kes": "150.50", "phone": "0712345678"},
            {"amount_kes": "abc", "phone": "0712345678"},
            {"amount_kes": 100, "phone": "0812345678"},
            {"amount_kes": 100},
            {"phone": "0712345678"},
        ]
        with mock.patch(PUSH) as push:
            for body in bad:
                with self.subTest(body=body):
                    self.assertEqual(self.post(body).status_code, 400)
        push.assert_not_called()
        self.assertFalse(Payment.objects.exists())

    @override_settings(BILLING_MIN_TOPUP_KES=200, BILLING_MAX_TOPUP_KES=300)
    def test_the_limits_come_from_settings(self):
        with mock.patch(PUSH, return_value=accepted()):
            self.assertEqual(self.post({"amount_kes": 100, "phone": "0712345678"}).status_code, 400)
            self.assertEqual(self.post({"amount_kes": 250, "phone": "0712345678"}).status_code, 201)

    def test_if_daraja_refuses_the_seller_gets_a_friendly_error_that_leaks_nothing(self):
        with mock.patch(PUSH, side_effect=DarajaError("Invalid consumer key s_secret_leak")):
            response = self.post({"amount_kes": 100, "phone": "0712345678"})
        self.assertEqual(response.status_code, 502)
        self.assertNotIn("s_secret_leak", response.content.decode())
        self.assertEqual(Payment.objects.get().status, "failed")

    def test_when_top_ups_are_not_configured_it_says_so(self):
        with mock.patch(PUSH, side_effect=DarajaNotConfigured("no key")):
            response = self.post({"amount_kes": 100, "phone": "0712345678"})
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["detail"], "Top-ups are not available yet.")

    def test_starting_top_ups_is_rate_limited_per_seller(self):
        with mock.patch(PUSH) as push:
            statuses = [self.post({"amount_kes": 1, "phone": "0712345678"}).status_code for _ in range(11)]
        self.assertEqual(statuses[:10], [400] * 10)  # too-small amounts: refused, but still counted
        self.assertEqual(statuses[10], 429)
        push.assert_not_called()

        other = make_seller(2)
        self.client.force_authenticate(other.user)
        self.assertEqual(self.post({"amount_kes": 1, "phone": "0712345678"}).status_code, 400)  # not limited

    def test_both_endpoints_are_rate_limited(self):
        self.assertEqual(TopUpView.throttle_scope, "billing_pay")
        self.assertEqual(TopUpStatusView.throttle_scope, "billing_pay_status")
        rates = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]
        self.assertIn("billing_pay", rates)
        self.assertIn("billing_pay_status", rates)


class TopUpStatusEndpointTests(TestCase):
    def setUp(self):
        cache.clear()
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)
        self.payment = initiated(self.account)
        self.client = APIClient()
        self.client.force_authenticate(self.seller.user)

    def get(self, reference=None):
        return self.client.get(f"/api/billing/pay/{reference or self.payment.reference}/")

    def test_needs_an_approved_seller(self):
        self.assertEqual(APIClient().get(f"/api/billing/pay/{self.payment.reference}/").status_code, 403)

    def test_polling_confirms_with_daraja_and_credits_the_seller(self):
        with mock.patch(QUERY, return_value=settled()):
            data = self.get().json()
        self.assertEqual((data["status"], data["credit_kes"]), ("success", "140.00"))

    def test_while_the_customer_has_not_paid_it_reports_initiated(self):
        with mock.patch(QUERY, return_value=pending()):
            data = self.get().json()
        self.assertEqual((data["status"], data["credit_kes"]), ("initiated", "0.00"))

    def test_an_already_settled_payment_is_reported_without_asking_daraja_again(self):
        with mock.patch(QUERY, return_value=settled()):
            self.get()
        with mock.patch(QUERY) as query:
            data = self.get().json()
        query.assert_not_called()
        self.assertEqual(data["status"], "success")

    def test_if_daraja_is_unreachable_it_still_answers_as_waiting(self):
        with mock.patch(QUERY, side_effect=DarajaError("down")):
            response = self.get()
        self.assertEqual((response.status_code, response.json()["status"]), (200, "initiated"))

    def test_another_sellers_payment_is_not_found(self):
        other = ensure_account(make_seller(2))
        theirs = initiated(other, reference="ws_CO_OTHER")
        with mock.patch(QUERY) as query:
            self.assertEqual(self.get(theirs.reference).status_code, 404)
        query.assert_not_called()


class WebhookTests(TestCase):
    URL = "/api/billing/webhooks/daraja/"

    def setUp(self):
        self.account = ensure_account(make_seller(1))
        self.payment = initiated(self.account)
        # Prove the webhook needs no login and is exempt from CSRF: Daraja has no way to carry either.
        self.client = Client(enforce_csrf_checks=True)

    def callback_body(self, result_code=0, reference=None, metadata=None):
        callback = {
            "MerchantRequestID": "m1", "CheckoutRequestID": reference or self.payment.reference,
            "ResultCode": result_code, "ResultDesc": "done",
        }
        if metadata is not None:
            callback["CallbackMetadata"] = {"Item": [{"Name": k, "Value": v} for k, v in metadata.items()]}
        return json.dumps({"Body": {"stkCallback": callback}}).encode()

    def post(self, raw=None, **extra):
        raw = raw if raw is not None else self.callback_body()
        return self.client.post(self.URL, data=raw, content_type="application/json", **extra)

    def test_a_callback_credits_the_seller_after_independently_asking_daraja(self):
        with mock.patch(QUERY, return_value=settled()) as query:
            response = self.post()
        self.assertEqual(response.status_code, 200)
        query.assert_called_once_with(self.payment.reference)
        self.assertEqual(balance(self.account), Decimal("140.00"))

    def test_the_body_is_never_trusted_only_daraja_own_answer_is(self):
        # The callback here claims success, but Daraja's own query says otherwise.
        with mock.patch(QUERY, return_value=settled(success=False)):
            response = self.post(self.callback_body(result_code=0, metadata={"Amount": 140, "MpesaReceiptNumber": "NLJ7RT61SV"}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(balance(self.account), 0)

    def test_a_repeated_delivery_credits_only_once(self):
        with mock.patch(QUERY, return_value=settled()):
            self.post()
            self.post()
        self.assertEqual(balance(self.account), Decimal("140.00"))
        self.assertEqual(CreditEntry.objects.count(), 1)

    def test_an_unknown_reference_is_acknowledged_and_credits_nothing(self):
        with mock.patch(QUERY) as query, self.assertLogs("billing", level="WARNING"):
            self.assertEqual(self.post(self.callback_body(reference="NOT-OURS")).status_code, 200)
        query.assert_not_called()

    def test_a_body_that_is_not_json_is_acknowledged_not_a_server_error(self):
        self.assertEqual(self.post(b"not json").status_code, 200)

    def test_a_callback_without_a_checkout_request_id_is_acknowledged(self):
        raw = json.dumps({"Body": {"stkCallback": {"ResultCode": 0}}}).encode()
        self.assertEqual(self.post(raw).status_code, 200)

    def test_the_metadata_is_recorded_for_the_audit_trail_even_though_it_is_not_trusted(self):
        with mock.patch(QUERY, return_value=settled()):
            self.post(self.callback_body(metadata={"Amount": 140, "MpesaReceiptNumber": "NLJ7RT61SV"}))
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.raw_payload["callback"]["MpesaReceiptNumber"], "NLJ7RT61SV")

    def test_if_daraja_cannot_be_asked_it_still_acknowledges_200_since_daraja_never_retries(self):
        with mock.patch(QUERY, side_effect=DarajaError("down")), self.assertLogs("billing", level="ERROR"):
            self.assertEqual(self.post().status_code, 200)
        self.assertEqual(balance(self.account), 0)

    def test_it_uses_no_login_and_no_throttle(self):
        self.assertEqual(DarajaWebhookView.authentication_classes, [])
        self.assertEqual(DarajaWebhookView.throttle_classes, [])

    @override_settings(DARAJA_WEBHOOK_IPS=["203.0.113.5"])
    def test_the_optional_ip_allowlist_still_acknowledges_but_asks_daraja_nothing(self):
        with mock.patch(QUERY) as query:
            self.assertEqual(self.post(REMOTE_ADDR="198.51.100.9").status_code, 200)
        query.assert_not_called()
        with mock.patch(QUERY, return_value=settled()):
            self.assertEqual(self.post(HTTP_X_FORWARDED_FOR="9.9.9.9, 203.0.113.5").status_code, 200)
        self.assertEqual(balance(self.account), Decimal("140.00"))

    @override_settings(DARAJA_WEBHOOK_IPS=["203.0.113.5"])
    def test_a_spoofed_first_forwarded_address_does_not_get_past_the_allowlist(self):
        # Only the LAST entry is the address Heroku's router actually saw.
        with mock.patch(QUERY) as query:
            self.assertEqual(self.post(HTTP_X_FORWARDED_FOR="203.0.113.5, 9.9.9.9").status_code, 200)
        query.assert_not_called()


class DarajaCommandTests(TestCase):
    def run_command(self, name, *args):
        out = StringIO()
        call_command(name, *args, stdout=out)
        return out.getvalue()

    @override_settings(**CREDS, DARAJA_ENV="sandbox")
    def test_check_daraja_reports_the_environment_and_never_the_secret(self):
        with mock.patch("billing.management.commands.check_daraja.get_access_token", return_value="tok"):
            output = self.run_command("check_daraja")
        self.assertIn("Daraja credentials OK (sandbox environment)", output)
        self.assertNotIn(CREDS["DARAJA_CONSUMER_SECRET"], output)

    @override_settings(DARAJA_CONSUMER_SECRET="")
    def test_check_daraja_fails_clearly_without_credentials(self):
        with self.assertRaisesMessage(CommandError, "are not set"):
            self.run_command("check_daraja")

    def test_topup_seller_runs_a_top_up_to_completion(self):
        seller = make_seller(1)
        account = ensure_account(seller)
        with override_settings(**CREDS), \
                mock.patch(PUSH, return_value=accepted()), \
                mock.patch(QUERY, return_value=settled()), \
                mock.patch("billing.management.commands.topup_seller.time.sleep"):
            output = self.run_command("topup_seller", "--seller", str(seller.pk), "--amount", "50", "--phone", "0712345678")
        self.assertIn("Payment is success. Balance: KES 50.00", output)
        self.assertEqual(balance(account), Decimal("50.00"))

    def test_topup_seller_refuses_production_without_confirmation(self):
        seller = make_seller(1)
        with override_settings(**CREDS, DARAJA_ENV="production"), mock.patch(PUSH) as push:
            with self.assertRaisesMessage(CommandError, "--confirm-live"):
                self.run_command("topup_seller", "--seller", str(seller.pk), "--amount", "50", "--phone", "0712345678")
        push.assert_not_called()

    def test_topup_seller_rejects_a_bad_phone_or_an_unknown_seller(self):
        seller = make_seller(1)
        with override_settings(**CREDS):
            with self.assertRaisesMessage(CommandError, "Kenyan mobile"):
                self.run_command("topup_seller", "--seller", str(seller.pk), "--amount", "50", "--phone", "123")
            with self.assertRaisesMessage(CommandError, "No seller"):
                self.run_command("topup_seller", "--seller", "999", "--amount", "50", "--phone", "0712345678")
