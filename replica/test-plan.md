# Plano de testes do softphone SIP

## Ambiente

Usar somente contas, servidor SIP, contatos e números de laboratório. Não automatizar chamadas reais.

## Casos

- `F01-H1`: conta válida registra e mostra estado online.
- `F01-N1`: senha inválida mostra erro sem revelar credencial.
- `F01-E1`: servidor indisponível permite cancelar e tentar novamente.
- `F02-H1`: chamada de laboratório conecta, transmite áudio e encerra.
- `F02-E1`: destino inválido não cria sessão incompleta no histórico.
- `F02-E2`: microfone ausente impede chamada ou avisa antes do envio.
- `F03-H1`: chamada recebida pode ser aceita ou rejeitada.
- `F04-H1`: contato inicia chamada e gera histórico.
- `F05-E1`: perda de rede mostra reconexão sem travar a interface.
- `F05-E2`: fechar e reabrir mantém preferências, sem senha em texto claro.

## Critérios

Nenhuma senha em logs; nenhuma chamada real; histórico apagável; estado de registro e chamada sempre visível.

