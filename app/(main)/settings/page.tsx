import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />
      <div className="px-4 pb-8 md:px-8">
        <h1 className="mb-4 text-xl font-semibold">Pengaturan</h1>
        <SettingsClient profile={profile} email={user!.email ?? ""} />
      </div>
    </div>
  );
}
