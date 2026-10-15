# Arquitetura proposta — softphone SIP próprio

## Princípios

- Usar somente servidor SIP e credenciais do usuário.
- Armazenar senhas no armazenamento seguro do sistema ou em segredo local protegido.
- Testar com servidor e contas de laboratório.
- Separar núcleo de chamadas, áudio, interface e persistência.

## Módulos

1. `sip-core`: registro, INVITE, BYE, estados e timeouts.
2. `media-core`: captura, reprodução, codecs e níveis de áudio.
3. `account-store`: contas sem segredos em logs.
4. `contacts-store`: contatos e favoritos locais.
5. `call-history`: resumo, retenção e exclusão.
6. `desktop-ui`: discador, status, controles e configurações.
7. `test-harness`: servidor SIP simulado e dispositivos de áudio virtuais.

## Stack candidata

Rust + Tauri ou C++/Qt, conforme suporte a Windows, áudio, codecs e licença das bibliotecas SIP. A escolha final será feita antes da implementação. Nada será copiado do MicroSIP.

## Vertical slice

1. Servidor SIP de teste local.
2. Configurar uma conta.
3. Registrar.
4. Fazer chamada de áudio entre endpoints de laboratório.
5. Atender e desligar.
6. Persistir o resumo.
7. Reabrir sem importar o perfil original.

## Riscos

NAT, firewall, transporte SIP, eco, latência, dispositivos de áudio, re-registro, perda de rede, licenciamento de codecs e vazamento de credenciais.

