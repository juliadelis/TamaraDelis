import { WHATSAPP_URL } from '../../data/contact';
import { button, container } from './styles';
import type { ModalidadeContent } from './types';

export function Hero({ page }: { page: ModalidadeContent }) {
  return (
    <section className={`${container} grid items-center gap-8 pb-16 pt-10 md:grid-cols-[1fr_40%] md:gap-12 md:pb-20 md:pt-12`}>
      <div>
        <h1 className="font-inria text-[38px] font-bold leading-tight text-[#713a20] sm:text-[50px]">{page.title}</h1>
        <p className="mt-4 text-lg text-[#713a20] sm:text-xl">{page.subtitle}</p>
        <p className="mt-8 max-w-md text-base leading-relaxed sm:text-lg">{page.intro}</p>
        <a className={`${button} mt-6`} href={WHATSAPP_URL}>Agendar atendimento</a>
      </div>
      <img className="aspect-square w-full rounded-[32px] object-cover" src={page.heroImage} alt={page.heroAlt} width="500" height="500" fetchPriority="high" />
    </section>
  );
}
