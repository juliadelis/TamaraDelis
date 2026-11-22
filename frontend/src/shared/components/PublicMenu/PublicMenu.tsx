import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WHATSAPP_URL } from '../../data/contact';
import { ATENDIMENTOS_LINKS, PSICOTERAPIA_LINKS, PUBLIC_NAVIGATION_LINKS } from '../PublicNavigation/publicNavigationLinks';

const submenus: Record<string, readonly { label: string; href: string }[]> = {
  '/psicoterapia': PSICOTERAPIA_LINKS,
  '/atendimentos': ATENDIMENTOS_LINKS,
};

export function PublicMenu({ dark = false, cream = false }: { dark?: boolean; cream?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopSubmenuOpen, setDesktopSubmenuOpen] = useState<string | null>(null);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const { pathname } = useLocation();
  const mobileBackground = dark ? 'bg-[#4d5841]' : cream ? 'bg-[#fff0de]' : 'bg-[#a8bfd0]';

  return (
    <header className={`sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pb-2 pt-4 lg:bg-transparent lg:px-8 ${isOpen ? mobileBackground : ''}`}>
      <a href="/#inicio" aria-label="Tamara Delis" className="flex size-15 shrink-0 items-center justify-center rounded-full bg-[#fff0de] p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713a20] lg:size-auto lg:bg-transparent lg:p-0">
        <img src="/logo_brown.svg" alt="Tamara Delis Psicologia" className={`h-7 w-auto lg:h-8 ${dark ? 'lg:hidden' : ''}`} />
        {dark && <img src="/logo.svg" alt="" className="hidden h-8 w-auto lg:block" />}
      </a>

      <nav
        aria-label="Navegação principal"
        className={`hidden w-fit max-w-full flex-none items-center gap-1 rounded-full px-2 py-1 text-[16px] text-[#28241f] lg:flex lg:justify-center ${cream ? 'bg-[#f5e6d6]' : 'bg-[#fff0de]'}`}
      >
        {PUBLIC_NAVIGATION_LINKS.map(({ label, href }) => submenus[href] ? (
          <div
            key={href}
            className="relative flex shrink-0 items-center"
            onMouseEnter={() => setDesktopSubmenuOpen(href)}
            onMouseLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement)) setDesktopSubmenuOpen((open) => open === href ? null : open);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setDesktopSubmenuOpen((open) => open === href ? null : open);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && desktopSubmenuOpen === href) {
                setDesktopSubmenuOpen(null);
                event.currentTarget.querySelector('button')?.focus();
              }
            }}
          >
            <button
              type="button"
              aria-expanded={desktopSubmenuOpen === href}
              aria-controls={`desktop-${href.slice(1)}-submenu`}
              onClick={() => setDesktopSubmenuOpen((open) => open === href ? null : href)}
              className={`rounded-full px-2.5 py-2 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#703a20] ${pathname === href || pathname.startsWith(`${href}/`) ? 'font-bold' : ''}`}
            >
              {label}
            </button>
            <div
              id={`desktop-${href.slice(1)}-submenu`}
              hidden={desktopSubmenuOpen !== href}
              className="absolute left-0 top-full z-50 min-w-64 rounded-2xl bg-[#fff0de] p-2 shadow-lg"
            >
              {submenus[href].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className="block rounded-lg px-3 py-2 hover:bg-white focus-visible:outline-2 focus-visible:outline-[#703a20] aria-[current=page]:font-bold"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ) : (
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
        onClick={() => {
          setIsOpen((open) => !open);
          setMobileSubmenuOpen(null);
        }}
        className="inline-flex size-12 items-center justify-center rounded-full bg-[#fff0de] text-[#713a20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713a20] lg:hidden"
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
        className={`${isOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-3 px-5 pb-5 pt-2 shadow-md lg:hidden ${mobileBackground} ${dark ? 'text-[#fff0de]' : ''}`}
      >
        <nav aria-label="Navegação principal mobile" className="flex flex-col">
          {PUBLIC_NAVIGATION_LINKS.map(({ label, href }) => submenus[href] ? (
            <div key={href}>
              <button
                type="button"
                aria-expanded={mobileSubmenuOpen === href}
                aria-controls={`mobile-${href.slice(1)}-submenu`}
                onClick={() => setMobileSubmenuOpen((open) => open === href ? null : href)}
                className={`w-full rounded-md px-3 py-2 text-left text-[16px] focus-visible:outline-2 ${pathname === href || pathname.startsWith(`${href}/`) ? 'font-bold' : ''} ${dark ? 'hover:bg-white/10 focus-visible:outline-[#fff0de]' : 'text-[#28241f] hover:bg-white/50 focus-visible:outline-[#713a20]'}`}
              >
                {label}
              </button>
              <div id={`mobile-${href.slice(1)}-submenu`} hidden={mobileSubmenuOpen !== href} className="pl-4">
                {submenus[href].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-md px-3 py-2 text-[16px] focus-visible:outline-2 aria-[current=page]:font-bold ${dark ? 'hover:bg-white/10 focus-visible:outline-[#fff0de]' : 'text-[#28241f] hover:bg-white/50 focus-visible:outline-[#713a20]'}`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
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
