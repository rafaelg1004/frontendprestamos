"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Banknote,
  TrendingUp,
  ArrowLeftRight,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { authApi } from "@/lib/api";
import styles from "./Sidebar.module.css";

const menuItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/personas", icon: Users, label: "Personas" },
  { href: "/prestamos", icon: Banknote, label: "Préstamos" },
  { href: "/inversiones", icon: TrendingUp, label: "Inversiones" },
  { href: "/movimientos", icon: ArrowLeftRight, label: "Movimientos" },
];

export function Sidebar({ collapsed = false, onToggle }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = "/login";
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <button
        onClick={onToggle}
        className={styles.toggleButton}
        title={collapsed ? "Expandir" : "Colapsar"}
      >
        {collapsed ? (
          <ChevronRight className={styles.toggleIcon} />
        ) : (
          <ChevronLeft className={styles.toggleIcon} />
        )}
      </button>

      <div className={styles.header}>
        <h1 className={styles.logo}>Préstamos</h1>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
              title={item.label}
            >
              <Icon className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
          title="Cerrar Sesión"
        >
          <LogOut className={styles.icon} />
          <span className={styles.label}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
