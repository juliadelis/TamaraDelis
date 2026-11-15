import {
  LuBrain,
  LuCalendarDays,
  LuHeart,
  LuHeartCrack,
  LuSprout,
  LuUsersRound,
} from 'react-icons/lu';
import { WHATSAPP_URL } from '../../../../../shared/data/contact';

const careMoments = [
  {
    title: 'Quando algo está difícil de elaborar',
    points: [
      'Perdas e lutos',
      'Separações',
      'Mudanças importantes',
      'Conflitos familiares',
      'Acontecimentos que continuam repercutindo emocionalmente',
    ],
    icon: <LuBrain aria-hidden="true" size={18} />,
    cardClass: 'text-[#f9efdc]',
    shapeColorClass: 'bg-[#929a84]/90',
    accentColorClass: 'bg-[#b4b99f]/65',
    shapeClass: 'rounded-[72%_58%_64%_56%/60%_44%_66%_42%] scale-[1.1] rotate-[-5deg]',
    accentShapeClass: 'rounded-[58%_52%_62%_38%/80%_95%_82%_90%]',
    accentPositionClass: 'rotate-7 scale-[1.1] translate-x-1 translate-y-2',
    iconClass: 'bg-[#713a20]',
    positionClass: 'lg:col-start-1 lg:row-start-1',
  },
  {
    title: 'Quando os sentimentos parecem intensos ou confusos',
    points: [
      'Ansiedade',
      'Tristeza',
      'Irritação',
      'Medo',
      'Culpa',
      'Sensação de vazio',
      'Dificuldade para compreender o que está sentindo',
    ],
    icon: <LuHeart aria-hidden="true" size={18} />,
    cardClass: 'text-[#20303b]',
    shapeColorClass: 'bg-[#a9bfd0]/90',
    accentColorClass: 'bg-[#c6d3dd]/70',
    shapeClass: 'rounded-[48%_62%_55%_45%/52%_78%_82%_78%] scale-[1.1] rotate-[-8deg]',
    accentShapeClass: 'rounded-[90%_60%_38%_62%/88%_68%_72%_82%]',
    accentPositionClass: 'rotate-7 scale-[1.1] -translate-x-2 translate-y-2',
    iconClass: 'bg-[#263540]',
    positionClass: 'lg:col-start-3 lg:row-start-1',
  },
  {
    title: 'E também quando está tudo bem... mas você quer se compreender melhor',
    points: [
      'Autoconhecimento',
      'Compreender sua história',
      'Reconhecer seus padrões',
      'Refletir sobre escolhas',
      'Ampliar possibilidades',
      'Construir uma relação mais consciente consigo mesma',
    ],
    icon: <LuSprout aria-hidden="true" size={18} />,
    cardClass: 'text-[#20303b]',
    shapeColorClass: 'bg-[#a9bfd0]/90',
    accentColorClass: 'bg-[#c6d3dd]/70',
    shapeClass: 'rounded-[94%_56%_54%_96%/60%_98%_72%_50%] scale-[1.1] rotate-[-8deg]',
    accentShapeClass: 'rounded-[60%_40%_42%_58%/24%_18%_82%_76%]',
    accentPositionClass: 'rotate-1 scale-[1.1] translate-x-2 -translate-y-2',
    iconClass: 'bg-[#263540]',
    positionClass: 'lg:col-start-1 lg:row-start-2',
  },
  {
    title: 'Quando os relacionamentos se repetem em padrões',
    points: [
      'Conflitos frequentes',
      'Dificuldades de estabelecer limites',
      'Medo de perder o outro',
      'Dependência emocional',
      'Dificuldade de se posicionar',
      'Relações que provocam sofrimento',
    ],
    icon: <LuUsersRound aria-hidden="true" size={18} />,
    cardClass: 'text-[#f9efdc]',
    shapeColorClass: 'bg-[#929a84]/90',
    accentColorClass: 'bg-[#b4b99f]/65',
    shapeClass: 'rounded-[56%_44%_36%_84%/18%_66%_74%_52%] scale-[1.1] rotate-[-8deg]',
    accentShapeClass: 'rounded-[38%_62%_58%_42%/26%_18%_82%_74%]',
    accentPositionClass: 'rotate-7 scale-[1.1] -translate-x-2 translate-y-2',
    iconClass: 'bg-[#713a20]',
    positionClass: 'lg:col-start-3 lg:row-start-2',
  },
  {
    title: 'Quando o corpo e a rotina começam a expressar o sofrimento',
    points: [
      'Alterações no sono',
      'Cansaço constante',
      'Dificuldade de concentração',
      'Perda de prazer',
      'Inquietação',
      'Sensação de estar sempre "no limite"',
    ],
    icon: <LuCalendarDays aria-hidden="true" size={18} />,
    cardClass: 'text-[#f9efdc]',
    shapeColorClass: 'bg-[#929a84]/90',
    accentColorClass: 'bg-[#b4b99f]/65',
    shapeClass: 'rounded-[46%_54%_60%_40%/24%_90%_80%_76%] scale-[1.1] rotate-[8deg] translate-y-4',
    accentShapeClass: 'rounded-[62%_38%_42%_58%/50%_90%_40%_82%]',
    accentPositionClass: '-rotate-8 scale-[1.1] -translate-x-9 translate-y-2',
    iconClass: 'bg-[#713a20]',
    positionClass: 'lg:col-start-1 lg:row-start-3',
  },
  {
    title: 'Quando você percebe que está se afastando de si',
    points: [
      'Dificuldade de reconhecer seus desejos',
      'Viver muito em função das expectativas dos outros',
      'Sensação de não se reconhecer',
      'Escolhas que já não fazem sentido',
      'Dificuldade de fazer escolhas',
    ],
    icon: <LuHeartCrack aria-hidden="true" size={18} />,
    cardClass: 'text-[#20303b]',
    shapeColorClass: 'bg-[#a9bfd0]/90',
    accentColorClass: 'bg-[#c6d3dd]/70',
    shapeClass: 'rounded-[54%_46%_32%_58%/58%_64%_76%_82%] scale-[1.1] rotate-[8deg] translate-y-2',
    accentShapeClass: 'rounded-[42%_58%_62%_38%/28%_98%_82%_72%]',
    accentPositionClass: '-rotate-5 scale-[1.1] translate-x-2 -translate-y-2',
    iconClass: 'bg-[#263540]',
    positionClass: 'lg:col-start-3 lg:row-start-3',
  },
];

export function CareGuideSection() {
  return (
    <section id="duvidas" className="bg-[#4d5841] overflow-hidden px-5 py-16 text-[#f9efdc] sm:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative mt-10 grid gap-y-16 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-20 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.8fr)_minmax(0,1fr)] lg:items-center lg:gap-x-12 lg:gap-y-24">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="care-guide-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L6,3 z" fill="#f9efdc" />
              </marker>
            </defs>
            <g
              fill="none"
              stroke="#f9efdc"
              strokeWidth="1.5"
              markerEnd="url(#care-guide-arrow)"
            >
              <path d="M450 355 V230 H370" />
              <path d="M550 355 V200 H630" />
              <path d="M380 500  H360" />
              <path d="M620 500 H640" />
              <path d="M450 675 V840 H370" />
              <path d="M550 675 V890 H620" />
            </g>
          </svg>

          <div className="home-enter relative z-10 text-center sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-2">
            <h2 className="font-inria font-bold text-[33px] leading-tight ">
              Quando procurar uma psicóloga?
            </h2>
            <p className="mx-auto mt-4 max-w-sm  leading-relaxed text-[#eee5d4] text-[18px]">
              Nem sempre é preciso saber exatamente o que está acontecendo para buscar ajuda.
            </p>
          </div>

          {careMoments.map(
            ({
              title,
              points,
              icon,
              cardClass,
              shapeColorClass,
              accentColorClass,
              shapeClass,
              accentShapeClass,
              accentPositionClass,
              iconClass,
              positionClass,
            }) => (
              <article
                key={title}
                className={`home-enter home-enter-delay-1 relative z-10 p-5 pt-7 sm:p-6 sm:pt-8 lg:p-5 lg:pt-7 ${cardClass} ${positionClass}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 z-0 ${shapeClass} ${shapeColorClass}`}
                />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -inset-x-1 inset-y-1 z-0 ${accentShapeClass} ${accentPositionClass} ${accentColorClass}`}
                />
                <span
                  className={`absolute -top-3 left-5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full text-white ${iconClass}`}
                >
                  {icon}
                </span>
                <div className="relative z-10">
                  <h3 className="font-serif text-lg leading-snug sm:text-xl">{title}</h3>
                  <ul className="mt-3 list-inside list-disc space-y-1 text-xs leading-relaxed sm:text-sm">
                    {points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ),
          )}
        </div>

        <div id="atendimentos" className="home-enter home-enter-delay-2 scroll-mt-8 pt-32 text-center">
          <h3 className="font-inria font-bold text-[33px] leading-tight ">
            Você não precisa chegar ao limite para procurar uma psicóloga
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-[18px] leading-relaxed text-[#eee5d4] ">
            Se você deseja compreender o que acontece dentro de si, pode ser um bom momento
            para conversar.
          </p>
          <a
            href={WHATSAPP_URL}
            className="mt-6 inline-flex min-h-10 text-[18px] items-center justify-center rounded-full bg-[#713a20] px-5 py-2  font-semibold text-white transition-colors hover:bg-[#562b18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f9efdc]"
          >
            Agende uma conversa
          </a>
        </div>
      </div>
    </section>
  );
}
