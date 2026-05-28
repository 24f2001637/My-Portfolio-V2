import React from "react";
import * as LucideIcons from "lucide-react";

// Get all icon keys that start with an uppercase letter and are not helper functions
export const ALL_ICONS = Object.keys(LucideIcons).filter(
  (key) => key.charAt(0) === key.charAt(0).toUpperCase() && key !== "createReactComponent"
);

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function DynamicIcon({ name, size = 16, className }: DynamicIconProps) {
  if (!name) return null;

  // Normalize string to match PascalCase name format (e.g. "code-2" -> "Code2", "brain" -> "Brain")
  const PascalCaseName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const IconComponent = (LucideIcons as any)[PascalCaseName] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
}
