"use client";

import { useEffect } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") ||
      "light";

    document.documentElement.setAttribute(
      "data-theme",
      savedTheme
    );
  }, []);

  return <>{children}</>;
}