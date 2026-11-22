import { Link } from 'react-router-dom';
import { button, container, heading } from './styles';
import type { ModalidadeContent } from './types';

export function OutraModalidade({ page }: { page: ModalidadeContent }) {
  return (
    <section className="bg-[#4d5841] py-16 text-center text-[#fff0de] md:py-20">
      <div className={container}>
        <h2 className={heading}>{page.otherTitle}</h2>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed sm:text-lg">{page.otherText}</p>
        <Link className={`${button} mt-6`} to={page.otherPath}>Conheça esta modalidade</Link>
      </div>
    </section>
  );
}
