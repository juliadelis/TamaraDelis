import { useLayoutEffect, useRef } from "react";
import { FloatingWhatsApp } from "@digicroz/react-floating-whatsapp";
import { Outlet } from "react-router-dom";
import { WHATSAPP_PHONE_NUMBER } from "../../shared/data/contact";

export function PublicLayout() {
  const whatsappRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const chatbox = whatsappRef.current?.querySelector<HTMLElement>(
      ".public-whatsapp-chatbox",
    );

    if (!chatbox) {
      return;
    }

    const syncAccessibility = () => {
      const isOpen = Number.parseFloat(chatbox.style.height) > 0;
      const isHidden = !isOpen;

      if (chatbox.getAttribute("aria-hidden") !== String(isHidden)) {
        chatbox.setAttribute("aria-hidden", String(isHidden));
      }

      if (chatbox.hasAttribute("inert") !== isHidden) {
        chatbox.toggleAttribute("inert", isHidden);
      }
    };

    syncAccessibility();

    const observer = new MutationObserver(syncAccessibility);
    observer.observe(chatbox, {
      attributes: true,
      attributeFilter: ["aria-hidden", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Outlet />
      <div ref={whatsappRef}>
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
          chatboxClassName="public-whatsapp-chatbox"
        />
      </div>
    </>
  );
}
