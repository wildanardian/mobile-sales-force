import type { DemoAccount } from '../types/msf';

// Kredensial akun demo, sama dengan backend/database/seeders/UserSeeder.php.
// Hanya untuk lingkungan demo/pengembangan.
const DEMO_PASSWORD = 'password';

export const demoAccounts: DemoAccount[] = [
  { role: 'mr', code: 'MR', title: 'Medical Representative', email: 'mr@gmail.com', password: DEMO_PASSWORD },
  { role: 'dm', code: 'DM', title: 'District Manager', email: 'dm@gmail.com', password: DEMO_PASSWORD },
  { role: 'rsm', code: 'RSM', title: 'Regional Sales Manager', email: 'rsm@gmail.com', password: DEMO_PASSWORD },
  { role: 'mm', code: 'MM', title: 'Marketing Manager', email: 'mm@gmail.com', password: DEMO_PASSWORD },
];
