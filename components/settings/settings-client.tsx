"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import type { Profile } from "@/types/domain";

export function SettingsClient({ profile, email }: { profile: Profile | null; email: string }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [currency, setCurrency] = useState(profile?.currency ?? "IDR");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function saveProfile() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: fullName, currency }).eq("user_id", profile?.user_id);
    setSaving(false);
    if (error) {
      toast({ title: "Gagal menyimpan pengaturan", variant: "destructive" });
      return;
    }
    toast({ title: "Pengaturan berhasil disimpan.", variant: "success" });
    router.refresh();
  }

  function applyTheme(value: "light" | "dark" | "system") {
    setTheme(value);
    const root = document.documentElement;
    if (value === "dark") root.classList.add("dark");
    else if (value === "light") root.classList.remove("dark");
    else root.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Card>
        <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nama Lengkap</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <Button onClick={saveProfile} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Profil"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preferensi</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Mata Uang</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR — Rupiah</SelectItem>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tampilan</CardTitle></CardHeader>
        <CardContent>
          <Select value={theme} onValueChange={(v) => applyTheme(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Terang</SelectItem>
              <SelectItem value="dark">Gelap</SelectItem>
              <SelectItem value="system">Ikuti Sistem</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={handleLogout}>Keluar</Button>
    </div>
  );
}
