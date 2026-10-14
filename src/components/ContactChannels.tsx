import React from "react";
import { OfficeAddress } from './OfficeAddress';
import { ProfessionalConfig, hasValidWhatsapp, hasValidEmail, getWhatsappLink } from "../config/professional";

interface ContactChannelsProps {
  config: ProfessionalConfig;
  className?: string;
  onPlaceholderClick?: (channel: "email") => void;
}

export const ContactChannels: React.FC<ContactChannelsProps> = ({
  config,
  className = "",
  onPlaceholderClick,
}) => {
  const whatsappActive = hasValidWhatsapp(config);
  const emailActive = hasValidEmail(config);

  const whatsappDisplay = config.whatsappDisplay || "(21) 99962-3802";
  const whatsappUrl = getWhatsappLink(config);

  return (
    <div className={`space-y-6 sm:space-y-7 ${className}`}>
      {/* WhatsApp (Canal Confirmado e Real) */}
      <div className="border-b border-[#C5D0C3] pb-3 sm:pb-4">
        <span className="block text-sm sm:text-[15px] text-[#52645C] font-sans mb-1 font-normal">
          WhatsApp
        </span>
        {whatsappActive ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xl sm:text-2xl font-medium text-[#183F35] hover:underline transition-colors"
          >
            {whatsappDisplay}
          </a>
        ) : (
          <span className="font-sans text-xl sm:text-2xl font-medium text-[#183F35]">
            {whatsappDisplay}
          </span>
        )}
      </div>

      {/* E-mail (Exibido apenas quando endereço estiver confirmado, conforme diretriz) */}
      {emailActive && (
        <div className="border-b border-[#C5D0C3] pb-3 sm:pb-4">
          <span className="block text-sm sm:text-[15px] text-[#52645C] font-sans mb-1 font-normal">
            E-mail
          </span>
          <a
            href={`mailto:${config.email}`}
            className="font-sans text-xl sm:text-2xl font-medium text-[#183F35] hover:underline transition-colors"
          >
            {config.email}
          </a>
        </div>
      )}

      <OfficeAddress config={config} />
      {!config.endereco && <div className="text-xs text-[#52645C] font-sans pt-1">
        Atendimento direto e individualizado mediante agendamento prévio.
      </div>}
    </div>
  );
};
