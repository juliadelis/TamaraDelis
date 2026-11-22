import { FiMessageSquare, FiUser } from 'react-icons/fi';

const faqItems = [
  {
    icon: FiMessageSquare,
    title: 'O que acontece na primeira sessão?',
    paragraphs: [
      'O primeiro encontro é um momento para conhecer a demanda que levou você à psicoterapia, conversar sobre o que está acontecendo e compreender se aquele espaço pode ser adequado às suas necessidades.',
      'Você não precisa chegar com um diagnóstico ou saber exatamente como explicar o que sente.',
    ],
  },
  {
    icon: FiUser,
    title: 'Psicoterapia não é dar conselhos',
    paragraphs: [
      'O trabalho psicológico não consiste em dizer ao paciente o que ele deve fazer.',
      'A psicoterapia oferece um espaço de escuta e reflexão para que a própria pessoa possa compreender melhor suas experiências e ampliar sua capacidade de escolha.',
    ],
  },
];

export function HowItWorksSection() {
  return (
    <section className="psico-how">
      <div className="psico-how-inner">
        <div className="psico-how-header">
          <h2 className="psico-how-title psico-reveal font-inria text-[33px] font-bold md:text-[40px]">Como funciona a psicoterapia?</h2>
          <div className="psico-how-description psico-reveal">
            <p className="text-[18px]">As sessões acontecem, em geral, semanalmente e têm duração aproximada de 50 minutos.</p>
            <p className="text-[18px]">O processo é construído de maneira individualizada, considerando a demanda, a história e o momento de cada paciente.</p>
            <p className="text-[18px]">Não existe um número pré-determinado de sessões que funcione para todas as pessoas.</p>
          </div>
        </div>
        <div className="psico-how-cards">
          {faqItems.map(({ icon: Icon, title, paragraphs }) => (
            <article key={title} className="psico-how-card psico-reveal">
              <div className="flex items-center gap-4">
                <Icon aria-hidden="true" className="psico-how-icon" />
                <h3 className="text-[24px] font-semibold">{title}</h3>
              </div>
              <div>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[18px]">{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
