import type { RoleName } from '../types/auth';

// Role yang punya bawahan, jadi boleh membuka halaman persetujuan
export const APPROVER_ROLES: RoleName[] = ['dm', 'rsm', 'mm'];

export const canApprove = (role: RoleName) => APPROVER_ROLES.includes(role);

export const ROLE_LABELS: Record<RoleName, string> = {
  mr: 'Medical Representative',
  dm: 'District Manager',
  rsm: 'Regional Sales Manager',
  mm: 'Marketing Manager',
};
