"use client";

import React, { createContext, useContext, useEffect } from "react";

interface ThemeContextType {
  theme: "dark";
  isDark: true;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Permanently enforce dark mode
    document.documentElement.classList.add("dark");
    try {
      localStorage.removeItem("prism_theme");
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: "dark",
        isDark: true,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
