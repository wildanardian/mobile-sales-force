import type { RoleName } from './auth';
import type { VisitType } from './callActual';
import type { CallListStatus } from './callList';
import type { Doctor } from './master';

export type { CallListStatus, Doctor, RoleName, VisitType };

export interface DemoAccount {
  role: RoleName;
  code: string; // 'MR'
  title: string; // 'Medical Representative'
  email: string;
  password: string;
}
