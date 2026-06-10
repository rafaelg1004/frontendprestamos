"use client";

import { useEffect, useState, useMemo } from "react";
import { inversionesApi, api } from "@/lib/api";
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Users,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import styles from "./InversionesView.module.css";
import { InversionForm } from "../InversionForm";
import { InversionDetalleView } from "../InversionDetalleView";

export function InversionesView() {
  const [inversiones, setInversiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInversionId, setSelectedInversionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("activas");
  const [expandedGroups, setExpandedGroups] = useState({});

  const openDetalle = (id) => {
    setSelectedInversionId(id);
    setShowDetailModal(true);
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const fetchInversiones = async () => {
    try {
      setLoading(true);
      const { data } = await inversionesApi.getAll();
      
      const dataWithDetails = await Promise.all(
        (data.data || []).map(async (inv) => {
          try {
            const detail = await inversionesApi.getById(inv.id);
            return detail.data?.data;
          } catch (e) {
            return inv;
          }
        })
      );
      
      setInversiones(dataWithDetails);
    } catch (error) {
      console.error("Error fetching inversiones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInversiones();
  }, []);

  // Filter and group investments
  const groupedInversiones = useMemo(() => {
    // 1. Filter by status (Tab)
    let filtered = inversiones.filter((inv) => {
      if (activeTab === "activas") return inv.estado === "activo" || inv.estado === "activa";
      if (activeTab === "finalizadas") return inv.estado === "finalizado" || inv.estado === "finalizada";
      return true;
    });

    // 2. Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((inv) => 
        inv.inversionista?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Group by inversionista_id
    const groups = {};
    filtered.forEach((inv) => {
      const invId = inv.inversionista?.id || 'unknown';
      if (!groups[invId]) {
        groups[invId] = {
          inversionista: inv.inversionista,
          inversiones: []
        };
      }
      groups[invId].inversiones.push(inv);
    });

    // Sort investments within each group: ones with accumulated interest first
    Object.values(groups).forEach(group => {
      group.inversiones.sort((a, b) => (b.calculos?.interes_sugerido || 0) - (a.calculos?.interes_sugerido || 0));
      group.has_intereses = group.inversiones.some(inv => (inv.calculos?.interes_sugerido || 0) > 0);
      group.total_intereses = group.inversiones.reduce((sum, inv) => sum + (inv.calculos?.interes_sugerido || 0), 0);
    });

    // Return array of groups, sorted by has_intereses first, then by inversionista name
    return Object.values(groups).sort((a, b) => {
      if (a.has_intereses && !b.has_intereses) return -1;
      if (!a.has_intereses && b.has_intereses) return 1;
      if (a.has_intereses && b.has_intereses) {
        return (b.total_intereses || 0) - (a.total_intereses || 0);
      }
      const nameA = a.inversionista?.nombre_completo || '';
      const nameB = b.inversionista?.nombre_completo || '';
      return nameA.localeCompare(nameB);
    });
  }, [inversiones, activeTab, searchTerm]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Analizando inversiones y compromisos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Gestión de Inversiones</h1>
          <p className={styles.subtitle}>Control de capital y pagos de rendimientos</p>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={() => setShowModal(true)} 
            className={styles.btnPrimary}
          >
            <Plus size={20} />
            Nueva Inversión
          </button>
        </div>
      </div>

      <InversionForm 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSuccess={fetchInversiones}
      />

      <InversionDetalleView 
        id={selectedInversionId}
        isModal={true}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedInversionId(null);
        }}
      />

      <div className={styles.controlsSection}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'activas' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('activas')}
          >
            Activas
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'finalizadas' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('finalizadas')}
          >
            Finalizadas
          </button>
        </div>
        
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Buscar inversionista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.groupedList}>
        {groupedInversiones.length > 0 ? (
          groupedInversiones.map((group, groupIdx) => {
            const groupId = group.inversionista?.id || groupIdx.toString();
            const isExpanded = expandedGroups[groupId];
            
            return (
              <div key={groupId} className={styles.groupContainer}>
                <div 
                  className={`${styles.groupHeader} ${group.has_intereses ? styles.groupHeaderActive : ''}`} 
                  onClick={() => toggleGroup(groupId)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.groupHeaderLeft}>
                    <div className={styles.groupAvatar}>
                      {group.inversionista?.nombre_completo?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className={styles.groupInfo}>
                      <h2 className={styles.groupName}>{group.inversionista?.nombre_completo || 'Inversionista Desconocido'}</h2>
                      <span className={styles.groupCount}>
                        <Users size={14} />
                        {group.inversiones.length} {group.inversiones.length === 1 ? 'contrato' : 'contratos'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.groupHeaderRight}>
                    {group.has_intereses && (
                      <div className={styles.groupInterestBadge}>
                        <TrendingUp size={14} />
                        <span>{formatCurrency(group.total_intereses)}</span>
                      </div>
                    )}
                    {isExpanded ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.grid}>
                {group.inversiones.map((inv) => (
                  <div key={inv.id} className={`${styles.card} ${(inv.calculos?.interes_sugerido || 0) > 0 ? styles.cardActive : ''}`}>
                    <div className={styles.cardMain}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardTitleRow}>
                          <h3 className={styles.investmentId}>Contrato #{inv.id.slice(0, 8)}</h3>
                          <span className={`${styles.badge} ${inv.estado === 'activo' || inv.estado === 'activa' ? styles.badgeSuccess : styles.badgeInfo}`}>
                            {inv.estado}
                          </span>
                        </div>
                        <p className={styles.userMeta}>Creado: {formatDate(inv.fecha_inversion)}</p>
                      </div>
                      
                      <div className={styles.stats}>
                        <div className={styles.stat}>
                          <span className={styles.statLabel}>Interés Sugerido</span>
                          <span className={styles.statValue} style={{ color: inv.calculos?.en_mora ? '#ef4444' : '#1e293b' }}>
                            {formatCurrency(inv.calculos?.interes_sugerido || 0)}
                          </span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statLabel}>Disponible</span>
                          <span className={styles.statValue}>
                            {formatCurrency(inv.calculos?.disponible_en_cuenta || 0)}
                          </span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statLabel}>Cap. Pendiente</span>
                          <span className={styles.statValue}>
                            {formatCurrency(inv.calculos?.capital_pendiente || 0)}
                          </span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statLabel}>Tasa Mensual</span>
                          <span className={styles.statValue}>
                            {inv.tasa_interes_pactada}%
                          </span>
                        </div>
                      </div>

                      <div className={styles.footer}>
                        <div className={styles.nextPay}>
                          {inv.estado === 'finalizado' || inv.estado === 'finalizada' ? (
                            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> Pagado
                            </span>
                          ) : inv.calculos?.en_mora ? (
                            <span style={{ color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={14} /> Vencido
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={14} /> Corte: {formatDate(inv.calculos?.proxima_fecha_pago)}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => openDetalle(inv.id)}
                          className={styles.btnAction}
                        >
                          Gestionar
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.empty}>
            <CheckCircle2 size={48} color="#10b981" />
            <p>No se encontraron inversiones en esta vista.</p>
          </div>
        )}
      </div>
    </div>
  );
}
