import { WHATSAPP_URL } from '../../../../../shared/data/contact';

export function HeroSection() {
  return (
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
  );
}
