import { WHATSAPP_URL } from '../../../../../shared/data/contact';

export function ClosingSection() {
  return (
    <section
      id="primeiro-contato"
      className="mx-auto grid w-full max-w-7xl scroll-mt-8 items-center gap-6 px-5 py-16 sm:px-8 md:grid-cols-2 md:gap-10 md:py-20 lg:px-12"
    >
      <div  className="home-enter h-full w-full  object-contain ">
      <img
        src="/img/home/tamara_sessao_final.png"
        alt="Tamara Delis sentada em uma poltrona durante uma sessão"
        loading="lazy"
        decoding="async"
        width="100%"
        height="auto"
        className="w-full h-full object-contain"
      />
      </div>
      <div className="home-enter home-enter-delay-1 max-w-xl">
        <p className="font-inria text-[33px] font-bold leading-tight text-[#000000] ">
          Talvez você ainda não saiba exatamente o que está procurando...
        </p>
        <h2 className="mt-2 font-inria text-[33px] font-bold leading-tight text-[#000000] ">
          Tudo bem.
        </h2>
        <p className="mt-4 text-[18px] leading-relaxed text-[#263540] ">
          O primeiro contato pode ser simplesmente uma oportunidade para tirar suas dúvidas
          e compreender como funciona a psicoterapia.
        </p>
        <a
          href={WHATSAPP_URL}
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full bg-[#713a20] px-5 py-2 text-[18px] font-semibold text-white transition-colors hover:bg-[#562b18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713a20]"
        >
          Agende sua sessão
        </a>
      </div>
    </section>
  );
}
