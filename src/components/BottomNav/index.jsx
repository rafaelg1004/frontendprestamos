'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Banknote, Wallet, ArrowLeftRight, TrendingUp, LogOut } from 'lucide-react'
import { authApi } from "@/lib/api"
import { LogoutModal } from "../LogoutModal"
import styles from './BottomNav.module.css'

export function BottomNav() {
  const pathname = usePathname()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Inicio' },
    { href: '/prestamos', icon: Banknote, label: 'Créditos' },
    { href: '/inversiones', icon: TrendingUp, label: 'Inversiones' },
    { href: '/cuentas', icon: Wallet, label: 'Cuentas' },
    { href: '/movimientos', icon: ArrowLeftRight, label: 'Historial' },
  ]

  const handleLogout = async () => {
    try {
      await authApi.logout()
      window.location.href = "/login"
    } catch (error) {
      window.location.href = "/login"
    }
  }

  return (
    <>
      <nav className={styles.bottomNav}>
        {navItems.map((item) => {
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
