"use client";
import React, { useEffect, useState } from "react";

export function AnimatedCounter({ value, duration = 2000, suffix = "", isDecimal = false }: { value: number, duration?: number, suffix?: string, isDecimal?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo curve for buttery slow-down at the end
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(value * ease);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const formatted = isDecimal ? count.toFixed(2) : Math.round(count).toString();

  return <span>{formatted}{suffix}</span>;
}
