Backend Express com autenticação Supabase

1) Objetivo
- Fornecer rotas de autenticação (register, login) usando Supabase.

2) Configuração
- Copie `.env.example` para `.env` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` com os valores do seu projeto Supabase.

3) Comandos
```
cd backend
npm install
npm run dev
```

4) Endpoints principais
- `POST /api/auth/register` { email, password }
- `POST /api/auth/login` { email, password }
- `POST /api/auth/logout` (opcional)

5) Próximos passos recomendados
- Usar `SUPABASE_SERVICE_ROLE_KEY` apenas para operações administrativas (não expor ao cliente).
- Implementar refresh token / sessão persistente conforme necessário no frontend.
- Proteger rotas com o middleware `requireAuth` em `src/middleware/auth.ts`.
