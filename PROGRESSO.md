# Progresso do Projeto - LUTA Fighting Game

> **Última atualização:** 20/02/2026
> **Arquivo de plano completo:** `C:\Users\User\.claude\plans\peppy-swimming-finch.md`

---

## Resumo do Estado Atual

O projeto está com **todas as 8 fases completas**. A base modular está sólida, mecânicas de combate avançadas foram implementadas, sistema de áudio programático está pronto, sistema de cenas com menus completos, 5 novos personagens no roster, efeitos visuais (screen shake, partículas, damage numbers, combo display), 3 modos de jogo (Versus, Arcade com IA, Treino), sistema de rounds (best of 3), e canvas responsivo.

### Progresso por Fase

| Fase | Descrição | Status |
|------|-----------|--------|
| **1** | Refatoração e Fundação | ✅ Completa |
| **2** | Melhorias de Gameplay | ✅ Completa |
| **3** | Sistema de Áudio | ✅ Completa |
| **4** | UI e Menus (HTML/CSS Overlays) | ✅ Completa |
| **5** | Novos Personagens (5 novos) | ✅ Completa |
| **6** | Efeitos Visuais | ✅ Completa |
| **7** | Modos de Jogo (IA, Rounds, Treino) | ✅ Completa |
| **8** | Polish Final | ✅ Completa |

---

## O que já foi implementado

### Fase 1 - Refatoração e Fundação ✅

**Código monolítico (~560 linhas em 3 arquivos) foi decomposto em 13+ módulos ES.**

Arquivos criados:
- `src/config/constants.js` — Todas as constantes do jogo (canvas, gravidade, velocidades, combate, dash)
- `src/core/AssetLoader.js` — Preload de imagens com progresso e error handling
- `src/core/GameLoop.js` — requestAnimationFrame com deltaTime (cap 1/30s)
- `src/core/Game.js` — Orquestrador principal
- `src/entities/Sprite.js` — Classe base com animação deltaTime-based
- `src/entities/Fighter.js` — Lutador com state machine de animação
- `src/systems/InputHandler.js` — Mapeamento de teclas para ações
- `src/systems/PhysicsEngine.js` — Criado mas não usado (gravidade interna no Fighter)
- `src/systems/CollisionSystem.js` — AABB com hitFrame range validation
- `src/ui/UIManager.js` — Health bars (GSAP), timer, resultado, loading screen

Arquivos modificados:
- `index.html` — type="module", loading screen div, typo corrigido
- `src/css/battle.css` — Estilos da loading screen
- `src/main.js` — Reduzido para 5 linhas (entry point)
- `.gitignore` — Adicionado `.history/`

Bugs corrigidos:
- Double drawing (Fighter.update chamava draw + Game.render chamava draw)
- gsap global sem import (fallback DOM adicionado)
- Gravidade duplicada (PhysicsEngine removido do Game)
- Offset duplicado no player original
- Hit detection frágil (frame exato → range de frames)
- Comparação de objetos Image (→ string currentState)

### Fase 2 - Melhorias de Gameplay ✅

**Mecânicas de combate avançadas adicionadas: bloqueio, ataque2, dash, combos, knockback.**

Arquivos criados:
- `src/config/characters/samuraiMack.js` — Config completa (stats, attacks, sprites)
- `src/config/characters/kenji.js` — Config completa (stats ligeiramente diferentes)
- `src/config/characters/index.js` — Registry com CHARACTER_ROSTER e getCharacterById()
- `src/systems/CombatSystem.js` — Processa hits com combos, bloqueio (25% chip), knockback

Arquivos modificados:
- `src/entities/Fighter.js` — block(), dash(), attack('attack2'), i-frames, attackCooldown, peso, visual de bloqueio (overlay azul), visual de i-frame (semi-transparente)
- `src/systems/InputHandler.js` — wasJustPressed(), consumeDash(), double-tap detection, update(deltaTime)
- `src/config/constants.js` — Novas constantes (BLOCK_DAMAGE_MULTIPLIER, COMBO_*, DASH_*, DOUBLE_TAP_WINDOW)
- `src/core/Game.js` — _handleFighterInput() unificado, CombatSystem integrado, character configs usados para criar fighters

Controles finais:
- **P1:** A/D=mover, W=pular, Space=ataque1, E=ataque2, S=bloquear, Double-tap A/D=dash
- **P2:** Setas=mover, ArrowUp=pular, ArrowDown=ataque1, NumpadEnter=ataque2, RShift=bloquear, Double-tap Setas=dash

### Fase 3 - Sistema de Áudio ✅

**Sons programáticos via Web Audio API (zero arquivos de áudio externos para SFX).**

Arquivos criados:
- `src/systems/SFXGenerator.js` — 7 sons: punch(), hit(), block(), whoosh(), victory(), menuSelect(), menuNavigate()
- `src/systems/AudioManager.js` — Gerencia AudioContext, música (HTMLAudioElement loop), SFX, volume, mute

Integração no Game.js:
- AudioContext inicializado no primeiro keypress (política de autoplay do browser)
- Música inicia automaticamente (./audio/Perimore.mp3)
- SFX disparados em: hit confirmado, bloqueio, dash (whoosh), vitória

### Fase 4 - UI e Menus ✅

**Sistema de cenas completo com menu principal, seleção de personagem, pause e pós-partida.**

Arquivos criados:
- `src/scenes/SceneManager.js` — register/switchTo/update/render, controla overlays DOM
- `src/scenes/MainMenuScene.js` — Logo, título, botões (Jogar/Config/Como Jogar), background animado
- `src/scenes/CharacterSelectScene.js` — 2 painéis P1/P2, grid de personagens, countdown, confirmação
- `src/scenes/BattleScene.js` — Lógica de batalha (migrada do Game.js), stats tracking, pause/restart
- `src/scenes/PauseOverlay.js` — ESC pausa/despausa, Continuar/Reiniciar/Menu Principal
- `src/scenes/PostMatchScene.js` — Resultado, stats (dano/hits/combo/bloqueios), Revanche/Seleção/Menu
- `src/css/menu.css` — Dark gaming aesthetic com glow effects, gradientes, animações

Arquivos modificados:
- `index.html` — Divs overlay para todas as cenas + modais (Settings, How to Play)
- `src/core/Game.js` — Refatorado para usar SceneManager (de 311 para 103 linhas)
- `src/ui/UIManager.js` — showHUD()/hideHUD() para controle de visibilidade
- `src/systems/AudioManager.js` — Getters musicVolume/sfxVolume para Settings

Fluxo de navegação:
- MainMenu → CharacterSelect → Battle ↔ PauseOverlay → PostMatch → Menu/Seleção/Revanche
- MainMenu → Settings (modal) / Como Jogar (modal)

Controles de UI:
- Todas as telas navegáveis por teclado (W/S ou Setas) e mouse
- ESC para voltar/pausar em todas as telas

### Fase 5 - Novos Personagens ✅

**5 novos personagens adicionados ao roster, totalizando 7 lutadores jogáveis.**

Arquivos criados:
- `src/config/characters/evilWizard.js` — Evil Wizard (HP:90, Speed:4.5, mago ofensivo)
- `src/config/characters/fantasyWarrior.js` — Fantasy Warrior (HP:110, Speed:4.8, tanque equilibrado)
- `src/config/characters/huntress.js` — Huntress (HP:85, Speed:6, ágil com alto jump)
- `src/config/characters/martialHero.js` — Martial Hero (HP:100, Speed:5.2, all-rounder)
- `src/config/characters/medievalKing.js` — Medieval King (HP:120, Speed:4.2, tanque pesado)

Arquivos modificados:
- `src/config/characters/index.js` — CHARACTER_ROSTER atualizado com 7 personagens

Detalhes técnicos:
- Sprites referenciados diretamente de `Characters/` (sem duplicação)
- Martial Hero usa `Sprite/` (não `Sprites/`) e `Going Up/Down` para Jump/Fall
- Frame counts verificados visualmente para cada sprite PNG
- Stats balanceados para diversidade de estilos de jogo

---

## Estrutura de Arquivos Atual

```
luta/
├── src/
│   ├── main.js                              ✅ Entry point (5 linhas)
│   ├── classes.js                           ⚠️ Backup original (não usado)
│   ├── utils.js                             ⚠️ Backup original (não usado)
│   ├── config/
│   │   ├── constants.js                     ✅ Todas as constantes
│   │   └── characters/
│   │       ├── index.js                     ✅ Registry (7 personagens)
│   │       ├── samuraiMack.js               ✅ Config Samurai Mack
│   │       ├── kenji.js                     ✅ Config Kenji
│   │       ├── evilWizard.js                ✅ Config Evil Wizard
│   │       ├── fantasyWarrior.js            ✅ Config Fantasy Warrior
│   │       ├── huntress.js                  ✅ Config Huntress
│   │       ├── martialHero.js               ✅ Config Martial Hero
│   │       └── medievalKing.js              ✅ Config Medieval King
│   ├── core/
│   │   ├── Game.js                          ✅ Orquestrador principal
│   │   ├── GameLoop.js                      ✅ RAF + deltaTime
│   │   └── AssetLoader.js                   ✅ Preload de imagens
│   ├── entities/
│   │   ├── Sprite.js                        ✅ Classe base
│   │   └── Fighter.js                       ✅ Lutador completo
│   ├── systems/
│   │   ├── InputHandler.js                  ✅ Input com dash detection
│   │   ├── PhysicsEngine.js                 ⚠️ Criado mas não usado
│   │   ├── CollisionSystem.js               ✅ AABB + hitFrame
│   │   ├── CombatSystem.js                  ✅ Dano, combos, bloqueio
│   │   ├── AudioManager.js                  ✅ Gerenciador de áudio
│   │   └── SFXGenerator.js                  ✅ Sons programáticos
│   ├── scenes/
│   │   ├── SceneManager.js                  ✅ Orquestrador de cenas
│   │   ├── MainMenuScene.js                 ✅ Menu principal
│   │   ├── CharacterSelectScene.js          ✅ Seleção de personagem
│   │   ├── BattleScene.js                   ✅ Lógica de batalha
│   │   ├── PauseOverlay.js                  ✅ Overlay de pausa
│   │   └── PostMatchScene.js                ✅ Tela pós-partida
│   ├── ui/
│   │   └── UIManager.js                     ✅ Health bars, timer, resultado
│   └── css/
│       ├── battle.css                       ✅ Estilos de batalha + loading
│       └── menu.css                         ✅ Estilos de menus + overlays
├── index.html                               ✅ ES Modules + loading screen
├── ANALISE.md                               ✅ Análise original do projeto
├── .gitignore                               ✅ Atualizado
├── images/                                  (inalterado - sprites originais)
├── Characters/                              (inalterado - sprites dos 5 novos personagens)
└── audio/Perimore.mp3                       (música existente)
```

---

### Fase 6 - Efeitos Visuais ✅

**4 sistemas de efeitos visuais implementados e integrados na batalha.**

Arquivos criados:
- `src/effects/ScreenShake.js` — Tremor de tela sinusoidal com decaimento (intensidade variável por tipo de hit)
- `src/effects/ParticleSystem.js` — Pool de 150 partículas, 4 presets: hit (sparks), block (azul), dust (corrida), dash (trail)
- `src/effects/DamageNumbers.js` — Números flutuantes com 3 estilos: normal (vermelho), combo (dourado), blocked (azul)
- `src/effects/ComboDisplay.js` — "X HIT COMBO!" com escala pulsante e glow, cores escalonam por contagem

Integração no BattleScene.js:
- Hit → screenShake(5, 0.2s) + 10 partículas hit + damage number + combo display
- Combo Hit (3+) → screenShake(8, 0.3s) + 15 partículas + damage number dourado
- Block → screenShake(2, 0.1s) + 8 partículas block + damage number azul
- Dash → 6 partículas dash na direção oposta
- Corrida → partículas dust (40% chance a cada 80ms no chão)

### Fase 7 - Modos de Jogo ✅

**3 modos de jogo, IA com 3 dificuldades, sistema de rounds (best of 3).**

Arquivos criados:
- `src/ai/AIController.js` — IA com state machine (idle/approach/attack/retreat/block), 3 dificuldades (easy/medium/hard)

Arquivos modificados:
- `src/scenes/MainMenuScene.js` — 3 botões de modo: VERSUS (2P), ARCADE (vs CPU), TREINO
- `src/scenes/CharacterSelectScene.js` — Auto-seleção de inimigo para arcade/treino, seletor de dificuldade
- `src/scenes/BattleScene.js` — Sistema de rounds (best of 3), modo treino (hitboxes visíveis, vida regenera), integração IA
- `index.html` — Botões de modo, indicadores de round (dots), seletor de dificuldade, cs-mode-label
- `src/css/menu.css` — Estilos para round dots, difficulty selector, mode label

Modos:
- **Versus:** 2 jogadores locais (controles P1 + P2)
- **Arcade:** P1 vs IA com seleção de dificuldade (Fácil/Médio/Difícil)
- **Treino:** Dummy parado, vida regenera, hitboxes visíveis (verde=corpo, vermelho=ataque)

### Fase 8 - Polish Final ✅

**Canvas responsivo implementado.**

Arquivos modificados:
- `src/core/Game.js` — Canvas responsivo via CSS `transform: scale()` com listener de resize
- `PROGRESSO.md` — Atualizado com Fases 6-8

---

## Estrutura de Arquivos Atual

```
luta/
├── src/
│   ├── main.js                              ✅ Entry point (5 linhas)
│   ├── classes.js                           ⚠️ Backup original (não usado)
│   ├── utils.js                             ⚠️ Backup original (não usado)
│   ├── config/
│   │   ├── constants.js                     ✅ Todas as constantes
│   │   └── characters/
│   │       ├── index.js                     ✅ Registry (7 personagens)
│   │       ├── samuraiMack.js               ✅ Config Samurai Mack
│   │       ├── kenji.js                     ✅ Config Kenji
│   │       ├── evilWizard.js                ✅ Config Evil Wizard
│   │       ├── fantasyWarrior.js            ✅ Config Fantasy Warrior
│   │       ├── huntress.js                  ✅ Config Huntress
│   │       ├── martialHero.js               ✅ Config Martial Hero
│   │       └── medievalKing.js              ✅ Config Medieval King
│   ├── core/
│   │   ├── Game.js                          ✅ Orquestrador + responsive canvas
│   │   ├── GameLoop.js                      ✅ RAF + deltaTime
│   │   └── AssetLoader.js                   ✅ Preload de imagens
│   ├── entities/
│   │   ├── Sprite.js                        ✅ Classe base
│   │   └── Fighter.js                       ✅ Lutador completo
│   ├── systems/
│   │   ├── InputHandler.js                  ✅ Input com dash detection
│   │   ├── PhysicsEngine.js                 ⚠️ Criado mas não usado
│   │   ├── CollisionSystem.js               ✅ AABB + hitFrame
│   │   ├── CombatSystem.js                  ✅ Dano, combos, bloqueio
│   │   ├── AudioManager.js                  ✅ Gerenciador de áudio
│   │   └── SFXGenerator.js                  ✅ Sons programáticos
│   ├── effects/
│   │   ├── ScreenShake.js                   ✅ Tremor de tela
│   │   ├── ParticleSystem.js                ✅ Sistema de partículas (pool)
│   │   ├── DamageNumbers.js                 ✅ Números de dano flutuantes
│   │   └── ComboDisplay.js                  ✅ Display de combo
│   ├── ai/
│   │   └── AIController.js                  ✅ IA com 3 dificuldades
│   ├── scenes/
│   │   ├── SceneManager.js                  ✅ Orquestrador de cenas
│   │   ├── MainMenuScene.js                 ✅ Menu com 3 modos de jogo
│   │   ├── CharacterSelectScene.js          ✅ Seleção + dificuldade IA
│   │   ├── BattleScene.js                   ✅ Batalha + rounds + efeitos
│   │   ├── PauseOverlay.js                  ✅ Overlay de pausa
│   │   └── PostMatchScene.js                ✅ Tela pós-partida
│   ├── ui/
│   │   └── UIManager.js                     ✅ Health bars, timer, resultado
│   └── css/
│       ├── battle.css                       ✅ Estilos de batalha + loading
│       └── menu.css                         ✅ Estilos de menus + rounds + dificuldade
├── index.html                               ✅ ES Modules + round indicators
├── ANALISE.md                               ✅ Análise original do projeto
├── .gitignore                               ✅ Atualizado
├── images/                                  (inalterado - sprites originais)
├── Characters/                              (inalterado - sprites dos 5 novos personagens)
└── audio/Perimore.mp3                       (música existente)
```

---

## Decisões do Usuário (referência)

- **Controles:** P1 S=bloquear, E=ataque2 / P2 RShift=bloquear, NumpadEnter=ataque2
- **SFX:** Sons programáticos via Web Audio API (sem arquivos externos)
- **UI/Menus:** HTML/CSS overlays sobre o canvas
- **Personagens:** Todos os 7 compatíveis desde o início

## Dependências entre Fases

```
Fase 1 ✅ → Fase 2 ✅ → Fase 4 ✅ → Fase 5 ✅ → Fase 7 ✅ → Fase 8 ✅
              Fase 3 ✅ ↗          ↘ Fase 6 ✅ ↗
```

## Como rodar o projeto

O jogo usa ES Modules, então precisa de um servidor HTTP local:
```bash
# Opção 1 (Node.js)
npx serve .

# Opção 2 (Python)
python -m http.server 8080
```
Depois abrir `http://localhost:8080` (ou porta indicada) no navegador.

## Projeto Completo 🎉

Todas as 8 fases foram implementadas com sucesso. O jogo conta com:
- 7 personagens jogáveis com stats balanceados
- Sistema de combate completo (ataques, bloqueio, dash, combos, knockback)
- Efeitos visuais (screen shake, partículas, damage numbers, combo display)
- 3 modos de jogo (Versus, Arcade com IA, Treino)
- Sistema de rounds (best of 3) com indicadores no HUD
- Áudio programático (SFX) + música de fundo
- Canvas responsivo
- Menus completos com navegação por teclado e mouse

