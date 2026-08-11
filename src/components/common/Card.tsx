// src/components/common/Card.tsx
import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  hover = false,
}) => {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-sm border border-gray-100",
        paddingStyles[padding],
        hover && "hover:shadow-md transition-shadow duration-200",
        className,
      )}>
      {children}
    </div>
  );
};
