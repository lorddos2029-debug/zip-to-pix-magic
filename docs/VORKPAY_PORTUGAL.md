# Checkout de donativos Portugal — VorkPay Connect

## Estado

- Rota **/doar** criada com a logo Juntos por Vidas, preços EUR, MB WAY/Multibanco e sem CPF.
- Rota **/pix** (Brasil) permanece separada.
- **Geração de pagamentos REAIS NÃO ATIVADA.** Esta rota não cria cobranças e informa claramente que está em preparação.
- A documentação fornecida, `https://www.nsqpay.com/docs/connect`, e `https://vorkpay.com/docs`, não pôde ser verificada nesta sessão.
- O pacote oficial `nsqpay.mjs` NÃO foi fornecido nem instalado. Não inventar SDK/endpoints/respostas.
- Existem dois projetos Vercel ligados ao mesmo repositório (`a` e `lojka`); não presumir qual é o destino correto das credenciais.

## Requisitos para integração real

1. Transferir o cliente oficial em **VorkPay > VorkPay Connect > Descarregar cliente**, validar integridade e API pública, e manter o módulo Node.js **somente no servidor** (Node 20+).
2. Configurar em projeto Vercel correto (apenas server env): `NSQPAY_SECRET_KEY`, `NSQPAY_WEBHOOK_SECRET`, `NSQPAY_STORE_URL`, `NSQPAY_INSTALL_ID`; `NSQPAY_ENVIRONMENT=test` antes de `live`. Configurar chave pública conforme instruções verificadas do pacote.
3. Implementar criação de encomenda confiável e persistente no backend. Usar `orderId` estável, montante inteiro `amountInCents`, `currency: "EUR"`, `method: "mbway" | "multibanco"`, `customer`, `items`, `originToken` e `trackingParameters` reais. Recalcular valores no servidor: **não confiar nos preços enviados pelo navegador**.
4. Para MB WAY, validar telemóvel português de **9 dígitos sem indicativo**; Multibanco deve exibir `entity`, `reference` e `expiresAt` fornecidos pelo provedor.
5. Carregar `https://www.nsqpay.com/sdk/nsq-connect.js` **somente depois de confirmar autenticidade e contrato**; chamar `NSQConnect.capture({publicKey, orderId, amountInCents, currency:'EUR'})`; se falhar, usar `originToken: null`. Exigir origem HTTPS.
6. Receber webhooks em HTTPS e validar assinatura criptográfica com `nsq.webhooks.verify` sobre o **corpo bruto**. Validar a ordem armazenada, `transactionId`, moeda e total.
7. Gravar no armazenamento durável e de forma atómica, com deduplicação dos eventos. Apenas `payment.success` verificado autoriza estado pago; tratar `payment.refunded`, falha e cancelamento. Responder HTTP 2xx **após** commit; falhas temporárias 5xx.
8. Autenticar o comprador ao consultar o pedido. Atualizar o estado da página através de canal autenticado depois do webhook, sem polling permanente ao provedor.
9. Confirmar UTMify pela integração do painel da VorkPay; preservar exclusivamente UTMs reais. Não marcar Purchase com base num redirect ou resposta do navegador.
10. Testar MB WAY, Multibanco, webhook assinado / assinatura inválida, duplicados, falha de rede, reembolso, acesso de outro comprador e estados pendentes. Só então mudar para `live` com credenciais novas e webhook da **mesma conta**, e validar uma transação real autorizada.

### Segurança
Chaves secretas previamente partilhadas em conversa devem ser **rotacionadas** no painel do VorkPay antes de entrar em produção. Nunca incluir chaves privadas num commit Git, ficheiro público, variável com prefixo `VITE_` ou bundle do navegador.

### URLs
- Página Portugal: `/doar`
- Página Pix existente: `/pix`
- Futuro webhook: endpoint HTTPS próprio, definido após verificar o SDK, protegido por assinatura.
