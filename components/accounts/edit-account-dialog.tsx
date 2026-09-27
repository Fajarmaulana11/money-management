"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";

import { Trash2 } from "lucide-react";

import type { Account, AccountType } from "@/types/domain";

const TYPES: {
  value: AccountType;
  label: string;
}[] = [
  {
    value: "cash",
    label: "Tunai",
  },
  {
    value: "bank",
    label: "Bank",
  },
  {
    value: "ewallet",
    label: "E-Wallet",
  },
  {
    value: "credit_card",
    label: "Kartu Kredit",
  },
  {
    value: "investment",
    label: "Investasi",
  },
  {
    value: "other",
    label: "Lainnya",
  },
];

interface EditAccountDialogProps {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
}: EditAccountDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  // ============================================
  // FORM STATE
  // ============================================

  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [balance, setBalance] = useState(account.balance);

  // ============================================
  // LOADING STATE
  // ============================================

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // DELETE CONFIRMATION
  // ============================================

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ============================================
  // SYNC ACCOUNT → FORM
  // ============================================

  useEffect(() => {
    setName(account.name);
    setType(account.type);
    setBalance(account.balance);
  }, [account]);

  // ============================================
  // UPDATE ACCOUNT
  // ============================================

  async function handleSubmit() {
    if (!name.trim()) {
      toast({
        title: "Nama rekening wajib diisi",
        variant: "destructive",
      });

      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      // Ambil user yang sedang login
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Auth error:", userError);

        toast({
          title: "Sesi login tidak ditemukan",
          description: "Silakan login kembali.",
          variant: "destructive",
        });

        return;
      }

      // Debug
      console.log("Updating account:", {
        accountId: account.id,
        userId: user.id,
        name: name.trim(),
        type,
        balance,
      });

      // UPDATE DATABASE
      const { error } = await supabase
        .from("accounts")
        .update({
          name: name.trim(),
          type,
          balance,
        })
        .eq("id", account.id)
        .eq("user_id", user.id);

      // Jika gagal
      if (error) {
        console.error("Update account error:", error);

        toast({
          title: "Gagal memperbarui rekening",
          description: error.message,
          variant: "destructive",
        });

        return;
      }

      // Berhasil
      toast({
        title: "Rekening berhasil diperbarui",
        variant: "success",
      });

      // Tutup dialog edit
      onOpenChange(false);

      // Refresh data
      router.refresh();
    } catch (error) {
      console.error("Unexpected update error:", error);

      toast({
        title: "Terjadi kesalahan",
        description: "Tidak dapat memperbarui rekening.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================
  // DELETE ACCOUNT
  // ============================================

  async function handleDelete() {
    setDeleting(true);

    try {
      const supabase = createClient();

      // Ambil user login
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Auth error:", userError);

        toast({
          title: "Sesi login tidak ditemukan",
          description: "Silakan login kembali.",
          variant: "destructive",
        });

        return;
      }

      // DELETE DATABASE
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", account.id)
        .eq("user_id", user.id);

      // Jika gagal
      if (error) {
        console.error("Delete account error:", error);

        toast({
          title: "Gagal menghapus rekening",
          description: error.message,
          variant: "destructive",
        });

        return;
      }

      // Berhasil
      toast({
        title: "Rekening berhasil dihapus",
        variant: "success",
      });

      // Tutup confirmation dialog
      setDeleteDialogOpen(false);

      // Tutup edit dialog
      onOpenChange(false);

      // Refresh halaman
      router.refresh();
    } catch (error) {
      console.error("Unexpected delete error:", error);

      toast({
        title: "Terjadi kesalahan",
        description: "Tidak dapat menghapus rekening.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* ==========================================
          EDIT ACCOUNT DIALOG
      ========================================== */}

      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Rekening
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">

            {/* ====================================
                NAMA REKENING
            ==================================== */}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="account-name">
                Nama Rekening
              </Label>

              <Input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: BCA"
                disabled={submitting || deleting}
              />
            </div>

            {/* ====================================
                TIPE
            ==================================== */}

            <div className="flex flex-col gap-1.5">
              <Label>
                Tipe
              </Label>

              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value as AccountType)
                }
                disabled={submitting || deleting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe rekening" />
                </SelectTrigger>

                <SelectContent>
                  {TYPES.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ====================================
                SALDO
            ==================================== */}

            <div className="flex flex-col gap-1.5">
              <Label>
                Saldo
              </Label>

              <MoneyInput
                value={balance}
                onChange={setBalance}
              />
            </div>

            {/* ====================================
                BUTTON
            ==================================== */}

            <div className="flex items-center justify-between gap-2 pt-2">

              {/* HAPUS */}

              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={submitting || deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />

                {deleting
                  ? "Menghapus..."
                  : "Hapus"}
              </Button>

              {/* SIMPAN */}

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || deleting}
              >
                {submitting
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          CONFIRM DELETE
      ========================================== */}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus rekening?"
        description={`Rekening "${account.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
      />
    </>
  );
}