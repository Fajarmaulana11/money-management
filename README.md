# Monefy Personal

Aplikasi Personal Money Management — Next.js (App Router) + Supabase.

## Fitur

- Autentikasi (register, login, forgot/reset password) via Supabase Auth, RLS penuh per user
- CRUD transaksi (income/expense/transfer) dengan validasi, transfer atomik via RPC
- Multi-rekening dengan saldo yang otomatis ter-update via trigger database
- Kategori default + custom
- Dashboard: total saldo, cash flow, distribusi pengeluaran, transaksi terbaru
- Budget bulanan per kategori dengan status (normal/warning/almost/over)
- Financial goals dengan progress tracking
- Transaksi berulang (create/pause/resume/delete)
- Hutang & piutang dengan histori pembayaran
- Laporan dengan filter periode
- Search & filter transaksi, export CSV
- Responsive: sidebar (desktop) + bottom nav & FAB (mobile), dark mode, PWA installable

## Tech Stack

Next.js 14 (App Router, TS) · Tailwind CSS · Radix UI primitives (shadcn-style) · Recharts ·
Supabase (Postgres + Auth + RLS) · React Hook Form + Zod · date-fns · next-pwa

## Instalasi

```bash
npm install
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Setup Supabase

1. Buat project baru di https://supabase.com
2. Jalankan migration:
   ```bash
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
   atau tempel isi `supabase/migrations/0001_init.sql` lalu `0002_default_categories.sql`
   di Supabase Studio → SQL Editor, secara berurutan.
3. Auth → Providers: aktifkan Email (default sudah aktif). Set Site URL & Redirect URLs
   (untuk reset password) ke domain deploy Anda, mis. `https://your-app.vercel.app/reset-password`.
4. (Opsional, dev only) Buat 1 user via Studio, lalu jalankan `supabase/seed.sql` dengan
   mengganti `:demo_user_id` dengan UUID user tersebut.
5. Regenerate tipe TypeScript dari schema asli (menggantikan placeholder di `types/database.ts`):
   ```bash
   npx supabase gen types typescript --project-id <project-ref> > types/database.ts
   ```

## Development

```bash
npm run dev
npm run type-check
npm run build
```

## Deploy ke Vercel

1. Push repo ke GitHub
2. Import project di Vercel
3. Set Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Catatan Arsitektur

- Semua tabel dengan `user_id` diproteksi Row Level Security — user hanya bisa
  melihat/mengubah data miliknya sendiri.
- Saldo rekening dihitung otomatis oleh trigger database saat transaksi
  dibuat/diubah/dihapus (bukan dihitung ulang di client) — konsisten meski
  diakses dari banyak client.
- Transfer antar rekening menggunakan RPC `create_transfer` (atomic, tidak
  pernah dihitung sebagai income/expense).
- `types/database.ts` masih placeholder (`any`) — jalankan `supabase gen types`
  setelah migration di-push agar type-safety Supabase client penuh.
- Icon PWA (`public/icons/icon-192.png`, `icon-512.png`) perlu ditambahkan manual.
