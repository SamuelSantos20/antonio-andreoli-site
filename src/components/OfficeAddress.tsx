import type { ProfessionalConfig } from '../config/professional';

export function OfficeAddress({ config }: { config: ProfessionalConfig }) {
  const endereco = config.endereco;
  if (!endereco) return null;

  return <div className="office-address">
    <span className="contact-channel">ATENDIMENTO PRESENCIAL</span>
    <address>
      {endereco.logradouro}, {endereco.numero}<br />
      {endereco.bairro} · {endereco.cidade} — {endereco.uf}<br />
      CEP {endereco.cep}
    </address>
    {config.horarioAtendimento && <p>{config.horarioAtendimento}<br />Mediante agendamento prévio.</p>}
    {!config.horarioAtendimento && <p>Mediante agendamento prévio.</p>}
  </div>;
}
