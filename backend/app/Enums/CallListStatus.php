<?php

namespace App\Enums;

enum CallListStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case PENDING_APPROVAL = 'pending_approval';
    case APPROVED = 'approved';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::PENDING_APPROVAL => 'Pending Approval',
            self::APPROVED => 'Approved',
        };
    }
}
