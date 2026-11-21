import { useEffect, useLayoutEffect, useRef } from 'react';
import { PublicFooter } from '../../../../shared/components/PublicFooter/PublicFooter';
import { PublicMenu } from '../../../../shared/components/PublicMenu/PublicMenu';
import { WHATSAPP_URL } from '../../../../shared/data/contact';
import './aboutPage.css';

const education = [
  { year: '2011', description: 'Graduação em Psicologia' },
  { year: '2013', description: 'Pós-graduação em Psicoterapia Breve Operacionalizada' },
  { year: '2017', description: 'Especialização em Psicoterapia Psicanalítica' },
];

export function AboutPage() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Sobre mim | Psicóloga Tamara Delis';
    return () => { document.title = previousTitle; };
  }, []);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = main.querySelectorAll('.about-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('about-pending');
          entry.target.classList.add('about-visible');
        }
      });
    }, { threshold: 0.15 });

    elements.forEach((element) => {
      element.classList.add('about-pending');
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="about-page relative left-1/2 flex min-h-dvh w-[100vw] -translate-x-1/2 flex-col text-left">
      <meta name="description" content="Conheça a trajetória e a forma de trabalhar da psicóloga clínica Tamara Delis." />
      <PublicMenu cream />
      <main ref={mainRef}>
        <section className="about-hero">
          <div className="about-hero-inner">
            <div className="about-hero-copy about-reveal">
              <h1 className="max-w-xl font-inria font-bold text-[33px] md:text-[50px] leading-tight text-[#121c24] min-[420px] ">Psicóloga Tamara Delis</h1>
              <p className="mt-2 font-inria text-base text-[#17232c] text-[24px] md:text-[30px]">Psicóloga Clínica | Psicoterapia Psicanalítica</p>
            </div>
            <img className="about-hero-image about-reveal" src="/img/abt-me/hero.png" alt="Psicóloga Tamara Delis" width="732"  fetchPriority="high" />
          </div>
        </section>

        <section className="about-purpose">
          <div className="about-purpose-inner">
            <div className="about-reveal">
              <h2 className="font-inria font-bold text-[33px] md:text-[40px] mb-6">Propósito em cada detalhe</h2>
              <div className="text-[18px] ">
                <p>Minha trajetória na Psicologia é construída a partir do interesse pela compreensão do ser humano, de suas relações, conflitos, escolhas e formas singulares de experimentar a vida.</p>
                <br />
                <p>Na prática clínica, encontro diariamente histórias diferentes, demandas diferentes e maneiras diferentes de lidar com o sofrimento.</p>
                 <br />
                <p>Por isso, compreendo a psicoterapia como um processo que não deve ser conduzido a partir de respostas prontas.</p>
                 <br />
                <p>Cada pessoa precisa encontrar um espaço no qual possa falar sobre sua própria experiência e, gradualmente, construir novas formas de compreendê-la.</p>
              </div>
            </div>
            <img className="about-purpose-image about-reveal" src="/img/abt-me/flowe_2.png" alt="Flor abstrata em tons de azul e laranja" width="551" height="731" loading="lazy" decoding="async" />
          </div>
        </section>

        <section className="about-education">
          <div className="about-education-inner">
            <div className="about-education-intro about-reveal">
              <h2 className='font-inria font-bold text-[33px] md:text-[40px]'>Minha formação</h2>
              <p className="text-[18px]" >Minha formação continua por meio de estudos, supervisão e aperfeiçoamento profissional.</p>
            </div>
            <ol className="about-timeline about-reveal">
              {education.map(({ year, description }) => (
                <li className="about-timeline-item about-reveal" key={year}>
                  <span className="about-timeline-year">{year}</span>
                  <p className="text-[20px]">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="about-approach">
          <div className="about-approach-inner">
            <div className="about-approach-copy about-reveal">
              <h2 className="font-inria font-bold text-[33px] md:text-[40px]">Minha forma de trabalhar</h2>
              <div className="about-copy">
                <p>Na psicoterapia, busco oferecer uma escuta atenta, ética e respeitosa.</p>
                
                <p>O trabalho clínico parte daquilo que o paciente traz para a sessão e da construção gradual de uma compreensão sobre sua experiência.</p>
                 
                <p>Não se trata apenas de falar sobre os problemas.</p>
              
                <p>Trata-se de poder olhar para eles, compreender como se constituíram e perceber quais possibilidades podem existir a partir dessa compreensão.</p>
              </div>
              <a href={WHATSAPP_URL} className="about-button">Conheça a psicoterapia</a>
            </div>
          </div>
        </section>
      </main>
      <div className="about-footer"><PublicFooter /></div>
    </div>
  );
}
