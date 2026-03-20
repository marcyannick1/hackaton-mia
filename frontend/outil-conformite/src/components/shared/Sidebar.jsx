import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

const NAV_ITEMS = [
  { to: "/conformite", label: "Conformite", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> },
  { to: "/admin", label: "Admin", adminOnly: true, icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS.filter(i => !i.adminOnly || user?.role === "admin");
  return (
    <aside className="w-56 flex flex-col bg-white border-r border-slate-200 h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <span className="text-sm font-semibold text-slate-800 tracking-tight">DocFlow Conformite</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}>
            {item.icon}{item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 flex-shrink-0">
            {user?.nom?.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{user?.nom}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
