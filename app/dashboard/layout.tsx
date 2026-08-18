import {
  DashboardBottomNav,
  DashboardSidebar,
  DashboardTopbar,
} from "@/components/dashboard/DashboardNav";
import { getDataContext } from "@/lib/data/context";
import { getProfile } from "@/lib/data/queries";

// El dashboard depende de la sesión del usuario: siempre dinámico.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getDataContext();
  const profile = await getProfile(ctx);
  const userName = profile.full_name || (ctx.demo ? "Carlos" : "");
  const businessName = profile.business_name;

  return (
    <div className="min-h-dvh bg-ink-50/40">
      <DashboardSidebar userName={userName} businessName={businessName} />
      <DashboardTopbar userName={userName} />
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
