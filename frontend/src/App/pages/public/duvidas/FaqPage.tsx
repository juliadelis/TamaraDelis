import { useEffect, useState } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { PublicFooter } from '../../../../shared/components/PublicFooter/PublicFooter';
import { PublicMenu } from '../../../../shared/components/PublicMenu/PublicMenu';
import { WHATSAPP_URL } from '../../../../shared/data/contact';

const questions = [
  {
    question: 'Quanto dura uma sessão?',
    answer: 'As sessões têm duração aproximada de 50 minutos.',
  },
  {
    question: 'Com que frequência acontecem as sessões?',
    answer: 'A frequência das sessões é conversada de acordo com as necessidades de cada pessoa. Entre em contato para saber mais.',
  },
  {
    question: 'Quanto custa a sessão?',
    answer: 'Entre em contato pelo WhatsApp para consultar os valores e as condições de atendimento.',
  },
  {
    question: 'Posso fazer terapia online?',
    answer: 'Sim. Além dos atendimentos presenciais em Itapetininga e Sorocaba, também há atendimento online.',
  },
  {
    question: 'Preciso saber o que tenho para começar?',
    answer: 'Não. O primeiro contato pode ser uma oportunidade para conversar sobre suas dúvidas e compreender como funciona a psicoterapia.',
  },
  {
    question: 'Quanto tempo preciso fazer terapia?',
    answer: 'Cada processo é singular. O tempo de psicoterapia depende das necessidades e da trajetória de cada pessoa.',
  },
  {
    question: 'O que eu falar na terapia é sigiloso?',
    answer: 'O atendimento psicológico segue as normas éticas de sigilo profissional. Eventuais exceções podem ser esclarecidas no primeiro contato.',
  },
  {
    question: 'Atende adolescentes?',
    answer: 'Sim, há atendimento para adolescentes. Entre em contato para conhecer as orientações para o primeiro atendimento.',
  },
  {
    question: 'Atende casais?',
    answer: 'Sim, há atendimento para casais. Entre em contato para saber mais sobre a disponibilidade.',
  },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-10 max-w-4xl space-y-3">
      {questions.map(({ question, answer }, index) => {
        const isOpen = openIndex === index;
        const answerId = `faq-answer-${index}`;

        return (
          <div key={question} className="rounded-[2rem] bg-[#fff0de] text-[#6a3710]">
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex cursor-pointer w-full items-center justify-between gap-4 rounded-[2rem] px-6 py-4 text-left text-[18px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff0de] sm:px-8"
              >
                <span>{index + 1}- {question}</span>
                <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isOpen ? 'border border-[#6a3710]' : 'bg-[#6a3710] text-[#fff0de]'}`}>
                  {isOpen ? <LuMinus size={20} /> : <LuPlus size={20} />}
                </span>
              </button>
            </h2>
            <div
              id={answerId}
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="px-6 pb-6 text-[18px] leading-relaxed sm:px-8">{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FaqPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Dúvidas sobre Psicoterapia | Psicóloga em Itapetininga';

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="relative left-1/2 flex min-h-dvh w-[100vw] -translate-x-1/2 flex-col bg-[#4d5841] text-left">
      <meta
        name="description"
        content="Tire suas dúvidas sobre psicoterapia, primeira sessão, terapia online, frequência, sigilo e atendimento psicológico."
      />
      <PublicMenu dark />
      <main className="flex-1 px-5 pb-20 pt-16 text-[#fff0de] sm:px-8 md:pb-24 md:pt-20">
        <h1 className="text-center font-inria text-[33px] font-bold leading-tight ">
          Dúvidas frequentes sobre psicoterapia
        </h1>
        <FaqAccordion />
        <section className="mx-auto mt-16 max-w-lg text-center">
          <h2 className="font-inria text-[33px] font-bold ">Como agendar?</h2>
          <p className="mt-6 text-[18px] leading-relaxed">
            Entre em contato pelo WhatsApp para consultar horários disponíveis e receber as
            orientações para o primeiro atendimento.
          </p>
          <a
            href={WHATSAPP_URL}
            className="mt-8 inline-flex min-h-10 items-center justify-center rounded-full bg-[#713a20] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#562b18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff0de]"
          >
            Agendar atendimento
          </a>
        </section>
      </main>
      <div className="bg-[#fff0de] pt-8">
        <PublicFooter />
      </div>
    </div>
  );
}
