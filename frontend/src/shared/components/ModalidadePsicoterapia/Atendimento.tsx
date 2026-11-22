import { WHATSAPP_URL } from '../../data/contact';
import { button, container, heading } from './styles';
import type { Modalidade, ModalidadeContent } from './types';

export function Atendimento({ page, modalidade }: { page: ModalidadeContent; modalidade: Modalidade }) {
  return (
    <section className={`${container} py-16 md:py-24`}>
      <div className="grid gap-8 md:grid-cols-[35%_1fr] md:gap-16">
        <h2 className={heading}>{page.howTitle}</h2>
        <ul className="space-y-6">
          {page.details.map(({ icon: Icon, text }) => (
            <li className="flex items-start gap-5" key={text}>
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#ffdec6] text-[#713a20]">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <p className="pt-1 text-base leading-relaxed sm:text-lg">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 grid items-start gap-8 md:mt-24 md:grid-cols-[40%_1fr] md:gap-16">
        <img className={`${modalidade === 'presencial' ? 'aspect-square' : 'aspect-[2]'} w-full rounded-[32px] object-cover`} src={page.audienceImage} alt={page.audienceAlt} width="500" height={modalidade === 'presencial' ? 500 : 250} loading="lazy" decoding="async" />
        <div>
          <h2 className="text-xl font-semibold">Para quem é indicada?</h2>
          <p className="mt-4 text-base leading-relaxed sm:text-lg">{page.audienceText}</p>
          {page.concerns && (
            <ul className="mt-5 list-disc space-y-1 pl-5 text-base marker:text-[#713a20] sm:text-lg">
              {page.concerns.map((concern) => <li key={concern}>{concern}</li>)}
            </ul>
          )}
          <a className={`${button} mt-6`} href={WHATSAPP_URL}>Agendar sessão</a>
        </div>
      </div>

      {modalidade === 'online' && (
        <div className="mt-16 flex flex-col items-start gap-6 rounded-[32px] bg-[#a8bfd0] p-8 sm:flex-row sm:items-center sm:gap-12">
          <img className="h-24 w-24 shrink-0 object-contain" src="/img/online/brasil.svg" alt="" width="96" height="96" loading="lazy" />
          <div>
            <h2 className="text-xl font-semibold">Psicoterapia online no Brasil</h2>
            <p className="mt-3 text-base leading-relaxed sm:text-lg">Você pode entrar em contato de qualquer lugar. A modalidade online permite o atendimento psicológico à distância, respeitando os requisitos profissionais aplicáveis.</p>
          </div>
        </div>
      )}
    </section>
  );
}
