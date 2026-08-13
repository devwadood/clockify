import { SettingsView } from "@/components/settings/settings-view";
import { requireUser } from "@/lib/auth/session";

export default async function Page() {
  const user = await requireUser();
  return (
    <SettingsView
      user={{ name: user.name, email: user.email, image: user.image ?? null }}
    />
  );
}
