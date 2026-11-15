import type { BlogPost } from '../models/blog.model';

export const HOME_BLOG_POSTS: BlogPost[] = [
  {
    id: 'ansiedade-e-preocupacao',
    title: 'Ansiedade: quando a preocupação começa a ocupar espaço demais',
    excerpt:
      'Entenda como a ansiedade pode aparecer no dia a dia e quais sinais merecem atenção e acolhimento.',
    imageUrl: 'img/blog/blog-image-exemple.jpeg',
    imageAlt: 'blog',
    categories: ['Ansiedade', 'Saúde emocional'],
  },
  {
    id: 'limites-e-autocuidado',
    title: 'Quando tudo parece demais: reconhecer os próprios limites',
    excerpt:
      'Perceber seus limites é uma forma de cuidado. Cada pessoa pode encontrar seu próprio caminho nesse processo.',
    imageUrl: 'img/blog/blog-image-exemple.jpeg',
    imageAlt: 'blog',
    categories: ['Autocuidado', 'Saúde emocional'],
  },
  {
    id: 'autoconhecimento-e-terapia',
    title: 'Autoconhecimento: um espaço para olhar para si',
    excerpt:
      'A psicoterapia pode ajudar a ampliar a compreensão sobre a própria história, os sentimentos e as escolhas.',
    imageUrl: 'img/blog/blog-image-exemple.jpeg',
    imageAlt: 'blog',
    categories: ['Autoconhecimento', 'Psicoterapia'],
  },
];
