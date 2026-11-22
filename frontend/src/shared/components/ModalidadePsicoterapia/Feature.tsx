import { container, heading } from './styles';
import type { ModalidadeContent } from './types';

export function Feature({ page }: { page: ModalidadeContent }) {
  return (
    <section className="bg-[#4d5841] py-16 text-[#fff0de] md:py-24">
      <div className={`${container} grid items-center gap-8 md:grid-cols-2 md:gap-16`}>
        <img className="aspect-[1.8] w-full rounded-[28px] object-cover" src={page.featureImage} alt={page.featureAlt} width="550" height="306" loading="lazy" decoding="async" />
        <div>
          <h2 className={heading}>{page.featureTitle}</h2>
          <p className="mt-6 text-base leading-relaxed sm:text-lg">{page.featureText}</p>
        </div>
      </div>
    </section>
  );
}
