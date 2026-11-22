import { WHATSAPP_URL } from '../../data/contact';
import { button, container } from '../ModalidadePsicoterapia/styles';
import type { AtendimentoContent } from './types';

export function AtendimentoHero({ page }: { page: Pick<AtendimentoContent, 'title' | 'intro' | 'heroImage' | 'heroAlt'> }) {
  return (
    <section className={`${container} grid items-center gap-8 pb-16 pt-10 md:grid-cols-2 md:gap-16 md:pb-20 md:pt-12`}>
      <div>
        <h1 className="max-w-[20rem] font-inria text-[33px] font-bold leading-tight text-black sm:text-[50px]">{page.title}</h1>
        <p className="mt-8 max-w-md text-base leading-relaxed sm:text-lg">{page.intro}</p>
        <a className={`${button} mt-8`} href={WHATSAPP_URL}>Agendar atendimento</a>
      </div>
      <img className="aspect-[1.28] w-full rounded-[32px] object-cover" src={page.heroImage} alt={page.heroAlt} width="600" height="470" fetchPriority="high" />
    </section>
  );
}
