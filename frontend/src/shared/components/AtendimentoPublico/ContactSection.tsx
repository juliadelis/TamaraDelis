import { WHATSAPP_URL } from '../../data/contact';
import { button, heading } from '../ModalidadePsicoterapia/styles';

export function ContactSection() {
  return (
    <section className="bg-[#4d5841] px-5 py-16 text-center text-[#fff0de] md:py-20">
      <h2 className={heading}>Vamos conversar?</h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">O primeiro contato pode ser utilizado para esclarecer dúvidas sobre o processo, horários e funcionamento da psicoterapia.</p>
      <a className={`${button} mt-8`} href={WHATSAPP_URL}>Entrar em contato</a>
    </section>
  );
}
