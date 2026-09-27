"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import * as Icons from "lucide-react";
import type { Account } from "@/types/domain";
import { EditAccountDialog } from "./edit-account-dialog";

const ICON_MAP: Record<string, string> = {
  cash: "Banknote",
  bank: "Landmark",
  ewallet: "Wallet",
  credit_card: "CreditCard",
  investment: "TrendingUp",
  other: "CircleDollarSign",
};

export function AccountCard({
  account,
}: {
  account: Account;
}) {
  const [editOpen, setEditOpen] = useState(false);

  const Icon =
    (Icons as any)[ICON_MAP[account.type]] ??
    Icons.Wallet;

  return (
    <>
      {/* ==========================================
          ACCOUNT CARD
      ========================================== */}

      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => setEditOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            setEditOpen(true);
          }
        }}
      >
        <CardContent className="flex items-center gap-3 p-4">

          {/* ICON */}

          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                (account.color ?? "#2563EB") + "20",
            }}
          >
            <Icon
              className="h-5 w-5"
              style={{
                color: account.color ?? "#2563EB",
              }}
            />
          </div>

          {/* ACCOUNT INFO */}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {account.name}
            </p>

            <p className="text-xs capitalize text-muted">
              {account.type.replace("_", " ")}
            </p>
          </div>

          {/* BALANCE */}

          <p className="shrink-0 text-sm font-semibold">
            {formatCurrency(account.balance)}
          </p>

          {/* EDIT ICON */}

          <Icons.Pencil
            className="h-4 w-4 shrink-0 text-muted-foreground"
          />
        </CardContent>
      </Card>

      {/* ==========================================
          EDIT ACCOUNT DIALOG
      ========================================== */}

      <EditAccountDialog
        account={account}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}