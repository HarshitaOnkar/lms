import { BottomNav } from "../../components/dashboard/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-neutral-100">
      <div className="pb-24 pt-[env(safe-area-inset-top)]">{children}</div>
      <BottomNav />
    </div>
  );
}
