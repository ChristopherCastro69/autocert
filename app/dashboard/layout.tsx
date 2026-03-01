export const dynamic = "force-dynamic";

import { OrgProvider } from "@/components/context/OrgContext";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrgProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </OrgProvider>
  );
}
