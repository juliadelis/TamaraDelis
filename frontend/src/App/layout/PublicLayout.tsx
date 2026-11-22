import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { WHATSAPP_PHONE_NUMBER } from "../../shared/data/contact";

const FloatingWhatsApp = lazy(() =>
  import("@digicroz/react-floating-whatsapp").then((module) => ({
    default: module.FloatingWhatsApp,
  })),
);

export function PublicLayout() {
  const whatsappRef = useRef<HTMLDivElement>(null);
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  useLayoutEffect(() => {
    const container = whatsappRef.current;
    if (!container) {
      return;
    }

    const syncAccessibility = () => {
      const chatbox = container.querySelector<HTMLElement>(
        ".public-whatsapp-chatbox",
      );
      if (!chatbox) {
        return;
      }

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
    observer.observe(container, {
      attributes: true,
      attributeFilter: ["aria-hidden", "style"],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Outlet />
      <div ref={whatsappRef}>
        <Suspense fallback={null}>
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
        </Suspense>
      </div>
    </>
  );
}
