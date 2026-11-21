import { useEffect, useLayoutEffect, useRef } from 'react';
import { FiMessageSquare, FiUser } from 'react-icons/fi';
import { PublicFooter } from '../../../../shared/components/PublicFooter/PublicFooter';
import { PublicMenu } from '../../../../shared/components/PublicMenu/PublicMenu';
import { WHATSAPP_URL } from '../../../../shared/data/contact';
import './psicoterapiaPage.css';

const faqItems = [
  {
    icon: FiMessageSquare,
    title: 'O que acontece na primeira sessão?',
    description: 'O primeiro encontro é um momento para conhecer a demanda que levou você à psicoterapia, conversar sobre o que está acontecendo e compreender se aquele espaço pode ser adequado às suas necessidades. <br/><br/> Você não precisa chegar com um diagnóstico ou saber exatamente como explicar o que sente.'
  },
  {
    icon: FiUser,
    title: 'Psicoterapia não é dar conselhos',
    description: 'O trabalho psicológico não consiste em dizer ao paciente o que ele deve fazer.<br/><br/> A psicoterapia oferece um espaço de escuta e reflexão para que a própria pessoa possa compreender melhor suas experiências e ampliar sua capacidade de escolha.'
  }
];

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
        {/* Hero */}
        <section className="psico-hero">
          <div className="psico-hero-inner">
            <div className="psico-hero-copy psico-reveal">
              <h1 className="font-inria font-bold text-[33px] md:text-[50px]">Psicoterapia Psicanalítica</h1>
              <p className="font-inria text-[24px] md:text-[30px]">Um espaço para falar, pensar e compreender.</p>
            </div>
            <div className="psico-hero-text psico-reveal">
              <p className="text-[18px]">A psicoterapia é um espaço de diálogo entre psicólogo e paciente. É nesse espaço que sentimentos, pensamentos, conflitos, relações e experiências podem ser elaborados em privacidade e observação de sigilo profissional.</p>
            </div>
            <div className="psico-hero-cta psico-reveal">
              <a href={WHATSAPP_URL}>Agendar atendimento</a>
            </div>
          </div>
        </section>

        {/* O que é */}
        <section className="psico-what">
          <div className="psico-what-inner">
            <img className="psico-what-image psico-reveal" src="/img/psico/img-2.png" alt="Ilustração abstrata" width="300" height="300" loading="lazy" decoding="async" />
            <div className="psico-reveal">
              <h2 className="font-inria font-bold text-[33px] md:text-[40px] mb-8">O que é a psicoterapia?</h2>
              <div className="psico-copy">
                <p className="text-[18px]">A Psicoterapia Psicanalítica considera tanto àquilo que conseguimos reconhecer como àquilo que se mostra encobrindo-se à consciência.</p>
                <p className="text-[18px]">Ao longo do processo, podem-se abrir caminhos de elaboração de conflitos internos e experiências que continuam produzindo efeitos no presente.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="psico-how">
          <div className="psico-how-inner">
            <div className="psico-how-header">
              <h2 className="psico-how-title psico-reveal font-inria font-bold text-[33px] md:text-[40px]">Como funciona a psicoterapia?</h2>
              <div className="psico-how-description psico-reveal">
                <p className="text-[18px]">As sessões acontecem, em geral, semanalmente e têm duração aproximada de 50 minutos.</p>
                <p className="text-[18px]">O processo é construído de maneira individualizada, considerando a demanda, a história e o momento de cada paciente.</p>
                <p className="text-[18px]">Não existe um número pré-determinado de sessões que funcione para todas as pessoas.</p>
              </div>
            </div>
            <div className="psico-how-cards">
              {faqItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="psico-how-card psico-reveal">
                    <div className="flex gap-4 items-center ">
                      <IconComponent className="psico-how-icon" />
                      <h3 className="text-[24px] font-semibold">{item.title}</h3>
                    </div>
                    <div >
                      
                      <p className="text-[18px]" dangerouslySetInnerHTML={{ __html: item.description }}></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Modalidades */}
        <section className="psico-modalities">
          <div className="psico-modalities-inner">
            <h2 className=" font-inria font-bold text-[33px] md:text-[40px] text-center psico-reveal mb-4">Modalidades de atendimento</h2>
            <p className="psico-modalities-subtitle text-[18px] psico-reveal">A psicoterapia pode ser realizada presencialmente em Itapetininga e Sorocaba, ou de forma online, conforme a sua necessidade.</p>
            <div className="psico-modalities-cards">
              <div className="psico-modalities-card psico-reveal">
                <img src="/img/psico/presencial.png" alt="Atendimento presencial" width="400" height="300" loading="lazy" decoding="async" />
                <div className="psico-modalities-card-content">
                  <h3 className="text-[20px] font-semibold mb-4">Psicoterapia presencial</h3>
                  <p className="text-[18px] mb-4">Atendimento psicológico em consultório, num ambiente acolhedor e seguro para conversarmos sobre aquilo que te traz até aqui.</p>
                  <a href={WHATSAPP_URL}>Saiba mais</a>
                </div>
              </div>
              <div className="psico-modalities-card psico-reveal">
                <img src="/img/psico/online.png" alt="Atendimento online" width="400" height="300" loading="lazy" decoding="async" />
                <div className="psico-modalities-card-content">
                  <h3 className="text-[20px] font-semibold mb-4">Psicoterapia online</h3>
                  <p className="text-[18px] mb-4">Acompanhamento psicológico por meio digital, com a mesma segurança e qualidade de atendimento do espaço físico.</p>
                  <a href={WHATSAPP_URL}>Saiba mais</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="psico-faq-cta">
          <div className="psico-faq-cta-inner">
            <h2 className="psico-reveal font-inria font-bold text-[33px] md:text-[40px] text-center mb-4">Talvez você ainda tenha dúvidas</h2>
            <p className="psico-reveal text-[18px] mb-4">Confira as perguntas mais frequentes sobre o processo, os valores, sessão e atendimento.</p>
            <a href="/duvidas" className="psico-faq-cta-button psico-reveal">Ver dúvidas frequentes</a>
          </div>
        </section>

       
      </main>
      <div className="psico-footer"><PublicFooter /></div>
    </div>
  );
}
