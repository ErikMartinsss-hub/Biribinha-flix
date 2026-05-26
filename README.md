# 🎬 BiribinhaFlix

**Agregador de streaming** — Animes, Filmes, Séries, Canais ao vivo e Eventos especiais, tudo em um só lugar.

[![Vercel](https://img.shields.io/badge/deploy-vercel-000?logo=vercel)](https://biribinha-flix.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)](https://expo.dev)

---

## ✨ Funcionalidades

- 🔍 **Busca inteligente** — pesquise por filmes, séries e canais com filtro por tipo
- 📺 **Canais ao vivo** — mais de 100 canais com logos e guia de programação
- 🎥 **TMDB integrado** — capas, sinopses, elenco e temporadas via API do TMDB
- 📱 **Multi-plataforma** — Web (Vite + React) e Mobile (React Native + Expo)
- ⚡ **Player embutido** — assista direto no navegador ou app sem redirecionar
- 🏠 **Categorias** — Animes, Filmes, Séries, Canais, Eventos

## 🚀 Aplicação Web

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 6 |
| Deploy | Vercel (auto-deploy via GitHub) |
| API de conteúdo | [TMDB](https://www.themoviedb.org/) |
| API de streams | Superflix API |
| Canais | Reios Embeds |

### Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

### Build para produção

```bash
npm run build
npm run preview
```

## 📱 Aplicativo Mobile (React Native)

O app mobile fica em um [repositório separado](https://github.com/ErikMartinsss-hub/biribinha-flix-app).

```bash
cd biribinha-flix-app
npm install
npx expo start
```

Escaneie o QR Code com o app **Expo Go** ou pressione `w` para abrir no navegador.

### Stack mobile

| Camada | Tecnologia |
|--------|-----------|
| Framework | React Native (Expo SDK 54) |
| Navegação | @react-navigation (stack) |
| Player | react-native-webview |
| API de conteúdo | TMDB + Superflix API |

## 🗺️ Roadmap

- [x] Web app funcional (busca, categorias, player)
- [x] App mobile com navegação e telas principais
- [ ] Login / favoritos
- [ ] Modo offline (cache de capas)
- [ ] Notificações push para novos episódios
- [ ] Suporte a Chromecast / AirPlay

## 🛠️ APIs utilizadas

- **[TMDB](https://www.themoviedb.org/)** — catálogo de filmes, séries, capas e metadados
- **[Superflix API](https://superflixapi.best)** — streams de filmes e séries
- **[Reios Embeds](https://reidosembeds.com)** — canais ao vivo e eventos

## 📄 Licença

Este projeto é apenas para fins educacionais. Nenhum conteúdo é hospedado diretamente.
