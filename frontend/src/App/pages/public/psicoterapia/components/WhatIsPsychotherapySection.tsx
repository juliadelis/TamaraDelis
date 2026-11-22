export function WhatIsPsychotherapySection() {
  return (
    <section className="psico-what">
      <div className="psico-what-inner">
        <img
          className="psico-what-image psico-reveal"
          src="/img/psico/img-2.png"
          alt="Ilustração abstrata"
          width="300"
          height="300"
          loading="lazy"
          decoding="async"
        />
        <div className="psico-reveal">
          <h2 className="font-inria mb-8 text-[33px] font-bold md:text-[40px]">O que é a psicoterapia?</h2>
          <div className="psico-copy">
            <p className="text-[18px]">A Psicoterapia Psicanalítica considera tanto àquilo que conseguimos reconhecer como àquilo que se mostra encobrindo-se à consciência.</p>
            <p className="text-[18px]">Ao longo do processo, podem-se abrir caminhos de elaboração de conflitos internos e experiências que continuam produzindo efeitos no presente.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
