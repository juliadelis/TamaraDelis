import { Link } from 'react-router-dom';

const modalities = [
  {
    title: 'Psicoterapia presencial',
    image: '/img/psico/presencial.png',
    imageAlt: 'Atendimento presencial',
    description: 'Atendimento psicológico em consultório, num ambiente acolhedor e seguro para conversarmos sobre aquilo que te traz até aqui.',
    href: '/psicoterapia/presencial',
  },
  {
    title: 'Psicoterapia online',
    image: '/img/psico/online.png',
    imageAlt: 'Atendimento online',
    description: 'Acompanhamento psicológico por meio digital, com a mesma segurança e qualidade de atendimento do espaço físico.',
    href: '/psicoterapia/online',
  },
];

export function ModalitiesSection() {
  return (
    <section className="psico-modalities">
      <div className="psico-modalities-inner">
        <h2 className="psico-reveal mb-4 text-center font-inria text-[33px] font-bold md:text-[40px]">Modalidades de atendimento</h2>
        <p className="psico-modalities-subtitle psico-reveal text-[18px]">A psicoterapia pode ser realizada presencialmente em Itapetininga e Sorocaba, ou de forma online, conforme a sua necessidade.</p>
        <div className="psico-modalities-cards">
          {modalities.map(({ title, image, imageAlt, description, href }) => (
            <article key={href} className="psico-modalities-card psico-reveal">
              <img src={image} alt={imageAlt} width="400" height="300" loading="lazy" decoding="async" />
              <div className="psico-modalities-card-content">
                <h3 className="mb-4 text-[20px] font-semibold">{title}</h3>
                <p className="mb-4 text-[18px]">{description}</p>
                <Link to={href}>Saiba mais</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
