"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { sellers, ApiError, type User } from "@/lib/api";

interface PaymentInfoEditorProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

/**
 * Where buyers should send M-Pesa money for this store. Every field is
 * optional and independent — a seller fills in whichever payment methods
 * they actually use, and only those show up on the buyer's side.
 */
export function PaymentInfoEditor({ user, onUserUpdate }: PaymentInfoEditorProps) {
  const { toast } = useToast();
  const profile = user.seller_profile;

  const [till, setTill] = useState(profile?.mpesa_till_number || "");
  const [pochi, setPochi] = useState(profile?.mpesa_pochi_number || "");
  const [paybillNumber, setPaybillNumber] = useState(profile?.mpesa_paybill_number || "");
  const [paybillAccount, setPaybillAccount] = useState(profile?.mpesa_paybill_account || "");
  const [sendMoney, setSendMoney] = useState(profile?.mpesa_send_money_number || "");
  const [saving, setSaving] = useState(false);

  const dirty =
    till.trim() !== (profile?.mpesa_till_number || "") ||
    pochi.trim() !== (profile?.mpesa_pochi_number || "") ||
    paybillNumber.trim() !== (profile?.mpesa_paybill_number || "") ||
    paybillAccount.trim() !== (profile?.mpesa_paybill_account || "") ||
    sendMoney.trim() !== (profile?.mpesa_send_money_number || "");

  if (!profile) return null;

  async function handleSave() {
    if (!dirty || saving || !profile) return;
    setSaving(true);
    try {
      const updatedProfile = await sellers.update(profile.id, {
        mpesa_till_number: till.trim(),
        mpesa_pochi_number: pochi.trim(),
        mpesa_paybill_number: paybillNumber.trim(),
        mpesa_paybill_account: paybillAccount.trim(),
        mpesa_send_money_number: sendMoney.trim(),
      });
      onUserUpdate({
        ...user,
        seller_profile: { ...profile, ...updatedProfile },
      });
      toast("Payment details saved.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not save your changes.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 text-text-primary font-bold">
          <Wallet size={16} className="text-role" /> How Buyers Pay You
        </div>
        <p className="text-caption text-text-muted mt-1">
          Fill in whichever M-Pesa options you use. Buyers will see only the ones you fill in.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Till Number (Buy Goods)"
          value={till}
          onChange={(e) => setTill(e.target.value)}
          placeholder="e.g. 123456"
        />
        <Input
          label="Pochi la Biashara Number"
          value={pochi}
          onChange={(e) => setPochi(e.target.value)}
          placeholder="e.g. 0712 345 678"
        />
        <Input
          label="Paybill Number"
          value={paybillNumber}
          onChange={(e) => setPaybillNumber(e.target.value)}
          placeholder="e.g. 400200"
        />
        <Input
          label="Paybill Account Number"
          value={paybillAccount}
          onChange={(e) => setPaybillAccount(e.target.value)}
          placeholder="What buyers type as the account"
        />
        <Input
          label="Send Money Number"
          value={sendMoney}
          onChange={(e) => setSendMoney(e.target.value)}
          placeholder="e.g. 0712 345 678"
          className="sm:col-span-2"
        />
      </div>

      <Button onClick={handleSave} disabled={!dirty} loading={saving} className="w-full sm:w-auto">
        Save changes
      </Button>
    </div>
  );
}
