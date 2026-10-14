import React from "react";

interface BrandSymbolProps {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  decorative?: boolean;
}

/**
 * Símbolo preservado da base recebida do AI Studio.
 * Desenho do "A" arredondado com arco e travessão curvo.
 */
export const BrandSymbol: React.FC<BrandSymbolProps> = ({
  className = "",
  size = 40,
  color = "currentColor",
  strokeWidth = 10,
  decorative = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
    >
      <path
        d="M24 104 C24 74, 34 34, 50 18 C66 34, 76 74, 76 104"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33 76 C41 71, 59 71, 67 76"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
