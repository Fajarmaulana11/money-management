import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: z.number().positive("Jumlah harus lebih dari 0"),
    categoryId: z.string().uuid("Kategori wajib dipilih"),
    accountId: z.string().uuid("Rekening wajib dipilih"),
    transactionDate: z.string().min(1, "Tanggal wajib diisi"),
    description: z.string().optional(),
    notes: z.string().optional(),
  });
export type TransactionInput = z.infer<typeof transactionSchema>;

export const transferSchema = z
  .object({
    fromAccountId: z.string().uuid("Rekening asal wajib dipilih"),
    toAccountId: z.string().uuid("Rekening tujuan wajib dipilih"),
    amount: z.number().positive("Jumlah harus lebih dari 0"),
    transactionDate: z.string().min(1, "Tanggal wajib diisi"),
    description: z.string().optional(),
  })
  .refine((d) => d.fromAccountId !== d.toAccountId, {
    message: "Rekening asal dan tujuan harus berbeda",
    path: ["toAccountId"],
  });
export type TransferInput = z.infer<typeof transferSchema>;

export const accountSchema = z.object({
  name: z.string().min(1, "Nama rekening wajib diisi"),
  type: z.enum(["cash", "bank", "ewallet", "credit_card", "investment", "other"]),
  balance: z.number().default(0),
  icon: z.string().optional(),
  color: z.string().optional(),
});
export type AccountInput = z.infer<typeof accountSchema>;

export const budgetItemSchema = z.object({
  categoryId: z.string().uuid("Kategori wajib dipilih"),
  amount: z.number().positive("Jumlah anggaran harus lebih dari 0"),
});

export const goalSchema = z.object({
  name: z.string().min(1, "Nama target wajib diisi"),
  targetAmount: z.number().positive("Target harus lebih dari 0"),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const recurringSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  accountId: z.string().uuid("Rekening wajib dipilih"),
  categoryId: z.string().uuid("Kategori wajib dipilih"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  nextExecutionDate: z.string().min(1, "Tanggal wajib diisi"),
});
export type RecurringInput = z.infer<typeof recurringSchema>;

export const debtSchema = z.object({
  personName: z.string().min(1, "Nama wajib diisi"),
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  type: z.enum(["i_owe", "owed_to_me"]),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});
export type DebtInput = z.infer<typeof debtSchema>;
