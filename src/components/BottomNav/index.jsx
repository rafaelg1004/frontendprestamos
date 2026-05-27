'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Banknote, Wallet, ArrowLeftRight, TrendingUp, LogOut } from 'lucide-react'
import { authApi } from "@/lib/api"
import { LogoutModal } from "../LogoutModal"
import styles from './BottomNav.module.css'

export function BottomNav() {
  const pathname = usePathname()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const [userPermisos, setUserPermisos] = useState(null)

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio', requirePermiso: 'ver_reportes' },
    { href: '/prestamos', icon: Banknote, label: 'Créditos', requirePermiso: 'ver_prestamos' },
    { href: '/inversiones', icon: TrendingUp, label: 'Inversiones', requirePermiso: 'ver_inversiones' },
    { href: '/cuentas', icon: Wallet, label: 'Cuentas', requirePermiso: 'gestionar_caja' },
    { href: '/movimientos', icon: ArrowLeftRight, label: 'Historial', requirePermiso: 'gestionar_caja' },
  ]

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
      await authApi.logout()
      window.location.href = "/"
    } catch (error) {
      window.location.href = "/"
    }
  }

  return (
    <>
      <nav className={styles.bottomNav}>
        {userPermisos !== null && navItems.map((item) => {
          // Filtrar por permisos
          if (item.requirePermiso && !userPermisos.includes(item.requirePermiso) && !userPermisos.includes('superadmin')) {
            return null;
          }

          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={24} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          )
        })}
        
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className={styles.navItem}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={24} />
          <span className={styles.label}>Salir</span>
        </button>
      </nav>

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
