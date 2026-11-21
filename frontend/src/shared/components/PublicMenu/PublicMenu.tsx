import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WHATSAPP_URL } from '../../data/contact';
import { PUBLIC_NAVIGATION_LINKS } from '../PublicNavigation/publicNavigationLinks';

export function PublicMenu({ dark = false, cream = false }: { dark?: boolean; cream?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className={`sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pb-2 pt-4 lg:px-8`}>
      <a href="/#inicio" aria-label="Tamara Delis, início" className="shrink-0">
        <img src={dark ? '/logo.svg' : '/logo_brown.svg'} alt="Tamara Delis Psicologia" className="h-8 w-auto" />
      </a>

      <nav
        aria-label="Navegação principal"
        className={`hidden w-fit max-w-full flex-none items-center gap-1 overflow-x-auto rounded-full px-2 py-1 text-[16px] text-[#28241f] lg:flex lg:justify-center ${cream ? 'bg-[#f5e6d6]' : 'bg-[#fff0de]'}`}
      >
        {PUBLIC_NAVIGATION_LINKS.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            aria-current={(href === '/duvidas' || href === '/sobre-mim') && pathname === href ? 'page' : undefined}
            className="shrink-0 rounded-full px-2.5 py-2 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#703a20] aria-[current=page]:font-bold"
          >
            {label}
          </a>
        ))}
      </nav>

      <a
        href={WHATSAPP_URL}
        className="hidden min-h-10 shrink-0 items-center justify-center rounded-full bg-[#713a20] px-4 py-2 text-[16px] font-semibold text-white transition-colors hover:bg-[#562b18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713a20] lg:inline-flex"
      >
        Agendar sessão
      </a>

      <button
        type="button"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex size-10 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden ${dark ? 'text-[#fff0de] focus-visible:outline-[#fff0de]' : 'text-[#713a20] focus-visible:outline-[#713a20]'}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="size-8"
        >
          {isOpen ? (
            <path d="M5 5l14 14M19 5L5 19" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>

      <div
        id="mobile-navigation"
        className={`${isOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-3 px-5 pb-5 pt-2 shadow-md lg:hidden ${dark ? 'bg-[#4d5841] text-[#fff0de]' : cream ? 'bg-[#fff0de]' : 'bg-[#a8bfd0]'}`}
      >
        <nav aria-label="Navegação principal mobile" className="flex flex-col">
          {PUBLIC_NAVIGATION_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              aria-current={(href === '/duvidas' || href === '/sobre-mim') && pathname === href ? 'page' : undefined}
              onClick={() => setIsOpen(false)}
              className={`rounded-md px-3 py-2 text-[16px] focus-visible:outline-2 aria-[current=page]:font-bold ${dark ? 'hover:bg-white/10 focus-visible:outline-[#fff0de]' : 'text-[#28241f] hover:bg-white/50 focus-visible:outline-[#713a20]'}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href={WHATSAPP_URL}
          onClick={() => setIsOpen(false)}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#713a20] px-4 py-2 text-[16px] font-semibold text-white transition-colors hover:bg-[#562b18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713a20]"
        >
          Agendar sessão
        </a>
      </div>
    </header>
  );
}
