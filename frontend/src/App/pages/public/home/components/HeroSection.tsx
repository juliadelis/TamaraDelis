import { WHATSAPP_URL } from '../../../../../shared/data/contact';

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="mx-auto grid w-full max-w-7xl items-center gap-2 px-5 pb-10 pt-12 grid-cols-12  sm:px-8 sm:pt-16  lg:px-12"
    >
      <div className="relative z-10 md:py-5 col-span-12 md:col-span-6">
        <h1 className="home-enter max-w-xl font-inria font-bold text-[33px] md:text-[50px] leading-tight text-[#121c24] min-[420px]  ">
          Psicóloga Tamara Delis
        </h1>
        <p className="home-enter home-enter-delay-1 mt-2 font-inria text-base text-[#17232c] text-[24px] md:text-[30px]">
          Psicoterapia presencial e online.
        </p>
        <p className="home-enter home-enter-delay-2 mt-4 md:mt-8 max-w-xs text-[20px] leading-relaxed text-[#17232c] sm:mt-12 ">
          Psicologia para <b>você.</b> O diálogo transcende e <b>cura.</b>
        </p>
        <a
          href={WHATSAPP_URL}
          className="home-enter home-enter-delay-3 mt-5 text-[16px] inline-flex min-h-10 items-center justify-center rounded-full bg-[#713a20] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#562b18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713a20]"
        >
          Agende sua sessão
        </a>
      </div>

      <div className="home-enter mb-[-80px] h-[400px] md:h-auto md:mb-0 relative order-first flex items-end justify-center self-end col-span-12 md:order-none md:col-span-6">
        <img
          src="/img/home/tamara_banner-872.webp"
          srcSet="/img/home/tamara_banner-480.webp 480w, /img/home/tamara_banner-872.webp 872w"
          sizes="(min-width: 1280px) 588px, (min-width: 1024px) calc((100vw - 104px) / 2), (min-width: 768px) calc((100vw - 72px) / 2), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
          alt="Tamara Delis"
          fetchPriority="high"
          width={872}
          height={1133}
          className="h-auto w-auto max-w-full object-contain"
        />
       
      </div>
    </section>
  );
}
