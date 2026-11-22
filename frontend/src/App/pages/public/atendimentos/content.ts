import {
  FiAlertCircle, FiBriefcase, FiHeart, FiMessageSquare
} from 'react-icons/fi';


import type { AtendimentoContent } from '../../../../shared/components/AtendimentoPublico/types';
import { BiBrain, BiFace } from 'react-icons/bi';
import { FaRegFaceFlushed, FaRegFaceFrown, FaRegFaceGrimace, FaRegFaceMehBlank, FaRegFaceSadTear, FaRegFaceTired } from 'react-icons/fa6';
import { LuHeartCrack } from 'react-icons/lu';
import { LiaHeartBrokenSolid } from 'react-icons/lia';
import { IoPeopleOutline } from 'react-icons/io5';
import { VscPerson } from 'react-icons/vsc';
import { BsExclamationDiamond, BsGear } from 'react-icons/bs';
import { RiExchange2Line } from 'react-icons/ri';
import { MdOutlineHandshake } from 'react-icons/md';

export type Publico = 'adultos' | 'adolescentes' | 'casais';

const featureImage = '/img/atendimentos/segunda-img.png';
const featureAlt = 'Computador em uma mesa ao ar livre, sob uma árvore';

export const atendimentoContent: Record<Publico, AtendimentoContent> = {
  adultos: {
    title: 'Terapia com Adultos',
    intro: 'Um espaço para ser escutado e compreender o que você está vivendo, elaborar conflitos e ampliar a compreensão sobre si.',
    heroImage: '/img/atendimentos/hero_adultos.png',
    heroAlt: 'Mulher conversando com uma psicóloga em um consultório',
    featureTitle: 'Um espaço para olhar para sua história',
    featureText: 'Em determinados momentos, pode surgir a sensação de estar sobrecarregado, perdido ou repetindo situações que gostaria de compreender melhor. A psicoterapia oferece um espaço para olhar para essas experiências com mais atenção.',
    featureImage,
    featureAlt,
    concernsTitle: 'Questões que podem ser trabalhadas em psicoterapia',
    concernsIntro: ['A psicoterapia também pode ser procurada por quem deseja simplesmente compreender melhor a si mesmo e sua maneira de se relacionar com a vida.'],
    concerns: [
      { icon: BiBrain, text: 'Ansiedade' },
      { icon: FaRegFaceFrown, text: 'Depressão' },
      { icon: FaRegFaceGrimace, text: 'Angústia' },
      { icon: LuHeartCrack, text: 'Conflitos nos relacionamentos' },
      { icon: LiaHeartBrokenSolid, text: 'Separações' },
      { icon: IoPeopleOutline, text: 'Dificuldades familiares' },
      { icon: FaRegFaceMehBlank, text: 'Insegurança' },
      { icon: FaRegFaceSadTear, text: 'Autoestima' },
      { icon: BiFace, text: 'Crises pessoais' },
      { icon: FaRegFaceFlushed, text: 'Pânico' },
      { icon: FaRegFaceTired, text: 'TOC e fobias' },
      { icon: FiBriefcase, text: 'Mudanças profissionais' },
    ],
    columns: 2,
  },
  adolescentes: {
    title: 'Terapia com Adolescentes',
    intro: 'Um espaço de escuta e diálogo para compreender sentimentos, atravessar mudanças e construir possibilidades próprias.',
    heroImage: '/img/atendimentos/hero_adolescentes.png',
    heroAlt: 'Adolescente conversando com uma psicóloga em um consultório',
    featureTitle: 'Um espaço com respeito e acolhimento',
    featureText: 'A psicoterapia oferece ao adolescente um espaço próprio de escuta, no qual suas experiências podem ser abordadas com respeito e cuidado.',
    featureImage,
    featureAlt,
    concernsTitle: 'Quando procurar psicoterapia para adolescentes?',
    concernsIntro: ['A procura pode acontecer diante de diferentes situações como:'],
    concerns: [
      { icon: BiBrain, text: 'Mudanças significativas de comportamento' },
      { icon: FaRegFaceFrown, text: 'Sofrimento emocional' },
      { icon: IoPeopleOutline, text: 'Dificuldades familiares' },
      { icon: LuHeartCrack, text: 'Problemas nos relacionamentos' },
      { icon: FaRegFaceMehBlank, text: 'Ansiedade e insegurança' },
      { icon: VscPerson, text: 'Isolamento' },
      { icon: BsGear, text: 'Outras situações que estejam causando preocupação' },
    ],
    columns: 1,
    note: {
      title: 'Como funciona?',
      paragraphs: [
        'O primeiro contato com os responsáveis acontece antes do início do acompanhamento, considerando as necessidades do caso e os princípios éticos da Psicologia.',
        'O adolescente terá seu espaço de atendimento e sua privacidade será respeitada dentro dos limites estabelecidos pelas normas profissionais.',
      ],
    },
  },
  casais: {
    title: 'Terapia com Casais',
    intro: 'Vínculo, diálogo e diferenças. Um espaço para compreender a dinâmica da relação, elaborar conflitos e refletir sobre os modos de se relacionar.',
    heroImage: '/img/atendimentos/hero_casais.png',
    heroAlt: 'Casal conversando com uma psicóloga em um consultório',
    featureTitle: 'Um espaço para compreender a dinâmica da relação',
    featureText: 'A terapia de casal oferece um espaço para que essas questões possam ser colocadas em palavras e compreendidas dentro da dinâmica da relação.',
    featureImage,
    featureAlt,
    concernsTitle: 'O objetivo não é estabelecer quem está certo ou errado.',
    concernsIntro: [
      'É possibilitar que o casal possa olhar para o que acontece entre os dois, compreender padrões de interação e refletir sobre a relação.',
      'A terapia de casal pode ser procurada diante de:',
    ],
    concerns: [
      { icon: FiAlertCircle, text: 'Conflitos frequentes' },
      { icon: FiMessageSquare, text: 'Dificuldades de comunicação' },
      { icon: VscPerson, text: 'Distanciamento emocional' },
      { icon: LuHeartCrack, text: 'Crises no relacionamento' },
      { icon: RiExchange2Line, text: 'Mudanças importantes na vida do casal' },
      { icon: MdOutlineHandshake, text: 'Dificuldades relacionadas à confiança' },
      { icon: IoPeopleOutline, text: 'Decisões sobre a continuidade da relação' },
      { icon: BiFace, text: 'Dificuldades após acontecimentos marcantes' },
      { icon: BsExclamationDiamond, text: 'Disfunção sexual no casal' },
    ],
    columns: 2,
    note: {
      title: 'Cada casal possui uma história própria',
      paragraphs: ['Por isso, o processo também é construído de maneira singular, considerando o momento e as necessidades da relação.'],
      icon: FiHeart,
    },
  },
};
