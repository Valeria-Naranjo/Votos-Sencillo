<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Participation;
use App\Models\User;
use Carbon\CarbonImmutable;

/** Central election eligibility rules. Event window boundaries are inclusive. */
class ElectionRules
{
    public const TIMEZONE = 'America/Mexico_City';

    public function now(): CarbonImmutable
    {
        return CarbonImmutable::now(self::TIMEZONE);
    }

    public function eventIsOpen(?Event $event, ?CarbonImmutable $at = null): bool
    {
        if (!$event || !$event->active || !$event->starts_at || !$event->ends_at) return false;
        $at ??= $this->now();
        $start = CarbonImmutable::parse($event->starts_at, self::TIMEZONE);
        $end = CarbonImmutable::parse($event->ends_at, self::TIMEZONE);
        return $at->greaterThanOrEqualTo($start) && $at->lessThanOrEqualTo($end);
    }

    public function districtFor(User $user): ?int
    {
        $casilla = $user->casilla;
        return $casilla && $casilla->active && $casilla->district !== null ? (int) $casilla->district : null;
    }

    public function participationDistrictMatches(Participation $participation, ?int $district): bool
    {
        return $district !== null && (int) $participation->user?->casilla?->district === $district;
    }
}
