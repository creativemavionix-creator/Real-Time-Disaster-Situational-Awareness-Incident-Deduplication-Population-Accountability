export type SeverityTier = "CRITICAL" | "ELEVATED" | "MODERATE" | "SAFE";

export interface SectorSeverityStyle {
  tier: SeverityTier;
  label: string;
  badgeText: string;
  color: string;
  badgeClass: string;
  pillClass: string;
  selectedClass: string;
  dotClass: string;
  haloColor: string;
}

/**
 * Single source of truth for Sector operational status, risk tiers, and semantic styling.
 * Harmonizes the Map markers, bottom selector bar, drawer header, and risk index rating card.
 */
export function getSectorSeverity(
  status?: string,
  severityIndex?: number,
  threatTier?: string
): SectorSeverityStyle {
  const tierUpper = (threatTier || "").toUpperCase();
  const isDamaged = status === "verified_damaged";
  const isSafe = status === "verified_safe" || tierUpper === "VERIFIED_SAFE";
  const sev = severityIndex ?? (isDamaged ? 7.5 : isSafe ? 1.0 : 3.0);

  // 1. Explicit verified safe confirmation or score below 2.5 with normal telemetry
  if (isSafe || (sev < 2.5 && !isDamaged && (tierUpper.includes("NORMAL") || tierUpper.includes("SAFE")))) {
    return {
      tier: "SAFE",
      label: tierUpper.includes("NORMAL") ? "NORMAL TELEMETRY" : "VERIFIED SAFE",
      badgeText: "SAFE",
      color: "#10B981",
      badgeClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      pillClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
      selectedClass: "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-lg shadow-emerald-950/30",
      dotClass: "bg-[#10B981]",
      haloColor: "transparent",
    };
  }

  // 2. Critical Zone (Calculated R >= 7.0 or critical threat tier)
  if (sev >= 7.0 || tierUpper.includes("CRITICAL")) {
    return {
      tier: "CRITICAL",
      label: isDamaged ? "VERIFIED CRITICAL DAMAGE" : "CRITICAL BLACKOUT",
      badgeText: isDamaged ? "DAMAGED" : "BLACKOUT",
      color: "#EF4444",
      badgeClass: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      pillClass: "bg-rose-500/10 border-rose-500/20 text-[#FB7185] hover:bg-rose-500/20",
      selectedClass: "bg-rose-500/20 border-rose-400 text-rose-300 font-bold shadow-lg shadow-rose-950/30",
      dotClass: "bg-[#EF4444] animate-ping",
      haloColor: "#EF4444",
    };
  }

  // 3. Elevated Zone (Calculated 5.0 <= R < 7.0 or elevated/high threat tier)
  if (sev >= 5.0 || tierUpper.includes("ELEVATED") || tierUpper.includes("HIGH")) {
    return {
      tier: "ELEVATED",
      label: isDamaged ? "VERIFIED DAMAGE (ELEVATED)" : "ELEVATED SILENT RISK",
      badgeText: isDamaged ? "DAMAGED" : "ELEVATED",
      color: "#F59E0B",
      badgeClass: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      pillClass: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20",
      selectedClass: "bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-lg shadow-amber-950/30",
      dotClass: "bg-[#F59E0B]",
      haloColor: "#F59E0B",
    };
  }

  // 4. Moderate Zone (Calculated 2.5 <= R < 5.0, moderate anomaly/risk, or general unverified)
  if (sev >= 2.5 || tierUpper.includes("MODERATE") || (sev >= 2.0 && status === "unverified") || status === "blackout" || isDamaged) {
    return {
      tier: "MODERATE",
      label: isDamaged
        ? "VERIFIED DAMAGE (MODERATE)"
        : tierUpper.includes("ANOMALY")
        ? "MODERATE ANOMALY"
        : "MODERATE RISK",
      badgeText: isDamaged ? "DAMAGED" : "MODERATE",
      color: "#EAB308",
      badgeClass: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
      pillClass: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20",
      selectedClass: "bg-yellow-500/20 border-yellow-400 text-yellow-300 font-bold shadow-lg shadow-yellow-950/30",
      dotClass: "bg-[#EAB308]",
      haloColor: "transparent",
    };
  }

  // 5. Normal Telemetry baseline (Calculated R < 2.5)
  return {
    tier: "SAFE",
    label: "NORMAL TELEMETRY",
    badgeText: "SAFE",
    color: "#10B981",
    badgeClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    pillClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
    selectedClass: "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-lg shadow-emerald-950/30",
    dotClass: "bg-[#10B981]",
    haloColor: "transparent",
  };
}
