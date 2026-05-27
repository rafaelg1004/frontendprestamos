"use client";

import { useState, useEffect } from "react";
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
  Wallet,
  Calculator,
  BarChart3,
  Key,
  Shield
} from "lucide-react";

import { authApi } from "@/lib/api";
import { LogoutModal } from "../LogoutModal";
import styles from "./Sidebar.module.css";

const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", requirePermiso: "ver_reportes" },
  { href: "/personas", icon: Users, label: "Personas" }, // Public for everyone who can log in
  { href: "/prestamos", icon: Banknote, label: "Préstamos", requirePermiso: "ver_prestamos" },
  { href: "/reportes", icon: BarChart3, label: "Reportes", requirePermiso: "ver_reportes" },
  { href: "/simulador", icon: Calculator, label: "Simulador" },
  { href: "/inversiones", icon: TrendingUp, label: "Inversiones", requirePermiso: "ver_inversiones" },
  { href: "/cuentas", icon: Wallet, label: "Cuentas", requirePermiso: "gestionar_caja" },
  { href: "/movimientos", icon: ArrowLeftRight, label: "Movimientos", requirePermiso: "gestionar_caja" },
  { href: "/admins", icon: Shield, label: "Admins", requirePermiso: "gestionar_usuarios" },
  { href: "/cambiar-password", icon: Key, label: "Contraseña" },
];

export function Sidebar({ collapsed = false, onToggle }) {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userPermisos, setUserPermisos] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.me();
        if (response.data?.data?.user?.permisos) {
          setUserPermisos(response.data.data.user.permisos);
        } else {
          setUserPermisos([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserPermisos([]);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      window.location.href = "/";
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.requirePermiso) return true;
    if (userPermisos === null) return false; // Hide until loaded
    return userPermisos.includes(item.requirePermiso);
  });

  return (
    <>
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
          <div className={styles.logoIcon}>
            <Banknote size={24} />
          </div>
          <h1 className={styles.logo}>Préstamos</h1>
        </div>

        <nav className={styles.nav}>
          {filteredMenuItems.map((item) => {
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
            onClick={() => setIsLogoutModalOpen(true)}
            className={styles.logoutButton}
            title="Cerrar Sesión"
          >
            <LogOut className={styles.icon} />
            <span className={styles.label}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
}
