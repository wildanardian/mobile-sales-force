import type { Doctor } from './master';

export type CallListStatus = 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected';

export interface CallListRejection {
  reason: string;
  decided_at: string; // ISO 8601 (UTC)
}

export interface CallListApproval {
  decision: 'approved' | 'rejected';
  reason: string | null;
  decided_at: string; // ISO 8601 (UTC)
  approver_name: string | null;
}

// Bentuk CallListResource di backend
export interface CallList {
  id: number;
  period: string; // 'YYYY-MM'
  status: CallListStatus;
  created_at: string; // ISO 8601 (UTC)
  submitted_at: string | null;
  // Terisi hanya selama masih draft hasil penolakan terakhir
  last_rejection: CallListRejection | null;
  doctors: Doctor[];
  approvals?: CallListApproval[]; // hanya dari GET /call-lists/{id}, terbaru di atas
}

// Body POST /call-lists
export interface CreateCallListPayload {
  period: string; // 'YYYY-MM'
  doctor_ids: number[];
}

// Body PATCH /call-lists/{id}/resubmit (period tidak bisa diubah)
export interface UpdateCallListPayload {
  doctor_ids: number[];
}

// Body PATCH /call-lists/{id}/approve. Backend memakai nama field `status`;
// `reason` wajib bila rejected (maksimal 1000 karakter di backend).
export interface DecideCallListPayload {
  status: 'approved' | 'rejected';
  reason?: string;
}
