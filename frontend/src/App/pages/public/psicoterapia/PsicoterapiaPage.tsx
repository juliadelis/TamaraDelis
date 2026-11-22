import { useEffect, useLayoutEffect, useRef } from 'react';
import { PublicFooter } from '../../../../shared/components/PublicFooter/PublicFooter';
import { PublicMenu } from '../../../../shared/components/PublicMenu/PublicMenu';
import { FaqCtaSection } from './components/FaqCtaSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { HeroSection } from './components/HeroSection';
import { ModalitiesSection } from './components/ModalitiesSection';
import { WhatIsPsychotherapySection } from './components/WhatIsPsychotherapySection';
import './psicoterapiaPage.css';

export function PsicoterapiaPage() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Psicoterapia Psicanalítica | Psicóloga Tamara Delis';
    return () => { document.title = previousTitle; };
  }, []);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = main.querySelectorAll('.psico-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('psico-pending');
          entry.target.classList.add('psico-visible');
        }
      });
    }, { threshold: 0.15 });

    elements.forEach((element) => {
      element.classList.add('psico-pending');
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="psico-page relative left-1/2 flex min-h-dvh w-[100vw] -translate-x-1/2 flex-col text-left">
      <meta name="description" content="Psicoterapia Psicanalítica com Tamara Delis. Um espaço para falar, pensar e compreender." />
      <PublicMenu dark />
      <main ref={mainRef}>
        <HeroSection />
        <WhatIsPsychotherapySection />
        <HowItWorksSection />
        <ModalitiesSection />
        <FaqCtaSection />
      </main>
      <div className="psico-footer"><PublicFooter /></div>
    </div>
  );
}
