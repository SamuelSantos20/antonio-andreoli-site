/**
 * Utilitário para exportação de vCard 3.0 padronizado
 * Gera arquivo vcf compatível com iOS, Android e clientes de email.
 */

import { hasValidWhatsapp, hasValidEmail } from "../config/professional";
import type { ProfessionalConfig } from "../config/professional";

export function generateVCard(config: ProfessionalConfig): string | null {
  if (!hasValidWhatsapp(config) && !hasValidEmail(config)) {
    return null;
  }

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(config.nomeCompleto)}`,
    `N:Andreoli;Antônio;;;`,
    `TITLE:${escapeVCard(config.descricao)}`,
    `NOTE:${escapeVCard(`Advogado Previdenciário - OAB/${config.oabUf} ${config.oabNumero}`)}`,
  ];

  if (config.whatsappE164) {
    const digits = config.whatsappE164.replace(/\D/g, "");
    lines.push(`TEL;TYPE=CELL,VOICE,PREF:+${digits}`);
  }

  if (config.email && hasValidEmail(config)) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${config.email}`);
  }

  if (config.endereco) {
    const { logradouro, numero, bairro, cidade, uf, cep, pais } = config.endereco;
    const addressParts = ['', '', `${logradouro}, ${numero} - ${bairro}`, cidade, uf, cep, pais];
    lines.push(`ADR;TYPE=WORK:${addressParts.map(escapeVCard).join(';')}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function downloadVCard(config: ProfessionalConfig): boolean {
  const vcardText = generateVCard(config);
  if (!vcardText) return false;

  const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "antonio-andreoli.vcf";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}
