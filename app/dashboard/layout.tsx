import {
  DashboardBottomNav,
  DashboardSidebar,
  DashboardTopbar,
} from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-ink-50/40">
      <DashboardSidebar />
      <DashboardTopbar />
      {/* pb para dejar espacio a la navegación inferior en móvil */}
      <div className="lg:pl-64">
        <main className="container-page py-6 pb-28 lg:py-8 lg:pb-10">
          {children}
        </main>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
