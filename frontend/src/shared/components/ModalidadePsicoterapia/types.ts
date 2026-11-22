import type { IconType } from 'react-icons';

export type Modalidade = 'presencial' | 'online';

export type ModalidadeContent = {
  title: string;
  subtitle: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  featureTitle: string;
  featureText: string;
  featureImage: string;
  featureAlt: string;
  howTitle: string;
  details: { icon: IconType; text: string }[];
  audienceText: string;
  audienceImage: string;
  audienceAlt: string;
  concerns?: string[];
  otherTitle: string;
  otherText: string;
  otherPath: string;
};
