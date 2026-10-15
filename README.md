# ComunicaCess

Aplicativo de comunicação de áudio entre computadores na mesma rede local, inspirado no fluxo compacto de um softphone.

## Windows

O executável de teste está em `lan-softphone/dist-green/win-unpacked/ComunicaCess.exe` depois da compilação. Para distribuir, copie a pasta `win-unpacked` inteira.

```powershell
cd lan-softphone
npm.cmd install
npm.cmd start
```

Para gerar a distribuição Windows:

```powershell
npm.cmd run build:win
```

## Comunicação na LAN

Cada instância anuncia presença via UDP na porta `39555`, lista os dispositivos encontrados e elege automaticamente o mesmo servidor de sala. Em dois notebooks:

1. Abra a mesma versão do ComunicaCess nos dois computadores.
2. Permita acesso do aplicativo em redes privadas no Firewall do Windows.
3. Use nomes diferentes e o mesmo código de sala, por exemplo `SALA1`.
4. Aguarde o status `Online` e clique em `Chamar`.

O áudio utiliza WebRTC. O MVP suporta uma sala com até dois participantes e não deve ser exposto diretamente à internet.

## Estrutura

- `lan-softphone/`: aplicativo Windows e servidor local.
- `assets/`: logos e imagens da identidade ComunicaCess.
- `replica/`: documentação de análise e plano de reconstrução.

## Limites atuais

- Sem autenticação de usuários.
- Sem histórico persistente de chamadas.
- Descoberta limitada à rede local e ao comportamento do roteador Wi-Fi.
- Android e Apple serão adicionados depois da validação Windows.
