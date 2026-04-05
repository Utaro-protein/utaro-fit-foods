import Link from "next/link";
import { AuthLinks } from "./AuthLinks";
import { SidebarNav } from "./SidebarNav";

export function AppSidebar() {
  return (
    <aside className="hidden h-screen border-r border-zinc-200 bg-white md:sticky md:top-0 md:flex md:flex-col md:self-start">
      <div className="flex h-full flex-col px-4 py-5">
        <Link href="/" className="text-lg font-bold tracking-tight text-emerald-700">
          うたろうフィットフード
        </Link>
        <p className="mt-1 text-xs font-medium text-zinc-500">Fit Foods Guide</p>

        <div className="mt-6">
          <SidebarNav />
        </div>

        <div className="mt-4">
          <AuthLinks />
        </div>
      </div>
    </aside>
  );
}
