import { useEffect } from 'react';
import { FiClock, FiMapPin, FiUser, FiVideo } from 'react-icons/fi';
import { Atendimento } from '../../../../shared/components/ModalidadePsicoterapia/Atendimento';
import { Feature } from '../../../../shared/components/ModalidadePsicoterapia/Feature';
import { Hero } from '../../../../shared/components/ModalidadePsicoterapia/Hero';
import { OutraModalidade } from '../../../../shared/components/ModalidadePsicoterapia/OutraModalidade';
import type { Modalidade, ModalidadeContent } from '../../../../shared/components/ModalidadePsicoterapia/types';
import { PublicFooter } from '../../../../shared/components/PublicFooter/PublicFooter';
import { PublicMenu } from '../../../../shared/components/PublicMenu/PublicMenu';

const content: Record<Modalidade, ModalidadeContent> = {
  presencial: {
    title: 'Psicoterapia Presencial',
    subtitle: 'Um espaço de escuta em Itapetininga e Sorocaba',
    intro: 'Se você está procurando uma psicóloga em Itapetininga ou em Sorocaba, encontrará um espaço de escuta em uma estrutura de acolhimento aqui comigo.',
    heroImage: '/img/presencial/hero.png',
    heroAlt: 'Poltrona azul em um ambiente acolhedor',
    featureTitle: 'Um espaço pensado para o seu processo',
    featureText: 'O consultório é um ambiente reservado, adequado à realização de psicoterapia que oferece acolhimento e privacidade para as sessões.',
    featureImage: '/img/presencial/sunflower.png',
    featureAlt: 'Girassol com gotas de água',
    howTitle: 'Como funciona o atendimento presencial?',
    details: [
      { icon: FiClock, text: 'As sessões têm duração aproximada de 50 minutos e acontecem, em geral, semanalmente.' },
      { icon: FiUser, text: 'O processo é construído de forma individual, considerando a sua demanda, história e o seu momento.' },
    ],
    audienceText: 'A psicoterapia presencial pode ser procurada por adultos, adolescentes e casais, diante de diferentes demandas, como:',
    audienceImage: '/img/presencial/couch-2.png',
    audienceAlt: 'Poltrona azul em um consultório',
    concerns: [
      'Ansiedade e angústia',
      'Depressão',
      'Conflitos familiares',
      'Conflitos de relacionamentos',
      'Dificuldades de comunicação',
      'Separações e mudanças importantes',
      'Crises emocionais',
      'Disfunção sexual',
      'Desejo de autoconhecimento',
    ],
    otherTitle: 'Também ofereço psicoterapia online',
    otherText: 'Para quem está em outra cidade ou prefere realizar o acompanhamento à distância, também está disponível o atendimento psicológico online, conforme as condições adequadas e a regulamentação profissional vigente.',
    otherPath: '/psicoterapia/online',
  },
  online: {
    title: 'Psicoterapia Online',
    subtitle: 'Atendimento psicológico à distância.',
    intro: 'A psicoterapia permite realizar o acompanhamento por meio digital, sem a necessidade de deslocamento até o consultório.',
    heroImage: '/img/online/hero.png',
    heroAlt: 'Xícara de café ao lado de um computador',
    featureTitle: 'O diálogo pode acontecer onde você estiver.',
    featureText: 'O trabalho clínico e a qualidade da escuta permanecem como elementos centrais do processo, mesmo em um formato online. Pode ser uma alternativa para pessoas que vivem em outras cidades, possuem uma rotina que dificulta o deslocamento ou preferem realizar suas sessões no ambiente em que se sentem mais confortáveis.',
    featureImage: '/img/online/computer-1.png',
    featureAlt: 'Computador em uma mesa ao ar livre',
    howTitle: 'Como funciona a terapia online?',
    details: [
      { icon: FiVideo, text: 'As sessões são realizadas por videochamada, em horário previamente combinado.' },
      { icon: FiMapPin, text: 'É importante que o paciente esteja em um ambiente reservado, com privacidade e conexão adequada à videochamada.' },
    ],
    audienceText: 'O atendimento pode ser realizado para adultos, adolescentes e casais, desde que sejam observadas as condições necessárias para a modalidade e as normas profissionais vigentes.',
    audienceImage: '/img/online/computer-2.png',
    audienceAlt: 'Computador sobre uma mesa junto a uma xícara',
    otherTitle: 'Também ofereço psicoterapia presencial',
    otherText: 'Se você está procurando uma psicóloga em Itapetininga ou em Sorocaba, encontrará um espaço de escuta em uma estrutura de acolhimento aqui comigo.',
    otherPath: '/psicoterapia/presencial',
  },
};

export function ModalidadePage({ modalidade }: { modalidade: Modalidade }) {
  const page = content[modalidade];

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
        <Hero page={page} />
        <Feature page={page} />
        <Atendimento page={page} modalidade={modalidade} />
        <OutraModalidade page={page} />
      </main>
      <div className="pt-12"><PublicFooter /></div>
    </div>
  );
}
