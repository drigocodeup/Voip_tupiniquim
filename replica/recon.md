# Recon inicial — cliente SIP para Windows

## Evidência local

- Executável: `C:\Users\CESS UFF\AppData\Local\MicroSIP\MicroSIP.exe`.
- Distribuição observada: executável, DLL de áudio, idiomas, sons, licença e desinstalador.
- Perfil separado: `%APPDATA%\MicroSIP` com banco de chamadas, banco de contatos, XML de contatos e INI.
- O perfil é dado sensível e fica fora da reconstrução.

## Objetivo

Criar um softphone SIP próprio para uso autorizado, com conta configurável, registro, discador, contatos, histórico e chamadas de áudio. A primeira versão usará um servidor SIP de teste próprio ou laboratório.

## Telas a confirmar

| ID | Tela/área | Função | Estados |
|---|---|---|---|
| S01 | Janela principal | status da conta, discador e ações | offline, registrando, registrado, erro |
| S02 | Configuração de conta | servidor, usuário, domínio e transporte | vazio, válido, inválido |
| S03 | Discador | digitar destino e iniciar chamada | vazio, parcial, inválido |
| S04 | Chamada ativa | áudio e controles | chamando, conectado, mudo, espera, encerrando |
| S05 | Contatos | procurar, criar, editar e chamar | vazio, contato, duplicado |
| S06 | Histórico | chamadas recebidas, efetuadas e perdidas | vazio, filtro, falha de persistência |
| S07 | Preferências | áudio, notificações, atalhos e idioma | alteração, restauração |
| S08 | Mensagens de estado | avisos de rede, registro e áudio | timeout, autenticação recusada, dispositivo ausente |

## Fluxos prioritários

### F01 — Registrar conta de laboratório

S02 → S01 → S08. Configurar uma conta SIP de teste, registrar e mostrar o estado sem exibir a senha.

### F02 — Fazer chamada de áudio

S03 → S04 → S08. Discar um destino de laboratório, conectar, desligar e registrar o resultado.

### F03 — Receber e atender

S01 → S04 → S08. Receber convite, aceitar, rejeitar ou deixar expirar.

### F04 — Contato e histórico

S05 → S03 → S04 → S06. Criar contato, chamar, persistir evento e filtrar o histórico.

### F05 — Falha e recuperação

S02/S01 → S08. Servidor indisponível, senha inválida, perda de rede, microfone ausente e reconexão.

## Entidades

- `SipAccount`: identidade, domínio, transporte, estado e referência segura à credencial.
- `Contact`: nome, identificador SIP, rótulos e favoritos.
- `CallSession`: direção, destino, estado, timestamps e motivo de encerramento.
- `CallLog`: resumo persistido da sessão.
- `AudioDevice`: entrada, saída, volume e dispositivo selecionado.
- `Preference`: atalhos, notificações, idioma e opções locais.

## Fora do MVP

Vídeo, gravação automática, mensagens avançadas, múltiplas contas complexas, integração com PABX de terceiros e migração dos bancos do MicroSIP.

## Pendências

1. Confirmar visualmente os painéis e menus.
2. Usar somente uma conta SIP de laboratório.
3. Confirmar codecs e transportes necessários.
4. Medir o comportamento ao minimizar, fechar e reconectar.

