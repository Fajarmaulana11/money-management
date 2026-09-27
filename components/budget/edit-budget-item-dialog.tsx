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
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";

import { Trash2 } from "lucide-react";

interface EditBudgetItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  categoryName: string;
  initialAmount: number;
}

export function EditBudgetItemDialog({
  open,
  onOpenChange,
  itemId,
  categoryName,
  initialAmount,
}: EditBudgetItemDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [amount, setAmount] = useState(initialAmount);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  /*
   * Sinkronisasi nilai ketika membuka
   * budget item yang berbeda.
   */
  useEffect(() => {
    if (open) {
      setAmount(initialAmount);
    }
  }, [initialAmount, open]);

  /*
   * UPDATE ANGGARAN
   */
  async function handleSubmit() {
    if (amount <= 0) {
      toast({
        title: "Jumlah anggaran harus lebih dari 0",
        variant: "destructive",
      });

      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("budget_items")
        .update({
          amount,
        })
        .eq("id", itemId);

      if (error) {
        console.error("Update budget item error:", error);

        toast({
          title: "Gagal memperbarui anggaran",
          description: error.message,
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Anggaran berhasil diperbarui",
        variant: "success",
      });

      onOpenChange(false);

      router.refresh();
    } catch (error) {
      console.error("Unexpected update error:", error);

      toast({
        title: "Terjadi kesalahan",
        description: "Tidak dapat memperbarui anggaran.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * DELETE ANGGARAN
   */
  async function handleDelete() {
    setDeleting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("budget_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Delete budget item error:", error);

        toast({
          title: "Gagal menghapus anggaran",
          description: error.message,
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Anggaran berhasil dihapus",
        variant: "success",
      });

      setConfirmDeleteOpen(false);
      onOpenChange(false);

      router.refresh();
    } catch (error) {
      console.error("Unexpected delete error:", error);

      toast({
        title: "Terjadi kesalahan",
        description: "Tidak dapat menghapus anggaran.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Anggaran — {categoryName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">

            {/* JUMLAH ANGGARAN */}

            <div className="flex flex-col gap-1.5">
              <Label>
                Jumlah Anggaran
              </Label>

              <MoneyInput
                value={amount}
                onChange={setAmount}
              />
            </div>

            {/* BUTTON */}

            <div className="flex gap-2">

              {/* HAPUS */}

              <Button
                type="button"
                variant="outline"
                className="flex-1 text-danger"
                onClick={() =>
                  setConfirmDeleteOpen(true)
                }
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
                className="flex-1"
              >
                {submitting
                  ? "Menyimpan..."
                  : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE */}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Hapus Anggaran"
        description={`Anggaran untuk kategori "${categoryName}" akan dihapus.`}
        onConfirm={handleDelete}
      />
    </>
  );
}