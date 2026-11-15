import { Link } from 'react-router-dom';
import { PUBLIC_NAVIGATION_LINKS } from '../PublicNavigation/publicNavigationLinks';

export function PublicFooter() {
  return (
    <footer
      id="contato"
      className="mx-auto w-full max-w-7xl scroll-mt-8 px-5 pb-5 text-[#1d2931] sm:px-8 lg:px-12"
    >
      <div className="grid gap-6 border-y border-[#627688] py-6 text-sm sm:grid-cols-3">
        <div className="flex flex-col justify-between">
          <div>
          <h2 className="font-inria text-[24px] font-bold">Tamara V. Delis</h2>
          <p className="mt-1 text-[14px]">CRP 06/106405</p>
          </div>
          <div>
          <p className="text-[14px] leading-relaxed">
            Psicóloga Clínica
            <br />
            Psicoterapia Psicanalítica
          </p>
          </div>
        </div>
        <div>
          <h2 className="font-inria text-[24px] font-bold">Atendimento</h2>
          <p className="mt-1 text-[14px] leading-relaxed">
            R. Aristides Lobo, 224 - Centro, Itapetininga - SP
          <br />
           
            Andar 4 - sala 404
            <br />
            Presencial em Itapetininga e Sorocaba
            <br />
            Atendimento online
          </p>
        </div>
        <nav aria-label="Navegação do rodapé">
          <h2 className="font-inria text-[24px] font-bold">Navegação</h2>
          <ul className="mt-1 space-y-1 text-[14px]">
            {PUBLIC_NAVIGATION_LINKS.slice(1).map(({ label, href }) => (
              <li key={href}>
                <a className="hover:underline focus-visible:underline" href={href}>
                  {label}
                </a>
              </li>
            ))}
            
            {/* <li>
              <Link
                className="hover:underline focus-visible:underline"
                to="/politica-de-privacidade"
              >
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link className="hover:underline focus-visible:underline" to="/termos-de-servico">
                Termos de Serviço
              </Link>
            </li> */}
          </ul>
        </nav>
      </div>
      <p className="pt-3 text-center text-xs">
        © {new Date().getFullYear()} Tamara V. Delis — Todos os direitos reservados.
      </p>
    </footer>
  );
}
