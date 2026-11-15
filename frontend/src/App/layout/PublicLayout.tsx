import { FloatingWhatsApp } from "@digicroz/react-floating-whatsapp";
import { Outlet } from "react-router-dom";
import { WHATSAPP_PHONE_NUMBER } from "../../shared/data/contact";

export function PublicLayout() {
  return (
    <>
      <Outlet />
      <FloatingWhatsApp
        phoneNumber={WHATSAPP_PHONE_NUMBER}
        accountName="Tamara Delis"
        statusMessage="Entre em contato pelo WhatsApp"
        chatMessage="Olá! Como posso ajudá-lo?"
        placeholder="Digite sua mensagem..."
        notification={false}
        avatar='/img/tamara-delis.jpg'
        allowClickAway
        allowEsc
      />
    </>
  );
}
