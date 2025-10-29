"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@nvii/ui/lib/utils";
import { useTheme } from "next-themes";
import { useIsMounted } from "usehooks-ts";

type Theme = "light" | "dark" | "system";

type ThemeType = {
  name: Theme;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const themes: ThemeType[] = [
  { name: "light", icon: Sun },
  { name: "dark", icon: Moon },
  { name: "system", icon: Laptop },
];

const ModeToggle = () => {
  const { setTheme, theme: justTheme } = useTheme();
  const mouted = useIsMounted();

  if (!mouted) return;

  return (
    <div className="flex border p-0.5 bg-muted/50 rounded-full items-center">
      {themes.map((theme, index) => {
        return (
          <button
            key={index + theme.name}
            className={cn(
              "size-6 flex items-center justify-center relative outline-none ring-0 z-0"
            )}
            onClick={() => setTheme(theme.name)}
          >
            <span className="sr-only">{theme.name}</span>
            <theme.icon className="size-3" />
            {justTheme === theme.name && (
              <motion.div
                layoutId="selected-theme"
                className="absolute size-full bg-background  rounded-full -z-10 border"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
