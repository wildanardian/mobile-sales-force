<?php

namespace App\Enums;

enum Role: string
{
    case MR = 'mr';
    case DM = 'dm';
    case RSM = 'rsm';
    case MM = 'mm';

    public function label(): string
    {
        return match ($this) {
            self::MR => 'Medical Representative',
            self::DM => 'District Manager',
            self::RSM => 'Regional Sales Manager',
            self::MM => 'Marketing Manager',
        };
    }

    public function isPrimary(): bool
    {
        return $this === self::MR;
    }
}
