import React from "react";
import { BrandSymbol } from "./BrandSymbol";

interface BrandLogoProps {
  variant?: "dark" | "light";
  className?: string;
  symbolSize?: number;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "dark",
  className = "",
  symbolSize = 34,
  showSubtitle = true,
}) => {
  const isLight = variant === "light";
  const nameColor = isLight ? "text-[#F5F2E9]" : "text-[#183F35]";
  const subtitleColor = isLight ? "text-[#DCE5D9]" : "text-[#52645C]";
  const symbolColor = isLight ? "#F5F2E9" : "#183F35";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <BrandSymbol size={symbolSize} color={symbolColor} strokeWidth={9} />
      <div className="flex flex-col leading-tight">
        <span className={`font-serif text-[20px] sm:text-[22px] font-medium tracking-tight ${nameColor}`}>
          Antônio Andreoli
        </span>
        {showSubtitle && (
          <span className={`font-sans text-[11px] sm:text-[12px] font-normal mt-0.5 tracking-wide ${subtitleColor}`}>
            Direito Previdenciário
          </span>
        )}
      </div>
    </div>
  );
};
