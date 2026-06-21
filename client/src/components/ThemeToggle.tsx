"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-12 bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_#ffffff] flex items-center justify-center">
        <span className="opacity-0">T</span>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-12 h-12 bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_#ffffff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all overflow-hidden group"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{
          y: isDark ? -40 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute"
      >
        <Sun className="text-black w-6 h-6" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          y: isDark ? 0 : 40,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute"
      >
        <Moon className="text-white w-6 h-6" />
      </motion.div>
    </button>
  );
}
