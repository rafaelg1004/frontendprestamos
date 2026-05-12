'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Banknote, Wallet, ArrowLeftRight, BarChart3 } from 'lucide-react'
import styles from './BottomNav.module.css'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Inicio' },
    { href: '/personas', icon: Users, label: 'Personas' },
    { href: '/prestamos', icon: Banknote, label: 'Créditos' },
    { href: '/reportes', icon: BarChart3, label: 'Reportes' },
    { href: '/cuentas', icon: Wallet, label: 'Cuentas' },
    { href: '/movimientos', icon: ArrowLeftRight, label: 'Historial' },
  ]


  return (
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
    </nav>
  )
}
