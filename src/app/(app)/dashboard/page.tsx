import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireUser } from "@/lib/auth/session";
import { getDashboardData } from "@/db/queries/dashboard";
export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  return <DashboardView data={data} name={user.name}/>;
}
