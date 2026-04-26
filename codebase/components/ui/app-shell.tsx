"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Settings,
  Users,
  BarChart3,
  Shield,
  Home,
  GraduationCap,
  Activity,
  ChevronDown,
  Bot,
  HelpCircle,
  Award,
  Layers,
  ClipboardList,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

/* ────────────────── Types ────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  children?: { label: string; href: string }[];
}

interface AppUser {
  id?: string;
  email: string;
  name?: string;
  full_name?: string;
  role: "faculty" | "hod" | "admin" | "misAdmin";
  department?: string;
  profile_image_url?: string;
}

interface AppShellProps {
  children: React.ReactNode;
  user?: AppUser | null;
  onSignOut?: () => void;
  /** Override the navigation items (optional – defaults per role) */
  navItems?: NavItem[];
}

interface SidebarProps {
  user?: AppUser | null;
  navItems: NavItem[];
  onSignOut?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/* ────────────────── Per-Role Navigation ────────────────── */
const facultyNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  {
    label: "PBAS Forms",
    href: "/dashboard/forms",
    icon: ClipboardList,
    children: [
      { label: "Profile / Form Header", href: "/dashboard/forms/profile" },
      { label: "Personal Info", href: "/dashboard/forms/part-a/personal-info" },
      {
        label: "Qualifications",
        href: "/dashboard/forms/part-a/qualifications",
      },
      { label: "Research Degrees", href: "/dashboard/forms/part-a/research" },
      {
        label: "Employment History",
        href: "/dashboard/forms/part-a/employment-history",
      },
      {
        label: "Teaching Experience",
        href: "/dashboard/forms/part-a/teaching-experience",
      },
      { label: "Courses & FDP", href: "/dashboard/forms/part-a/courses_fdp" },
      { label: "Teaching Assessment", href: "/dashboard/forms/part-b/table1" },
      {
        label: "Research & Contributions",
        href: "/dashboard/forms/part-b/table2",
      },
      {
        label: "Patents & Awards",
        href: "/dashboard/forms/part-b/patents_policy_awards",
      },
      {
        label: "Invited Lectures",
        href: "/dashboard/forms/part-b/invited_lectures",
      },
    ],
  },
  { label: "AI Assistant", href: "/chatbot", icon: Bot },
  { label: "Export", href: "/export", icon: Download },
  { label: "Settings", href: "/settings", icon: Settings },
];

const hodNav: NavItem[] = [
  { label: "Dashboard", href: "/hod/dashboard", icon: LayoutDashboard },
  { label: "Faculty", href: "/hod", icon: Users },
  { label: "Analytics", href: "/dashboard/stats", icon: BarChart3 },
  { label: "Activity Logs", href: "/hod/activity-logs", icon: Activity },
  { label: "Export", href: "/export", icon: Download },
  { label: "Settings", href: "/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Shield },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/dashboard/stats", icon: BarChart3 },
  { label: "Activity Logs", href: "/admin/activity-logs", icon: Activity },
  { label: "Export", href: "/export", icon: Download },
  { label: "Settings", href: "/settings", icon: Settings },
];

function getNav(role?: string, custom?: NavItem[]) {
  if (custom) return custom;
  if (role === "hod") return hodNav;
  if (role === "admin" || role === "misAdmin") return adminNav;
  return facultyNav;
}

/* ────────────────── Role Badge ────────────────── */
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string }> = {
    faculty: {
      label: "Faculty",
      color: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
    },
    hod: {
      label: "HOD",
      color: "bg-[var(--brand-accent-subtle)] text-[var(--brand-accent)]",
    },
    admin: {
      label: "Admin",
      color: "bg-[var(--brand-purple-subtle)] text-[var(--brand-purple)]",
    },
    misAdmin: {
      label: "MIS Admin",
      color: "bg-[var(--brand-purple-subtle)] text-[var(--brand-purple)]",
    },
  };
  const d = map[role] ?? {
    label: role,
    color: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        d.color,
      )}
    >
      {d.label}
    </span>
  );
}

/* ────────────────── Logo ────────────────── */
function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 select-none group"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-primary) 0%, #E04020 100%)",
          boxShadow: "var(--glow-primary)",
        }}
      >
        <GraduationCap className="w-5 h-5 text-white" />
      </div>
      <div className="overflow-hidden">
        <p
          className="text-sm font-bold leading-tight"
          style={{ color: "var(--text-1)" }}
        >
          Shikshak Sarthi
        </p>
      </div>
    </Link>
  );
}

/* ────────────────── NavLink ────────────────── */
function NavLink({
  item,
  collapsed = false,
  onClick,
  isActive = false,
  allNavItems = [],
}: {
  item: NavItem;
  collapsed?: boolean;
  onClick?: () => void;
  isActive?: boolean;
  allNavItems?: NavItem[];
}) {
  const pathname = usePathname();
  // Use passed isActive prop if provided, otherwise calculate it
  const active =
    isActive !== undefined
      ? isActive
      : pathname === item.href || pathname.startsWith(item.href + "/");
  const [open, setOpen] = useState(active);

  // Items with children render as an expandable group
  if (item.children && item.children.length > 0) {
    const anyChildActive = item.children.some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
    );
    return (
      <div>
        <button
          onClick={() => {
            if (collapsed) {
              // when sidebar collapsed, navigate to first child
              window.location.href = item.children![0].href;
            } else {
              setOpen((o) => !o);
            }
          }}
          title={collapsed ? item.label : undefined}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group select-none",
            collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5",
            anyChildActive || open
              ? "text-[var(--brand-primary)] bg-[var(--brand-primary-alpha10)]"
              : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--border-subtle)]",
          )}
        >
          <item.icon
            className={cn(
              "shrink-0 transition-transform duration-200 group-hover:scale-110",
              collapsed ? "w-5 h-5" : "w-4 h-4",
            )}
          />
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  open ? "rotate-180" : "",
                )}
              />
            </>
          )}
        </button>
        {/* Sub-items */}
        {!collapsed && open && (
          <div className="ml-6 mt-0.5 space-y-0.5 border-l border-[var(--border-default)] pl-3">
            {item.children.map((child) => {
              const childActive =
                pathname === child.href ||
                pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClick}
                  className={cn(
                    "block rounded-lg text-xs font-medium px-2 py-1.5 transition-all duration-150",
                    childActive
                      ? "text-[var(--brand-primary)] bg-[var(--brand-primary-alpha10)] font-semibold"
                      : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--border-subtle)]",
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group select-none",
        collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5",
        active
          ? "text-white shadow-sm"
          : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--border-subtle)]",
      )}
      style={
        active
          ? {
              background: "var(--brand-primary)",
              boxShadow: "var(--glow-primary)",
            }
          : {}
      }
    >
      <item.icon
        className={cn(
          "shrink-0 transition-transform duration-200 group-hover:scale-110",
          collapsed ? "w-5 h-5" : "w-4 h-4",
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] font-semibold">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

/* ────────────────── Helper: Get active item considering longer matches ────────────────── */
function getActiveItemHref(
  pathname: string,
  navItems: NavItem[],
): string | null {
  // Find the longest matching href to avoid shorter path conflicts
  let longestMatch: NavItem | null = null;
  let longestMatchLen = 0;

  for (const item of navItems) {
    const isExact = pathname === item.href;
    const isChild = pathname.startsWith(item.href + "/");

    if ((isExact || isChild) && item.href.length > longestMatchLen) {
      longestMatch = item;
      longestMatchLen = item.href.length;
    }
  }

  return longestMatch?.href || null;
}

/* ────────────────── Sidebar (desktop) ────────────────── */
function Sidebar({
  user,
  navItems,
  onSignOut,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const activeItemHref = getActiveItemHref(pathname, navItems);
  const displayName =
    user?.full_name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 overflow-hidden"
      style={{
        background: "var(--surface-nav)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-4 py-4 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          minHeight: 64,
        }}
      >
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            className="mx-auto p-2 rounded-xl hover:bg-[var(--brand-primary-alpha10)] transition-all duration-200 text-[var(--text-2)] hover:text-[var(--brand-primary)]"
            aria-label="Expand sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        ) : (
          <>
            <Logo />
            <button
              onClick={onToggleCollapse}
              className="ml-auto p-1.5 rounded-lg hover:bg-[var(--border-subtle)] transition-colors text-[var(--text-3)]"
              aria-label="Collapse sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            isActive={item.href === activeItemHref}
            allNavItems={navItems}
          />
        ))}
      </nav>

      {/* User card */}
      <div
        className="px-3 pb-4 shrink-0 space-y-2"
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "0.75rem",
        }}
      >
        {!collapsed && (
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{ background: "var(--border-subtle)" }}
          >
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={user?.profile_image_url} />
              <AvatarFallback
                className="text-xs font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-1)" }}
              >
                {displayName}
              </p>
              {user?.role && <RoleBadge role={user.role} />}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className={cn(
            "w-full text-[var(--text-3)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </motion.aside>
  );
}

/* ────────────────── Top Header ────────────────── */
function TopHeader({
  user,
  onMenuOpen,
  onSignOut,
}: {
  user?: AppUser | null;
  onMenuOpen: () => void;
  onSignOut?: () => void;
}) {
  const router = useRouter();
  const displayName =
    user?.full_name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 h-14 lg:h-16"
      style={{
        background: "var(--surface-nav)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Hamburger (mobile only) */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-[var(--border-subtle)] text-[var(--text-2)]"
        onClick={onMenuOpen}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo (mobile only) */}
      <div className="lg:hidden">
        <Logo />
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-[var(--border-subtle)] text-[var(--text-2)] transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              suppressHydrationWarning
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--border-subtle)] transition-colors"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.profile_image_url} />
                <AvatarFallback
                  className="text-xs font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p
                  className="text-xs font-semibold leading-tight"
                  style={{ color: "var(--text-1)" }}
                >
                  {displayName}
                </p>
                {user?.department && (
                  <p
                    className="text-[10px] leading-tight"
                    style={{ color: "var(--text-3)" }}
                  >
                    {user.department}
                  </p>
                )}
              </div>
              <ChevronDown className="w-3 h-3 hidden sm:block text-[var(--text-3)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground font-normal">
                {user?.email}
              </p>
              {user?.role && <RoleBadge role={user.role} />}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/* ────────────────── Mobile Drawer ────────────────── */
function MobileDrawer({
  open,
  onClose,
  user,
  navItems,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  user?: AppUser | null;
  navItems: NavItem[];
  onSignOut?: () => void;
}) {
  const displayName =
    user?.full_name || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "var(--surface-overlay)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col"
            style={{
              background: "var(--surface-nav)",
              backdropFilter: "blur(24px) saturate(1.8)",
              WebkitBackdropFilter: "blur(24px) saturate(1.8)",
              borderRight: "1px solid var(--border-subtle)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <Logo />
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--border-subtle)] text-[var(--text-3)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User info */}
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.profile_image_url} />
                  <AvatarFallback
                    className="text-sm font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-1)" }}
                  >
                    {displayName}
                  </p>
                  {user?.department && (
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      {user.department}
                    </p>
                  )}
                  {user?.role && <RoleBadge role={user.role} />}
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} onClick={onClose} />
              ))}
            </nav>

            {/* Sign out */}
            <div
              className="px-3 pb-6"
              style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "0.75rem",
              }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-[var(--text-3)] hover:text-[var(--error)] hover:bg-[var(--error-bg)]"
                onClick={() => {
                  onSignOut?.();
                  onClose();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ────────────────── Mobile Bottom Nav ────────────────── */
function BottomNav({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  // Show only first 5 items in bottom nav
  const bottomItems = navItems.slice(0, 5);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 safe-bottom"
      style={{
        height: 64,
        background: "var(--surface-nav)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {bottomItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-150"
            style={
              active
                ? { color: "var(--brand-primary)" }
                : { color: "var(--text-3)" }
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-semibold tracking-wide leading-none">
              {item.label}
            </span>
            {active && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute -bottom-px w-8 h-0.5 rounded-t-full"
                style={{ background: "var(--brand-primary)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/* ────────────────── AppShell ────────────────── */
export function AppShell({
  children,
  user,
  onSignOut,
  navItems: customNav,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navItems = getNav(user?.role, customNav);
  const router = useRouter();

  const handleSignOut =
    onSignOut ??
    (async () => {
      try {
        await firebaseSignOut(auth);
      } catch (_) {}
      router.push("/auth/login");
    });

  // Collapse drawer on route change
  const pathname = usePathname();
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="page-shell">
      {/* Desktop sidebar */}
      <Sidebar
        user={user}
        navItems={navItems}
        onSignOut={handleSignOut}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        navItems={navItems}
        onSignOut={handleSignOut}
      />

      {/* Main column — shifts right by sidebar on desktop */}
      <div
        className={cn(
          "flex flex-col min-h-svh transition-[padding-left] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
        )}
      >
        {/* Top header */}
        <TopHeader
          user={user}
          onMenuOpen={() => setDrawerOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
