export interface NavItem {
  label: string;
  icon: string;
  path: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'grid',
    path: '/dashboard',
  },
  {
    label: 'RSUD',
    icon: 'hospital',
    path: '/rsud',
    children: [
      { label: 'Antrian', icon: 'list', path: '/rsud/antrian' },
      { label: 'Dokter', icon: 'user-md', path: '/rsud/dokter' },
    ],
  },
  {
    label: 'Bapok',
    icon: 'shopping-basket',
    path: '/bapok',
    children: [
      { label: 'Harga Pasar', icon: 'chart-line', path: '/bapok/harga' },
      { label: 'Komoditas', icon: 'bell', path: '/bapok/komoditas' },
    ],
  },
  {
    label: 'Islamic Center',
    icon: 'moon',
    path: '/islamic',
    children: [
      { label: 'Acara', icon: 'calendar', path: '/islamic/acara' },
      { label: 'Booking', icon: 'building', path: '/islamic/booking' },
    ],
  },
  {
    label: 'Transjatim',
    icon: 'bus',
    path: '/transjatim',
    children: [
      { label: 'Armada', icon: 'map-pin', path: '/transjatim/armada' },
    ],
  },
];
