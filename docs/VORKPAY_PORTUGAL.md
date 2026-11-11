# VorkPay — checkout Portugal

A página /doar aceita EUR por MB WAY e Multibanco. A API e o SDK ficam no servidor; o navegador recebe apenas a chave pública e usa o componente oficial de origem.

## Configuração de produção

Projeto Vercel: a, domínio https://www.juntos-por-vidas.online.

- NSQPAY_SECRET_KEY: chave da conta atual, variável sensível.
- NSQPAY_WEBHOOK_SECRET: segredo do endpoint ativo (não confundir com o segredo geral da conta), variável sensível.
- NSQPAY_PUBLIC_KEY: chave pública da mesma conta.
- NSQPAY_INSTALL_ID: identificador do pacote descarregado da mesma conta.
- NSQPAY_STORE_URL: https://www.juntos-por-vidas.online.
- NSQPAY_ENVIRONMENT: live.
- NSQPAY_PAYMENTS_ENABLED: true; controla apenas criação de pagamentos, nunca callbacks de pedidos existentes.
- NSQPAY_LEGACY_CONFIG: JSON sensível com secretKey, webhookSecret, storeUrl, installId e environment da conta anterior. Mantém consultas e callbacks dos pagamentos antigos.
- UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN: persistência atómica existente.

Nunca incluir segredos no repositório, frontend ou logs.

## Migração de conta — 11/11/2026

Documentação oficial revista: https://vorkpay.com/docs/connect e https://vorkpay.com/docs/api-reference.
O SDK descarregado da nova conta tem o mesmo SHA-256 do módulo instalado: 253c5892b4260c6a5349132713bd1038469376c62ab7a58d51459ed779d0b8b0.
O prebuild restaura e verifica esse módulo; o bundle do navegador não o importa.

Novos pedidos guardam providerInstallId. Pedidos antigos sem esse campo pertencem à configuração legacy. Consultas e ativações usam a conta associada ao pedido. O webhook aceita assinaturas de ambas as contas, mas a transação Redis exige que a conta assinante corresponda à conta do pedido, além de conferir transactionId, montante e moeda. Assinaturas modernas inválidas não recuam para o formato antigo.

Não revogar a configuração anterior enquanto existirem pagamentos pendentes ou possíveis reembolsos. Uma nova migração precisa preservar todas as contas ainda em uso; a configuração atual suporta a conta corrente e uma anterior.

## Fluxo e confirmação

1. POST /api/nsq-payments, action prepare: valida nome, email, telefone MB WAY, donativo e extras; calcula o total no servidor e cria pedido/token persistidos.
2. O componente https://www.nsqpay.com/sdk/nsq-connect.js captura origem e campanhas reais para o mesmo pedido, valor e moeda.
3. action pay: autoriza o token, bloqueia repetição concorrente e usa o SDK para init + ativação. Um timeout nunca autoriza criar outra cobrança.
4. POST https://www.juntos-por-vidas.online/api/nsq-webhook: verifica o corpo bruto, assinatura e associação financeira; persiste estado e deduplicação atomicamente.
5. Apenas payment.success verificado confirma a doação. A rotina idempotente existente envia email Resend e recibo PDF; pendência e criação de referência não enviam confirmação.
6. O checkout consulta o estado local autorizado. Consultas pontuais ao processador recuperam referências, sem marcar como pago.

## Validação

npm run test:nsq cobre ambos os métodos com transporte simulado, eventos, assinaturas inválidas, falha de rede, autorização, referências e isolamento entre contas durante a migração.
A consulta autenticada da nova conta a uma referência inexistente retornou 404 Transaction not found, sem criar pagamentos.
O teste de conectividade do painel envia webhook.test: verifica a entrega HTTPS e assinatura, sem alterar pedidos ou emitir recibos.

Os testes simulados e webhook.test não comprovam liquidação bancária. A confirmação ponta a ponta de uma doação real depende de pagamento autorizado pelo doador. Não executar cobranças reais automaticamente durante testes.
