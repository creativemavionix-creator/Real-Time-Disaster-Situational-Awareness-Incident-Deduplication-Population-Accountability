"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isPointer = window.getComputedStyle(target).cursor === "pointer";
      const isInteractiveTag = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
      const isClickable = target.onclick != null;
      
      if (isPointer || isInteractiveTag || isClickable) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  if (!isMounted || isTouchDevice) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        * { cursor: none !important; }
      `}} />
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[10000] mix-blend-difference items-center justify-center hidden sm:flex"
        animate={{
          x: mousePosition.x - (isHovering ? 24 : 8),
          y: mousePosition.y - (isHovering ? 24 : 8),
          opacity: isVisible ? 1 : 0
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      >
        <motion.div
          animate={{
            width: isHovering ? 48 : 16,
            height: isHovering ? 48 : 16,
            backgroundColor: "#FFFFFF",
            scale: isHovering ? 1.2 : 1
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="rounded-full"
        />
      </motion.div>
    </>
  );
}
