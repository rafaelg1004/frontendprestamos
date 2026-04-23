# Frontend - Sistema de Préstamos e Inversiones

Frontend construido con **Next.js 14**, **React** y **CSS Modules**.

## Características

- **Next.js 14** con App Router
- **React** con JSX (sin TypeScript)
- **CSS Modules** para estilos encapsulados
- **Conexión al Backend** mediante API REST
- **React Hot Toast** para notificaciones

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── layout.jsx         # Layout principal con Sidebar
│   │   ├── page.jsx           # Dashboard (importa DashboardView)
│   │   ├── globals.css        # Estilos globales
│   │   ├── clientes/
│   │   │   └── page.jsx       # Importa ClientesView
│   │   ├── prestamos/
│   │   │   └── page.jsx       # Importa PrestamosView
│   │   ├── inversionistas/
│   │   │   └── page.jsx       # Importa InversionistasView
│   │   ├── inversiones/
│   │   │   └── page.jsx       # Importa InversionesView
│   │   └── movimientos/
│   │       └── page.jsx       # Importa MovimientosView
│   ├── components/            # Componentes con CSS Modules
│   │   ├── Sidebar/
│   │   │   ├── index.jsx
│   │   │   └── Sidebar.module.css
│   │   ├── DashboardView/
│   │   │   ├── index.jsx
│   │   │   └── DashboardView.module.css
│   │   ├── ClientesView/
│   │   │   ├── index.jsx
│   │   │   └── ClientesView.module.css
│   │   ├── PrestamosView/
│   │   │   ├── index.jsx
│   │   │   └── PrestamosView.module.css
│   │   ├── InversionistasView/
│   │   │   ├── index.jsx
│   │   │   └── InversionistasView.module.css
│   │   ├── InversionesView/
│   │   │   └── index.jsx
│   │   └── MovimientosView/
│   │       └── index.jsx
│   └── lib/
│       ├── api.js             # API client (axios) - conecta al backend
│       └── utils.js           # Utilidades (formatos, cálculos)
├── package.json
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

> **Nota:** Las páginas en `app/` están vacías (solo importan componentes). Toda la lógica está en `components/`.

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo en `http://localhost:3000`
- `npm run build` - Compila para producción
- `npm start` - Inicia servidor de producción
- `npm run lint` - Ejecuta ESLint

## Páginas

| Ruta              | Descripción                              |
| ----------------- | ---------------------------------------- |
| `/`               | Dashboard con estadísticas y alertas     |
| `/clientes`       | Gestión de clientes                      |
| `/prestamos`      | Gestión de préstamos con alertas de mora |
| `/inversionistas` | Gestión de inversionistas                |
| `/inversiones`    | Gestión de inversiones                   |
| `/movimientos`    | Registro de movimientos                  |

## Componentes Principales

### DashboardStats

Muestra tarjetas con métricas clave:

- Total de clientes
- Capital en la calle
- Deuda con inversionistas
- Préstamos en mora

### RecentMovements

Lista los últimos 5 movimientos financieros con indicadores de entrada/salida.

### AlertsSection

Muestra alertas de préstamos próximos a vencer o ya vencidos.

### Sidebar

Navegación lateral con acceso a todas las secciones.

## Integración con Backend

El frontend se conecta al backend mediante:

1. **Supabase Auth** - Autenticación de usuarios
2. **API REST** - Comunicación con el backend Node.js

Los endpoints están configurados en `src/lib/api.ts`.

## Utilidades

### Formateo de Moneda

```typescript
import { formatCurrency } from "@/lib/utils";
formatCurrency(150000); // "$150.000,00"
```

### Formateo de Fechas

```typescript
import { formatDate, formatDateTime } from "@/lib/utils";
formatDate("2024-01-15"); // "15/01/2024"
```

### Cálculo de Mora

```typescript
import { calcularDiasMora } from "@/lib/utils";
const dias = calcularDiasMora("2024-01-01"); // días de retraso
```

## Personalización

### Colores

Los colores principales están definidos en `tailwind.config.js`:

- Primary: Azul
- Success: Verde
- Warning: Amarillo/Naranja
- Danger: Rojo

### Componentes de UI

Clases utilitarias en `globals.css`:

- `.card` - Tarjeta con sombra
- `.btn-primary` - Botón principal
- `.btn-secondary` - Botón secundario
- `.btn-danger` - Botón de peligro
- `.input` - Campo de entrada
- `.badge` - Etiqueta de estado

## Siguientes Pasos para Completar

1. **Crear páginas faltantes:**
   - `/app/inversionistas/page.tsx`
   - `/app/inversiones/page.tsx`
   - `/app/movimientos/page.tsx`
   - Formularios de creación (`/nuevo`)

2. **Agregar gráficos:**
   - Usar `react-chartjs-2` en el dashboard

3. **Mejorar UI:**
   - Agregar paginación en tablas
   - Filtros avanzados
   - Exportar a Excel/PDF

4. **Autenticación:**
   - Página de login (`/app/login/page.tsx`)
   - Proteger rutas privadas

## Notas

- Todas las cantidades se manejan en **milunidades** (1000 = $1.00)
- El frontend detecta automáticamente si las vistas SQL están disponibles
- Las notificaciones usan `react-hot-toast`

## Licencia

MIT
