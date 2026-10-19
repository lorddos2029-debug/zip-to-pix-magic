# Pix / UTMify / Meta — Vercel (sem Supabase)

## Variáveis de ambiente (Production)

- `URUSPAY_API_KEY` — chave real da UrusPay.
- `UTMIFY_API_TOKEN` — token de API da UTMify.
- `FB_CAPI_ACCESS_TOKEN` — token da API de Conversões do **Pixel 2165302517752672**.
- `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` — credenciais de um banco Upstash Redis (fila persistente serverless).
- `CRON_SECRET` — string aleatória longa para proteger a rota interna de reconciliação.

Não use prefixos `VITE_` nas credenciais. Elas só devem existir no servidor.

Opcional: `URUSPAY_WEBHOOK_URL=https://SEU-DOMINIO/api/pix-webhook`.
O sistema normalmente deriva automaticamente a URL HTTPS do domínio da requisição.

Faça **Redeploy** após salvar as variáveis no projeto Vercel correto.

## Funcionamento

1. O servidor gera a cobrança na UrusPay e salva o pedido na fila persistente.
2. O servidor avisa a UTMify imediatamente com `waiting_payment`.
3. Quando a UrusPay chama `/api/pix-webhook`, o servidor consulta `/status/{id}` na UrusPay para verificar se o pagamento realmente foi aprovado.
4. Só após confirmação envia `paid` para UTMify e `Purchase` para Meta CAPI. Mantém o `event_id` capturado para deduplicar eventos do navegador.
5. Se a UTMify ou Meta estiver indisponível, o registro permanece pendente na fila para nova tentativa.
6. `/api/reconcile-pix` executa varredura de segurança via Vercel Cron. É protegida por `CRON_SECRET`.

A Vercel Hobby permite cron apenas uma vez ao dia. Para confirmação rápida quando o visitante fecha o navegador, o **webhook da UrusPay** precisa realmente ser entregue ao endpoint acima. Verifique as entregas de postback no gateway.

## Diagnóstico

- Em Vercel > Logs, procure `[UTMify]`, `[Meta CAPI]`, `[Pix webhook]`, `[Pix cron]`.
- Verifique que o evento `Purchase` aparece na fonte de dados **2165302517752672** do Gerenciador de Eventos da Meta.
- Confirme que a campanha usa essa mesma fonte de dados. O recebimento de um evento não garante atribuição imediata no Gerenciador de Anúncios.
- Nunca envie `paid` ou `Purchase` para uma cobrança apenas gerada.
- O status da Vercel deve ser sucesso. Um projeto com `Account is blocked` não recebe as alterações até a conta ser regularizada.

Sem Upstash configurado, o Pix pode continuar sendo gerado e `waiting_payment` pode ser notificado diretamente, mas a reconciliação independente do navegador **não tem armazenamento persistente garantido na Vercel**.
