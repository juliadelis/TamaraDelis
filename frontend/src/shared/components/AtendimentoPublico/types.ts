import type { IconType } from 'react-icons';

export type AtendimentoContent = {
  title: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  featureTitle: string;
  featureText: string;
  featureImage: string;
  featureAlt: string;
  concernsTitle: string;
  concernsIntro: string[];
  concerns: { icon: IconType; text: string }[];
  columns: 1 | 2;
  note?: { title: string; paragraphs: string[]; icon?: IconType };
};
