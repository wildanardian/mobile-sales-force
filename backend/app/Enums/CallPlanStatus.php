<?php

namespace App\Enums;

enum CallPlanStatus: string
{
    case PLANNED = 'planned';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PLANNED => 'Planned',
            self::CANCELLED => 'Cancelled',
        };
    }
}
