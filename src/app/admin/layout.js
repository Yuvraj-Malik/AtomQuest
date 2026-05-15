import { Sidebar } from "@/components/layout/Sidebar";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar role="admin" />
      <div className="ml-[240px] flex flex-col min-h-screen">
        <header className="h-[60px] border-b border-border flex items-center justify-between px-10 bg-surface">
          <h1 className="text-[14px] font-medium text-secondary">Admin Portal</h1>
          <RoleSwitcher currentRole="admin" />
        </header>
        <main className="flex-1 px-10 py-8">
          <div className="max-w-[1140px] mx-auto w-full page-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
