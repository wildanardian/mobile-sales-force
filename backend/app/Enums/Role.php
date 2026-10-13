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

    public function approverRole(): ?self
    {
        return match ($this) {
            self::MR => self::DM,
            self::DM => self::RSM,
            self::RSM => self::MM,
            self::MM => null,
        };
    }

    public function subordinateRole(): ?self
    {
        return match ($this) {
            self::MR => null,
            self::DM => self::MR,
            self::RSM => self::DM,
            self::MM => self::RSM,
        };
    }

    public function isPrimary(): bool
    {
        return $this === self::MR;
    }
}
