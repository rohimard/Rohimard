import { redirect } from "next/navigation";
import { getCurrentAdminProfile } from "@/lib/data/admin";
import { AdminSidebar } from "@/components/admin/Sidebar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdminProfile();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-crema-50 lg:flex-row">
      <AdminSidebar email={admin.user.email ?? ""} />
      <main className="flex-1 overflow-x-hidden p-5 sm:p-8">{children}</main>
    </div>
  );
}
