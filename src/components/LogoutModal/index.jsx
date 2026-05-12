"use client";

import { LogOut, X, AlertCircle } from "lucide-react";
import styles from "./LogoutModal.module.css";

export function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={20} />
        </button>
        
        <div className={styles.iconContainer}>
          <LogOut size={32} className={styles.logoutIcon} />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>¿Cerrar Sesión?</h2>
          <p className={styles.description}>
            Estás a punto de salir del sistema. Tendrás que ingresar tus credenciales nuevamente para acceder.
          </p>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.btnCancel}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={styles.btnConfirm}>
            Sí, Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
