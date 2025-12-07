// components/ui/DynamicComponent.tsx
import dynamic from 'next/dynamic';

/**
 * Lazy load administrativos que no son críticos
 */
export const LazyAdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })),
  { 
    loading: () => <div className="p-8 text-center">Cargando dashboard...</div>,
    ssr: false,
  }
);

/**
 * Lazy load booking que se usa solo en ciertas rutas
 */
export const LazyBookingCalendar = dynamic(
  () => import('@/components/booking/BookingCalendar').then(mod => ({ default: mod.BookingCalendar })),
  {
    loading: () => <div className="p-8 text-center">Cargando calendario...</div>,
  }
);
