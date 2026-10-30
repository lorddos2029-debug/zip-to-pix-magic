# Integração VorkPay Connect — Portugal

## Ambientes e estado verificado

- Repositório: **lorddos2029-debug/zip-to-pix-magic**, branch \`main\`.
- Destino Vercel: equipa \`lojas5\`, projeto **a** (\`prj_wkyy6uOpPH6y3F0nRyTZVEi0siyY\`).
- Domínio da loja: \`https://www.juntos-por-vidas.online\`.
- Página de Portugal: **/doar**, EUR, MB WAY e Multibanco, sem CPF.
- O Pix do Brasil continua em **/pix**, em BRL, separado para não confundir a moeda cobrada.
- SDK NSQ Connect 1.0 fornecido pelo proprietário em \`nsq-connect-v1.zip\` instalado como bundle de código-fonte comprimido, verificado pelo SHA-256 \`253c5892b4260c6a5349132713bd1038469376c62ab7a58d51459ed779d0b8b0\`. O \`prebuild\` e o \`predev\` reconstroem o módulo completo \`src/vendor/nsqpay.mjs\`; nunca é carregado no browser.
- **A emissão real continua bloqueada por \`NSQPAY_PAYMENTS_ENABLED=false\`.** As chaves live fornecidas estão configuradas como variáveis de servidor no projeto correto, mas ainda não houve transação real, validação com a administração da VorkPay ou registo confirmado do webhook.
- Não marcar como pago com a criação de um pedido, redirect nem eventos do navegador.

## Ambiente Vercel (produção)

Configurar as seguintes variáveis **só no servidor**:

| Variável | Uso |
| --- | --- |
| \`NSQPAY_SECRET_KEY\` | chave secreta de live; guardada de forma cifrada |
| \`NSQPAY_WEBHOOK_SECRET\` | segredo de assinatura; guardado de forma cifrada |
| \`NSQPAY_PUBLIC_KEY\` | chave pública usada pelo componente no browser |
| \`NSQPAY_STORE_URL\` | \`https://www.juntos-por-vidas.online\` |
| \`NSQPAY_INSTALL_ID\` | identificador de instalação do pacote |
| \`NSQPAY_ENVIRONMENT\` | \`live\` para as credenciais de produção; usar \`test\` apenas com uma chave \`nsq_sk_test_v2_...\` |
| \`NSQPAY_PAYMENTS_ENABLED\` | \`false\` até os ensaios serem aprovados |
| \`UPSTASH_REDIS_REST_URL\` | armazenamento atómico das encomendas, existente neste projeto |
| \`UPSTASH_REDIS_REST_TOKEN\` | acesso ao Redis, existente neste projeto |

Não guardar credenciais no repositório, bundles de frontend, documentação ou logs. Como as chaves live foram partilhadas numa conversa, **rotacioná-las no VorkPay antes da ativação**.

## Fluxo do checkout

1. \`GET /api/nsq-payments\` verifica se a integração foi habilitada e entrega apenas chave pública e ambiente.
2. \`POST /api/nsq-payments\` com \`action:"prepare"\` valida nome, email, número MB WAY de nove dígitos (se aplicável), doação em cêntimos e extras. Os extras e preços são definidos no servidor. Total máximo: 500000 cêntimos.
3. O backend cria \`orderId\` estável, token de acesso aleatório e hash do token no Redis. Restringe o número de pedidos por IP.
4. No browser, o componente oficial \`https://www.nsqpay.com/sdk/nsq-connect.js\` tenta \`NSQConnect.capture({publicKey,orderId,amountInCents,currency:"EUR"})\`. Se falhar, \`originToken:null\`; preserve apenas parâmetros de campanha reais.
5. \`POST /api/nsq-payments\` com \`action:"pay"\` autoriza o token, bloqueia concorrência com Lua atómico e chama \`nsq.payments.create\` exclusivamente no servidor. Aceita só o método e valor do pedido guardado.
6. Guarda \`transactionId\` e detalhes sanitizados \`entity\`, \`reference\` e \`expiresAt\`. Resultado inicial é **pending**, nunca paid. Em erro incerto, bloqueia reenvios automáticos.
7. \`POST /api/nsq-webhook\` lê corpo bruto, chama \`nsq.webhooks.verify\`, valida encomenda, transactionId, moeda EUR e centavos, deduplica e atualiza pedido numa transação Lua atómica. Responde 2xx só após persistir; 5xx em falha transitória.
8. A página consulta **apenas o armazenamento autenticado da própria loja** por um período limitado; não há polling permanente à API do processador. O status \`paid\` só aparece depois de \`payment.success\` verificado. \`payment.refunded\` permanece reembolsado mesmo quando eventos atrasados chegam.
9. UTMify para pagamentos PT deve ser configurada no painel VorkPay Connect > UTMify. Não inventar parâmetros ou disparar Purchase prematuramente.

## URL do webhook

Registar no **painel da mesma conta VorkPay Connect**:

\`https://www.juntos-por-vidas.online/api/nsq-webhook\`

O endpoint existir no código não configura a entrega de webhooks na conta do provedor. Confirmar assinatura, eventos e entrega na administração antes de habilitar pagamentos.

## Testes executados

Localmente contra o SDK fornecido, com API simulada e **sem chamadas reais**:

- MB WAY: início e geração simulados, OK.
- Multibanco: início e geração simulados, OK.
- \`payment.success\`, \`payment.refunded\`, \`payment.failed\`, \`payment.cancelled\`: verificação de assinatura, OK.
- Assinatura adulterada: rejeitada, OK.
- Falha de rede: o SDK devolveu \`NETWORK_ERROR\`, OK.
- Telemóvel com indicativo: rejeitado pelo SDK, OK.

Comando repetível no repositório: \`npm run test:nsq\`.

## Ainda obrigatório antes de live operacional

- Rotacionar chaves e atualizar valores na Vercel.
- Registar e testar o webhook real no painel VorkPay; confirmar o formato dos dados, especialmente \`orderId\`, \`transactionId\`, \`amountInCents\` (ou \`amount\`) e \`currency\`.
- Testar a deduplicação e mutações atómicas contra o Redis do projeto, reembolso, autorização por token de outro comprador e entrega repetida/fora de ordem.
- Confirmar o componente \`nsq-connect.js\` e parâmetros de origem no domínio público HTTPS.
- Testar em ambiente \`test\` com chave de teste do painel, depois confirmar uma venda **autorizada** em \`live\`, verificando a conta beneficiária e a conciliação com a administração.
- Somente então mudar \`NSQPAY_PAYMENTS_ENABLED=true\` no projeto \`a\` e redeploy.

Não executar cobranças reais automaticamente durante testes.
