import { useEffect } from 'react';
import { FiHeart, FiUser, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { button, container, heading } from '../../../../shared/components/ModalidadePsicoterapia/styles';
import { PublicFooter } from '../../../../shared/components/PublicFooter/PublicFooter';
import { PublicMenu } from '../../../../shared/components/PublicMenu/PublicMenu';
import { WHATSAPP_URL } from '../../../../shared/data/contact';

const audiences = [
  {
    title: 'Adultos',
    description: 'Um espaço para compreender o que você está vivendo, lidar com sofrimentos emocionais e construir novas possibilidades.',
    href: '/atendimentos/adultos',
    icon: FiUser,
    link: 'Conheça o atendimento para adultos',
  },
  {
    title: 'Adolescentes',
    description: 'Um espaço para ser escutado em um momento de importantes transformações.',
    href: '/atendimentos/adolescentes',
    icon: FiHeart,
    link: 'Conheça o atendimento para adolescentes',
  },
  {
    title: 'Casais',
    description: 'Um espaço para o diálogo, compreensão dos conflitos e reflexão sobre a relação.',
    href: '/atendimentos/casais',
    icon: FiUsers,
    link: 'Conheça o atendimento para casais',
  },
];

export function AtendimentosPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Atendimentos | Psicóloga Tamara Delis';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="relative left-1/2 flex min-h-dvh w-[100vw] -translate-x-1/2 flex-col bg-[#fff0de] text-left text-[#28241f]">
      <meta name="description" content="Atendimento psicológico para adultos, adolescentes e casais, presencialmente ou online." />
      <div className="bg-[url('/img/atendimentos/hero.png')] bg-cover bg-top">
        <PublicMenu cream />
        <section className={`${container} flex min-h-[420px] items-center py-16 md:min-h-[620px]`}>
          <div className="max-w-md">
            <h1 className="font-inria text-[33px] font-bold leading-tight text-black sm:text-[56px]">Atendimentos</h1>
            <p className="mt-6 max-w-xs text-[18px] font-semibold leading-relaxed sm:text-lg">Um espaço de escuta para diferentes momentos da vida.</p>
            <a className={`${button} mt-10`} href={WHATSAPP_URL}>Agendar atendimento</a>
          </div>
        </section>
      </div>
      <main>
        <section className="bg-[#4d5841] py-16 text-[#fff0de] md:py-24">
          <div className={container}>
            <h2 className={heading}>Psicoterapia para diferentes fases e necessidades</h2>
            <p className="mt-8 max-w-4xl text-base leading-relaxed sm:text-lg">Ofereço atendimento psicológico para adultos, adolescentes e casais de forma presencial em Itapetininga ou Sorocaba, ou online, conforme a sua necessidade.</p>
            <div className="mt-12 grid gap-6">
              {audiences.map(({ title, description, href, icon: Icon, link }) => (
                <article key={href} className="flex flex-col items-start gap-6 rounded-[28px] bg-[#fff0de] p-7 text-[#28241f] sm:flex-row sm:items-center sm:gap-12 sm:p-8">
                  <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[#fdddc5] text-[#713a20]">
                    <Icon aria-hidden="true" size={42} strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-2 max-w-2xl text-base leading-relaxed sm:text-lg">{description}</p>
                    <Link className={`${button} mt-4`} to={href}>{link}</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <div className="pt-12"><PublicFooter /></div>
    </div>
  );
}
