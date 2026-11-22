import { container, heading } from '../ModalidadePsicoterapia/styles';
import type { AtendimentoContent } from './types';

export function ConcernsSection({ page }: { page: Pick<AtendimentoContent, 'concernsTitle' | 'concernsIntro' | 'concerns' | 'columns' | 'note'> }) {
  const NoteIcon = page.note?.icon;

  return (
    <section className={`${container} py-16 md:py-24`}>
      <h2 className={`${heading} max-w-3xl text-black`}>{page.concernsTitle}</h2>
      <div className="mt-8 space-y-4 text-base leading-relaxed sm:text-lg">
        {page.concernsIntro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <ul className={`mt-10 grid gap-x-12 gap-y-4 ${page.columns === 2 ? `sm:grid-flow-col sm:grid-cols-2 ${page.concerns.length > 10 ? 'sm:grid-rows-6' : 'sm:grid-rows-5'}` : ''}`}>
        {page.concerns.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-4 text-base sm:text-lg">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fdddc5] text-[#713a20]">
              <Icon aria-hidden="true" size={20} />
            </span>
            {text}
          </li>
        ))}
      </ul>
      {page.note && (
        <div className="mt-16 flex items-center gap-7 rounded-[32px] bg-[#a8bfd0] p-8 md:p-12">
          {NoteIcon && (
            <span className="hidden size-24 shrink-0 items-center justify-center rounded-full bg-[#c4d6e5] text-[#263540] sm:flex">
              <NoteIcon aria-hidden="true" size={48} strokeWidth={1} />
            </span>
          )}
          <div>
            <h3 className="text-xl font-semibold">{page.note.title}</h3>
            {page.note.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-base leading-relaxed sm:text-lg">{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
