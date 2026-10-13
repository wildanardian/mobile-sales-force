<?php

namespace App\Enums;

enum VisitType: string
{
    case PLANNED    = 'planned';
    case UNPLAN     = 'unplan';
    case NON_TARGET = 'non_target';
}
