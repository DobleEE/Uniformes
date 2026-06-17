import { NavLink } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { navItems } from "./navItems";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <aside
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
      className={`hidden md:flex fixed left-0 top-0 bottom-0 flex-col transition-[width] duration-300 ease-in-out z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className="px-4 py-5 flex items-center"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <img
          src="/images/logo.jpg"
          alt="Uniformes D'Johanna"
          className={`h-9 w-auto object-contain transition-all duration-300 ${collapsed ? 'h-8' : ''}`}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-100 whitespace-nowrap ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "text-accent"
                  : "hover:bg-[var(--color-surface-2)]"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'var(--color-accent-light)',
                    borderLeft: '2px solid var(--color-accent)',
                    paddingLeft: collapsed ? undefined : 10,
                    color: 'var(--color-accent)',
                  }
                : {
                    color: 'var(--color-text-secondary)',
                  }
            }
          >
            <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 space-y-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
        {/* User info */}
        <div
          className={`overflow-hidden transition-[opacity,max-height] duration-300 ${
            collapsed ? "opacity-0 max-h-0" : "opacity-100 max-h-20"
          }`}
        >
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: 'var(--color-accent)' }}
              title={`${user?.email} — ${user?.role}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p
                className="text-[13px] font-medium truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {user?.email}
              </p>
              <p className="text-[11px] capitalize" style={{ color: 'var(--color-text-muted)' }}>
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Colapsar */}
        <button
          onClick={onToggle}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed ? (
            <ChevronRight className="h-[18px] w-[18px]" />
          ) : (
            <ChevronLeft className="h-[18px] w-[18px]" />
          )}
          {!collapsed && "Colapsar menú"}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors hover:bg-red-50 hover:text-red-600 whitespace-nowrap ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
