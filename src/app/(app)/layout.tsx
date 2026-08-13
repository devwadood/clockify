import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <AppShell
      user={{ name: user.name, email: user.email, image: user.image ?? null }}
    >
      {children}
    </AppShell>
  );
}
