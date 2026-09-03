"use client";

import React, { useEffect, useRef } from "react";

interface InteractiveSeismicCanvasProps {
  className?: string;
  hazardType?: string;
}

export function InteractiveSeismicCanvas({
  className = "",
  hazardType = "earthquake",
}: InteractiveSeismicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let mouseX = canvas.offsetWidth / 2;
    let mouseY = canvas.offsetHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let isHovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Epicenter anchor points (e.g. Barpak Gorkha relative on canvas)
    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      const displayW = canvas.offsetWidth;
      const displayH = canvas.offsetHeight;

      ctx.clearRect(0, 0, displayW, displayH);

      // 1. Tactical Coordinate Grid
      const gridSize = 48;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";

      for (let x = 0; x < displayW; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, displayH);
        ctx.stroke();
      }

      for (let y = 0; y < displayH; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(displayW, y);
        ctx.stroke();
      }

      // 2. Primary Epicenter Anchor (Barpak Gorkha)
      const epicX = displayW * 0.48;
      const epicY = displayH * 0.45;

      // Draw concentric propagating P-wave and S-wave rings
      const waveCount = 5;
      const maxRadius = Math.max(displayW, displayH) * 0.7;

      for (let i = 0; i < waveCount; i++) {
        const progress = ((time * 0.35 + i / waveCount) % 1);
        const r = progress * maxRadius;
        const alpha = Math.max(0, (1 - progress) * 0.25);

        // Distort ring slightly based on mouse proximity
        ctx.beginPath();
        const segments = 64;
        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2;
          let currentR = r;

          // Influence from mouse position
          const px = epicX + Math.cos(angle) * r;
          const py = epicY + Math.sin(angle) * r;
          const distToMouse = Math.hypot(px - mouseX, py - mouseY);
          if (distToMouse < 180 && isHovered) {
            const push = (1 - distToMouse / 180) * 14;
            currentR += push * Math.sin(angle * 3 + time * 4);
          }

          const x = epicX + Math.cos(angle) * currentR;
          const y = epicY + Math.sin(angle) * currentR;

          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = `rgba(225, 29, 72, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 3. Radar Sweep Line
      const sweepAngle = (time * 0.8) % (Math.PI * 2);
      const sweepLength = maxRadius * 0.65;
      const endX = epicX + Math.cos(sweepAngle) * sweepLength;
      const endY = epicY + Math.sin(sweepAngle) * sweepLength;

      const grad = ctx.createLinearGradient(epicX, epicY, endX, endY);
      grad.addColorStop(0, "rgba(225, 29, 72, 0.4)");
      grad.addColorStop(0.7, "rgba(225, 29, 72, 0.1)");
      grad.addColorStop(1, "rgba(225, 29, 72, 0)");

      ctx.beginPath();
      ctx.moveTo(epicX, epicY);
      ctx.arc(epicX, epicY, sweepLength, sweepAngle - 0.25, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // 4. Epicenter Core Reticle
      ctx.beginPath();
      ctx.arc(epicX, epicY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#E11D48";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(epicX, epicY, 8 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(225, 29, 72, 0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crosshairs at epicenter
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(epicX - 16, epicY);
      ctx.lineTo(epicX - 6, epicY);
      ctx.moveTo(epicX + 6, epicY);
      ctx.lineTo(epicX + 16, epicY);
      ctx.moveTo(epicX, epicY - 16);
      ctx.lineTo(epicX, epicY - 6);
      ctx.moveTo(epicX, epicY + 6);
      ctx.lineTo(epicX, epicY + 16);
      ctx.stroke();

      // Coordinates text at epicenter
      ctx.font = "9px ui-monospace, monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText("28°13'N, 84°45'E // BARPAK", epicX + 12, epicY - 10);

      // Dynamic cursor reticle if hovered
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 18, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(96, 165, 250, 0.35)";
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hazardType]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
    />
  );
}
