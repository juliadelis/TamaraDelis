export function AboutSection() {
  return (
    <section
      id="sobre-mim"
      className="mx-auto grid w-full max-w-7xl items-center justify-between gap-8 px-5 py-14 sm:px-8 md:grid-cols-12 md:gap-12 md:py-20 lg:px-12"
    >
      <img
        src="/img/home/sobre_meu_trabalho.png"
        alt="Ilustração em espiral azul e terracota"
        loading="lazy"
        decoding="async"
        className="home-enter mx-auto  w-full rounded-3xl object-cover md:col-span-4"
      />
      <div id="psicoterapia" className="home-enter home-enter-delay-1 scroll-mt-8 col-span-12 md:col-span-8">
        <h2 className="font-inria font-bold text-3xl leading-tight text-[#17232c] sm:text-4xl">
          Sobre meu trabalho
        </h2>
        <div className="mt-4 space-y-3 text-[18px] leading-relaxed text-[#263540]">
          <p>
            Sou Tamara Delis, psicóloga clínica, com atuação em psicoterapia psicanalítica.
          </p>
          <p>
            Realizo atendimento psicológico presencial em Itapetininga e Sorocaba, além de
            atendimento online, com segurança e ética. Este é um espaço de escuta, reflexão e
            compreensão para adultos, adolescentes e casais.
          </p>
          <p>
            A psicoterapia pode ser procurada diante de ansiedade, angústia, conflitos nos
            relacionamentos, separações, mudanças importantes ou pelo desejo de compreender
            melhor a si mesma(o).
          </p>
          <p>
            Cada processo psicoterapêutico é singular e construído a partir da história e das
            necessidades de cada pessoa.
          </p>
        </div>
        <a
          href="#contato"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-[#713a20] px-4 py-2 text-18px font-semibold text-white transition-colors hover:bg-[#562b18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713a20]"
        >
          Entrar em contato
        </a>
      </div>
    </section>
  );
}
