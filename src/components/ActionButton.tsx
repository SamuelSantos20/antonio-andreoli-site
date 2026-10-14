import React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

interface ActionButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "outline-sage";
  iconType?: "external" | "download";
  onClick?: () => void;
  href?: string;
  className?: string;
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  variant = "primary",
  iconType = "external",
  onClick,
  href,
  className = "",
  fullWidth = false,
}) => {
  const isPrimary = variant === "primary";

  const baseClasses = `
    inline-flex items-center justify-between px-6 py-4 sm:py-3.5 min-h-[56px] sm:min-h-[58px]
    rounded-[6px] font-sans font-semibold text-[16px] sm:text-[18px] tracking-tight
    transition-all duration-150 cursor-pointer select-none active:scale-[0.99]
    ${fullWidth ? "w-full" : "w-full sm:w-auto"}
    ${className}
  `;

  const variantClasses = isPrimary
    ? "bg-[#183F35] text-[#F5F2E9] hover:bg-[#13332b] shadow-xs"
    : variant === "outline-sage"
    ? "border-[1.5px] border-[#183F35] bg-transparent text-[#183F35] hover:bg-[#183F35]/5"
    : "border-[1.5px] border-[#183F35] bg-transparent text-[#183F35] hover:bg-[#183F35]/5";

  const renderIconBadge = () => {
    if (iconType === "external") {
      if (isPrimary) {
        return (
          <div className="w-7 h-7 rounded-[4px] bg-[#2E584D] flex items-center justify-center text-[#F5F2E9] ml-4 shrink-0">
            <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
          </div>
        );
      }
      return (
        <div className="w-7 h-7 rounded-[4px] bg-[#183F35]/15 flex items-center justify-center text-[#183F35] ml-4 shrink-0">
          <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
        </div>
      );
    }

    if (iconType === "download") {
      return (
        <div className="w-7 h-7 flex items-center justify-center text-[#183F35] ml-4 shrink-0">
          <ArrowDown className="w-4 h-4 stroke-[2.4]" />
        </div>
      );
    }

    return null;
  };

  const content = (
    <>
      <span className="text-left font-sans">{label}</span>
      {renderIconBadge()}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`${baseClasses} ${variantClasses}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {content}
    </button>
  );
};
