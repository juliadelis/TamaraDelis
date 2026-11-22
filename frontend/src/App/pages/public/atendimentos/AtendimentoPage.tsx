import { useEffect } from 'react';
import { AtendimentoHero } from '../../../../shared/components/AtendimentoPublico/AtendimentoHero';
import { ConcernsSection } from '../../../../shared/components/AtendimentoPublico/ConcernsSection';
import { ContactSection } from '../../../../shared/components/AtendimentoPublico/ContactSection';
import { Feature } from '../../../../shared/components/ModalidadePsicoterapia/Feature';
import { PublicFooter } from '../../../../shared/components/PublicFooter/PublicFooter';
import { PublicMenu } from '../../../../shared/components/PublicMenu/PublicMenu';
import { atendimentoContent } from './content';
import type { Publico } from './content';

export function AtendimentoPage({ publico }: { publico: Publico }) {
  const page = atendimentoContent[publico];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${page.title} | Psicóloga Tamara Delis`;
    return () => { document.title = previousTitle; };
  }, [page.title]);

  return (
    <div className="relative left-1/2 flex min-h-dvh w-[100vw] -translate-x-1/2 flex-col bg-[#fff0de] text-left text-[#28241f]">
      <meta name="description" content={page.intro} />
      <PublicMenu cream />
      <main>
        <AtendimentoHero page={page} />
        <Feature page={page} />
        <ConcernsSection page={page} />
        <ContactSection />
      </main>
      <div className="pt-12"><PublicFooter /></div>
    </div>
  );
}
