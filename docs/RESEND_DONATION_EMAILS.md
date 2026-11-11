# Confirmação de doação por email

Configure apenas no servidor:

- `RESEND_API_KEY`: segredo de envio da Resend.
- `RESEND_FROM_EMAIL`: `Juntos por Vidas <doacoes@juntos-por-vidas.online>` (domínio verificado).
- Upstash Redis REST URL e token já usados pelos pagamentos.

Em Portugal, o envio ocorre depois da assinatura e associação do webhook VorkPay serem validadas e do pedido ser gravado como pago. Eventos repetidos também recuperam envios que falharam. Eventos pendentes, falhados ou reembolsados não disparam confirmação.

No Pix, o servidor consulta a UrusPay e valida o valor antes do envio. A fila só remove o pedido quando as sincronizações existentes e o email estiverem concluídos. O webhook pede nova tentativa em falhas temporárias de email. Emails fictícios de doações anônimas (`example.com`) não são enviados.

O email contém confirmação em HTML e texto, além de um recibo PDF com pedido, doador, valor/moeda, método e data da confirmação. É um comprovante **sem valor fiscal**, não uma NF nem um certificado de dedução fiscal. Não contém CPF, telefone ou tokens de acesso ao pagamento.

Redis guarda um marcador de envio sem expiração e um lock por pedido. A API recebe uma chave de idempotência estável; o corpo completo e o PDF ficam persistidos entre tentativas. Se houver resultado incerto por mais de 23 horas, o pedido exige revisão manual para evitar duplicatas depois das 24 horas de retenção da Resend. Verifique a entrega no painel da Resend antes de intervir nesses registros. Falhas no email não desfazem a confirmação financeira.

Depois de alterar as variáveis, publique um novo deployment. Previews não recebem a chave de produção. Em outros hosts, configure as mesmas variáveis e Redis.

Validação: `node scripts/test-donation-email.mjs`. O teste usa API/Redis simulados, sem enviar a doadores. `--sample` também grava um PDF de exemplo fora do repositório.

Documentação: https://resend.com/docs/api-reference/emails/send-email e https://resend.com/docs/dashboard/emails/idempotency-keys.
