# Replicar o checkout e adicionar doação anônima

## Resultado
- Refazer a apresentação de `/pix` para seguir o checkout de referência, preservando a integração Pix e os rastreamentos atuais.
- Usar a logo horizontal da Vakinha já disponível em `public/`.
- Manter os valores escolhidos exatamente como exibidos e somar adicionais separadamente.

## Fluxo da doação
- Organizar seleção de valor, adicionais, resumo e identificação na mesma sequência da referência.
- Adicionar a opção **Quero doar anonimamente**.
- No modo normal, solicitar e validar nome, e-mail, CPF e celular.
- No modo anônimo, exibir e exigir somente CPF e celular; ao gerar o Pix, criar um nome anônimo e um e-mail técnico aleatórios, mantendo CPF e celular informados pelo doador.
- Mostrar erros próximos aos campos e impedir envio duplicado durante a geração.

## Pagamento e rastreamento
- Preservar a criação da cobrança UrusPay, QR Code, Pix copia e cola e consulta automática do pagamento.
- Enviar à cobrança o valor exato selecionado, os adicionais, CPF/celular e a identidade adequada ao modo escolhido.
- Preservar Meta Pixel, CAPI, UTMify, UTMs e deduplicação por identificador de evento.

## Validação
- Simular o fluxo normal e o anônimo sem concluir pagamento real.
- Conferir valores predefinidos, adicional, campos visíveis, validações, abertura do Pix e navegação em celular e computador.
- Verificar imagens, erros da página e compilação.

## Detalhes técnicos
- Dados aleatórios anônimos serão gerados no momento do envio, com domínio reservado e sem representar uma pessoa real.
- A validação continuará no navegador e no servidor; CPF e celular não serão inventados nem omitidos.
