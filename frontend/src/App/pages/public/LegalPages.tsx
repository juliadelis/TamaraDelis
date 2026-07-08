import { Link } from 'react-router-dom';

const updatedAt = '08/07/2026';

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#FFFDF9] px-5 py-8 text-left text-[#31231A]">
      <div className="mx-auto max-w-3xl">
        <Link to="/login" className="text-sm font-semibold text-[#6A3710] underline">
          Voltar para login
        </Link>

        <div className="mt-6 rounded-md border border-[#D79A69] bg-white px-5 py-6 shadow-sm sm:px-8">
          <h1 className="text-2xl font-bold text-[#502815]">{title}</h1>
          <p className="mt-2 text-sm text-[#6B5A4B]">Última atualização: {updatedAt}</p>
          <div className="mt-6 space-y-6 text-sm leading-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-[#502815]">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Política de Privacidade">
      <Section title="1. Objetivo">
        <p>
          Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos
          informações relacionadas ao uso da plataforma Tamara Delis.
        </p>
      </Section>

      <Section title="2. Informações coletadas">
        <p>
          Podemos coletar dados de cadastro do usuário, dados de pacientes registrados pelo usuário,
          informações de agenda, sessões, registros financeiros, observações clínicas inseridas no
          sistema e dados técnicos necessários para login e segurança.
        </p>
      </Section>

      <Section title="3. Uso das informações">
        <p>
          As informações são utilizadas para permitir o funcionamento da plataforma, organizar
          pacientes, sessões, agenda, relatórios, financeiro e integrações autorizadas pelo usuário,
          como Google Agenda.
        </p>
      </Section>

      <Section title="4. Dados sensíveis e responsabilidade profissional">
        <p>
          A plataforma pode armazenar informações sensíveis inseridas pelo próprio usuário. O usuário
          é responsável por registrar somente informações necessárias à sua atividade profissional e
          por cumprir as normas legais, éticas e profissionais aplicáveis.
        </p>
      </Section>

      <Section title="5. Compartilhamento">
        <p>
          Não vendemos dados pessoais. Dados podem ser compartilhados apenas com provedores técnicos
          necessários à operação do sistema, quando exigido por lei, ou quando o usuário autorizar uma
          integração externa.
        </p>
      </Section>

      <Section title="6. Google Agenda">
        <p>
          Quando o usuário conecta o Google Agenda, a plataforma usa a autorização concedida para
          criar, atualizar ou remover eventos relacionados às sessões. O usuário pode revogar esse
          acesso nas configurações da própria conta Google.
        </p>
      </Section>

      <Section title="7. Segurança e retenção">
        <p>
          Adotamos medidas técnicas razoáveis para proteger as informações. Os dados são mantidos
          enquanto necessários para a prestação do serviço, cumprimento de obrigações legais ou até
          solicitação de exclusão, quando aplicável.
        </p>
      </Section>

      <Section title="8. Direitos do titular">
        <p>
          O usuário pode solicitar acesso, correção ou exclusão de seus dados, conforme a legislação
          aplicável. Algumas informações podem ser mantidas quando houver obrigação legal ou
          necessidade legítima de preservação.
        </p>
      </Section>

      <Section title="9. Contato">
        <p>
          Para dúvidas sobre privacidade, segurança ou tratamento de dados, entre em contato pelo
          canal oficial disponibilizado pela responsável pela plataforma.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function TermsOfService() {
  return (
    <LegalLayout title="Termos de Serviço">
      <Section title="1. Aceitação dos termos">
        <p>
          Ao acessar ou usar a plataforma Tamara Delis, o usuário declara que leu, compreendeu e
          concorda com estes Termos de Serviço.
        </p>
      </Section>

      <Section title="2. Finalidade da plataforma">
        <p>
          A plataforma oferece ferramentas para organização de pacientes, agenda, sessões, relatórios
          e controle financeiro. Ela não substitui o julgamento profissional, clínico, ético ou legal
          do usuário.
        </p>
      </Section>

      <Section title="3. Conta e acesso">
        <p>
          O usuário é responsável por manter a confidencialidade de suas credenciais, por toda
          atividade realizada em sua conta e por informar dados corretos durante o uso da plataforma.
        </p>
      </Section>

      <Section title="4. Uso adequado">
        <p>
          O usuário se compromete a utilizar a plataforma de forma lícita, ética e compatível com sua
          atividade profissional, sem inserir conteúdo ilícito, abusivo ou desnecessário.
        </p>
      </Section>

      <Section title="5. Responsabilidade sobre dados de pacientes">
        <p>
          O usuário é responsável por obter bases legais, autorizações ou consentimentos necessários
          para registrar dados de pacientes, quando exigido pela legislação ou por normas
          profissionais aplicáveis.
        </p>
      </Section>

      <Section title="6. Integrações externas">
        <p>
          Funcionalidades como Google Agenda dependem de serviços de terceiros. Falhas, mudanças ou
          indisponibilidades desses serviços podem afetar recursos da plataforma.
        </p>
      </Section>

      <Section title="7. Disponibilidade">
        <p>
          Buscamos manter a plataforma disponível e funcional, mas não garantimos operação
          ininterrupta, livre de erros ou imune a eventos externos, manutenções e indisponibilidades
          técnicas.
        </p>
      </Section>

      <Section title="8. Limitação de responsabilidade">
        <p>
          Na extensão permitida pela lei, a plataforma não será responsável por perdas decorrentes de
          uso inadequado, informações inseridas pelo usuário, decisões profissionais, falhas de
          terceiros ou indisponibilidades temporárias.
        </p>
      </Section>

      <Section title="9. Alterações dos termos">
        <p>
          Estes Termos podem ser atualizados periodicamente. A continuidade do uso após alterações
          indica concordância com a versão vigente.
        </p>
      </Section>

      <Section title="10. Contato">
        <p>
          Dúvidas sobre estes Termos de Serviço podem ser encaminhadas pelo canal oficial
          disponibilizado pela responsável pela plataforma.
        </p>
      </Section>
    </LegalLayout>
  );
}
