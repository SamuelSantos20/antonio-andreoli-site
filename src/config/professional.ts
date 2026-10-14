/**
 * Configuração central para Antônio Andreoli — Direito Previdenciário
 * Conforme decisões confirmadas no briefing de 13/10/2026.
 */

export interface ProfessionalConfig {
  modoPreview: boolean;
  nomeExibicao: string;
  nomeCompleto: string;
  descricao: string;
  oabUf: string;
  oabNumero: string;
  whatsappE164: string;
  whatsappDisplay: string;
  email: string | null;
  siteUrl: string | null;
  googleReviewUrl: string | null;
  googleMapsUrl?: string | null;
  qrImagePath: string | null;
  mensagemWhatsapp: string;
  fraseCaneta: string;
  horarioAtendimento?: string;
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    pais: string;
  };
}

export const defaultProfessionalConfig: ProfessionalConfig = {
  modoPreview: false,
  nomeExibicao: "Antônio Andreoli",
  nomeCompleto: "Antônio Andreoli",
  descricao: "Direito Previdenciário",
  oabUf: "RJ",
  oabNumero: "064430",
  whatsappE164: "+5521999623802",
  whatsappDisplay: "(21) 99962-3802",
  email: null,
  siteUrl: null,
  googleReviewUrl: null,
  qrImagePath: null,
  mensagemWhatsapp: "Olá, Antônio Andreoli. Gostaria de conversar sobre uma dúvida previdenciária.",
  fraseCaneta: "Direito com clareza.",
  horarioAtendimento: "Segunda a sexta, das 9h às 18h",
  endereco: {
    logradouro: "R. Promotor Sá Carvalho",
    numero: "292",
    bairro: "Centro",
    cidade: "Nova Iguaçu",
    uf: "RJ",
    cep: "26216-180",
    pais: "Brasil",
  },
};

/**
 * Retorna o registro OAB formatado
 */
export function getOabFormatted(config: ProfessionalConfig = defaultProfessionalConfig): string {
  return `OAB/${config.oabUf} ${config.oabNumero}`;
}

/**
 * Validação de dados de contato
 */
export function hasValidWhatsapp(config: ProfessionalConfig): boolean {
  if (!config.whatsappE164) return false;
  const digits = config.whatsappE164.replace(/\D/g, "");
  return digits.length >= 10;
}

export function hasValidEmail(config: ProfessionalConfig): boolean {
  if (!config.email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email);
}

export function hasValidGoogleReview(config: ProfessionalConfig): boolean {
  if (!config.googleReviewUrl) return false;
  try {
    const url = new URL(config.googleReviewUrl);
    return url.protocol === "https:" && !url.username && !url.password &&
      ["google.com", "google.com.br", "g.page", "maps.app.goo.gl", "goo.gl"].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

/**
 * Gera URL oficial de WhatsApp com mensagem pré-configurada
 */
export function getWhatsappLink(config: ProfessionalConfig = defaultProfessionalConfig): string {
  const digits = config.whatsappE164.replace(/\D/g, "");
  const encodedMsg = encodeURIComponent(config.mensagemWhatsapp);
  return `https://wa.me/${digits}?text=${encodedMsg}`;
}
