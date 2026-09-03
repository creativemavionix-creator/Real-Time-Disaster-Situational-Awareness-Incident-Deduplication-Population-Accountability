"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ViewMode = "command" | "analysis";

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  toggleMode: () => void;
  isAnalysis: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("disaster_fog_view_mode");
        if (saved === "command" || saved === "analysis") {
          return saved;
        }
      } catch {}
    }
    return "command";
  });

  const setMode = (newMode: ViewMode) => {
    setModeState(newMode);
    localStorage.setItem("disaster_fog_view_mode", newMode);
  };

  const toggleMode = () => {
    setMode(mode === "command" ? "analysis" : "command");
  };

  return (
    <ViewModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isAnalysis: mode === "analysis",
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
