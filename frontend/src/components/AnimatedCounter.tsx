"use client";

/**
 * AnimatedCounter — GPU-safe, no React state re-render on every frame.
 *
 * Uses a ref + direct DOM text mutation so the animation loop never
 * triggers a React re-render cycle. The component re-mounts cleanly
 * when `value` changes (useEffect dependency).
 */
import React, { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  isDecimal?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 1800,
  suffix = "",
  isDecimal = false,
}: AnimatedCounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      if (spanRef.current) {
        spanRef.current.textContent =
          (isDecimal ? value.toFixed(2) : Math.round(value).toString()) + suffix;
      }
      return;
    }

    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo — buttery deceleration
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = value * ease;

      if (spanRef.current) {
        spanRef.current.textContent =
          (isDecimal ? current.toFixed(2) : Math.round(current).toString()) + suffix;
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration, suffix, isDecimal]);

  const initial = isDecimal ? (0).toFixed(2) : "0";

  return (
    <span
      ref={spanRef}
      aria-label={`${isDecimal ? value.toFixed(2) : Math.round(value)}${suffix}`}
    >
      {initial}{suffix}
    </span>
  );
}
