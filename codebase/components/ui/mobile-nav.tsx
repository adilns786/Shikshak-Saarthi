"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, BarChart3, User, Menu } from "lucide-react";
import { motion } from "framer-motion";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/forms/profile", icon: FileText, label: "Forms" },
    { href: "/dashboard/stats", icon: BarChart3, label: "Stats" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
      style={{
        background: "var(--surface-nav)",
        borderTop: "1px solid var(--border-subtle)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
      }}
    >
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0"
                  style={{ background: "var(--brand-primary-alpha10)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative flex flex-col items-center justify-center gap-1">
                <Icon
                  className="h-5 w-5"
                  style={{
                    color: isActive ? "var(--brand-primary)" : "var(--text-3)",
                  }}
                />
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isActive ? "var(--brand-primary)" : "var(--text-3)",
                  }}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
