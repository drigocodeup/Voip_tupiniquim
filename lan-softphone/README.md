# ComunicaCess — MVP

Versão inspirada no fluxo de um softphone, para comunicação de áudio entre dois computadores ou celulares na mesma rede local. A identidade usa o nome `ComunicaCess`, azul institucional e os ativos fornecidos na pasta `assets`.

## Como executar

```powershell
cd microsip-copy-plan\lan-softphone
npm.cmd install
npm.cmd start
```

## Gerar executável Windows

As dependências de Electron estão configuradas em `package.json`. O executável de teste foi gerado em:

```text
dist-fixed\win-unpacked\ComunicaCess.exe
```

Copie a pasta inteira `dist-portable\win-unpacked` para o outro notebook; não copie somente o `.exe`, pois ele precisa das DLLs e da pasta `resources`.

O tamanho aproximado do executável gerado é 210 MB por incluir o runtime Chromium/Electron.

Se aparecer `EADDRINUSE ... 8787`, já existe uma instância do servidor em execução. Nesse caso, abra diretamente `http://localhost:8787` ou use outra porta no Prompt de Comando:

```cmd
set PORT=8788&& npm.cmd start
```

Depois abra `http://localhost:8788`. Para descobrir quem está usando a porta:

```cmd
netstat -ano | findstr :8787
```

Só encerre o PID encontrado se tiver certeza de que ele pertence a uma instância anterior do LAN Softphone:

```cmd
taskkill /PID NUMERO_DO_PID /F
```

`0.0.0.0` não deve ser digitado no navegador. Esse endereço significa “escutar em todas as interfaces”. Use `http://localhost:PORTA` no próprio computador ou o endereço IPv4 mostrado pelo servidor, como `http://192.168.0.10:PORTA`, em outro dispositivo da rede.

Abra `http://localhost:8787` no computador. Para outro dispositivo, use o IP local do computador que executa o servidor, por exemplo `http://192.168.0.10:8787`.

## Primeiro teste

1. Abra a aplicação em dois dispositivos na mesma rede.
2. Informe nomes diferentes.
3. Use o mesmo código de sala, como `OFICINA-01`.
4. Aguarde aparecer `2/2 participantes`.
5. Inicie o áudio em um dos dispositivos e permita o microfone.

## Limitações atuais

- Duas pessoas por sala.
- Áudio somente.
- Sinalização sem autenticação, adequada apenas para laboratório.
- `iceServers: []`: depende da conectividade direta na mesma rede.
- Em celulares, o navegador normalmente exige HTTPS para liberar o microfone; o próximo passo será configurar HTTPS local com certificado de desenvolvimento.
- Ainda não há histórico, contatos, autenticação, gravação ou chamadas para números externos.
- A versão Windows é um empacotamento de teste; a assinatura de código ainda não foi configurada.

## Segurança

Não usar este MVP para comunicação sensível ou exposição na internet. O áudio é negociado entre os navegadores, mas o servidor de sinalização ainda não autentica salas nem participantes.

# Descoberta automática Windows

O servidor da sala agora é eleito automaticamente pelo menor identificador entre os dispositivos descobertos. Assim, os dois notebooks podem apenas usar o mesmo código de sala; não é necessário escolher manualmente o IP do servidor.

Cada ComunicaCess anuncia sua presença na rede local por UDP na porta `39555` e expõe a lista de dispositivos vistos em `/api/peers`. A tela inicial atualiza essa lista automaticamente a cada quatro segundos.

Para uma chamada entre dois notebooks:

1. Abra o ComunicaCess nos dois notebooks conectados à mesma rede privada.
2. Aguarde os nomes aparecerem em `Computadores encontrados na rede`.
3. Em ambos, selecione o mesmo computador como servidor da chamada.
4. Use o mesmo código de sala e nomes diferentes.
5. Quando aparecerem dois participantes, clique em `Chamar`.

O firewall precisa permitir o ComunicaCess na rede privada. Redes Wi-Fi com isolamento de clientes podem impedir a descoberta ou o áudio direto.
