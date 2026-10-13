import type { RoleName } from './auth';
import type { CallList } from './callList';
import type { Doctor } from './master';

export type ApprovalTab = 'pending' | 'approved' | 'rejected';

export type ApprovalDecision = 'approved' | 'rejected';

// Pengaju call list
export interface Applicant {
  id: number;
  name: string;
  role: RoleName;
}

export interface ApprovalDoctor extends Doctor {
  address: string;
}

// Baris GET /call-lists/pending-approval (CallListResource dengan relasi user)
export interface PendingCallList extends Omit<CallList, 'doctors' | 'last_rejection' | 'approvals'> {
  user: Applicant;
  doctors: ApprovalDoctor[];
}

// Baris GET /call-lists/decisions: keputusan yang dibuat user login
export interface DecisionRecord {
  id: number; // id baris call_list_approvals
  call_list_id: number;
  decision: ApprovalDecision;
  reason: string | null;
  decided_at: string; // ISO 8601 (UTC)
  period: string; // 'YYYY-MM'
  doctors_count: number; // jumlah dokter call list SAAT INI, bukan saat diputuskan
  user: Applicant;
}
