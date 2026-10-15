# Plataformas móveis

O núcleo de interface e comunicação foi mantido em HTML/CSS/JavaScript para permitir reaproveitamento.

## Próxima etapa

Usar Capacitor para empacotar a mesma interface em Android e iOS:

```powershell
npm.cmd install @capacitor/core @capacitor/cli
npx.cmd cap init ComunicaCess br.cess.comunicacess --web-dir public
npx.cmd cap add android
npx.cmd cap add ios
```

O app móvel não pode iniciar o servidor Node local como o `.exe`. Ele deverá apontar para um servidor de sinalização acessível pela rede, configurado por `SIGNALING_URL` ou por uma tela de configuração.

Android pode ser compilado no Windows com Android Studio. A compilação iOS exige macOS e Xcode; o código será compartilhado, mas essa exigência da Apple permanece.

Antes do teste móvel, configurar HTTPS local ou um servidor de desenvolvimento com certificado, pois navegadores móveis restringem acesso ao microfone em páginas HTTP comuns.

