# UPDATE - LUTA Fighting Game

> **Data:** 20/02/2026
> **Base de análise:** Revisão completa dos 30+ arquivos de código, `ANALISE.md` e `PROGRESSO.md`

---

## 1. Status do Projeto — O que está de fato completo?

### ✅ Módulos verificados e estruturalmente corretos

| Módulo | Arquivo | LOC | Status |
|--------|---------|-----|--------|
| Entry Point | `src/main.js` | 6 | ✅ Funcional |
| Orquestrador | `src/core/Game.js` | 136 | ✅ Completo |
| Game Loop | `src/core/GameLoop.js` | ~40 | ✅ deltaTime correto |
| Asset Loader | `src/core/AssetLoader.js` | ~60 | ✅ Preload com progresso |
| Sprite Base | `src/entities/Sprite.js` | ~50 | ✅ Animação funcional |
| Fighter | `src/entities/Fighter.js` | 321 | ✅ State machine completa |
| Input Handler | `src/systems/InputHandler.js` | ~120 | ✅ Dash detection ok |
| Collision | `src/systems/CollisionSystem.js` | ~50 | ✅ AABB + hitFrame |
| Combat System | `src/systems/CombatSystem.js` | 83 | ✅ Combos, block, knockback |
| Audio Manager | `src/systems/AudioManager.js` | 98 | ✅ Web Audio API |
| SFX Generator | `src/systems/SFXGenerator.js` | ~100 | ✅ 7 sons programáticos |
| Scene Manager | `src/scenes/SceneManager.js` | 42 | ✅ Padrão enter/exit limpo |
| Main Menu | `src/scenes/MainMenuScene.js` | 194 | ✅ 3 modos + modais |
| Char Select | `src/scenes/CharacterSelectScene.js` | 306 | ✅ 2 painéis, IA, dificuldade |
| Battle Scene | `src/scenes/BattleScene.js` | 673 | ✅ Lógica completa |
| Pause Overlay | `src/scenes/PauseOverlay.js` | ~60 | ✅ Funcional |
| Post Match | `src/scenes/PostMatchScene.js` | 121 | ✅ Stats + navegação |
| Screen Shake | `src/effects/ScreenShake.js` | 61 | ✅ Sinusoidal c/ decay |
| Particles | `src/effects/ParticleSystem.js` | 159 | ✅ Pool de 150, 4 presets |
| Damage Numbers | `src/effects/DamageNumbers.js` | 119 | ✅ Pool de 20, 3 estilos |
| Combo Display | `src/effects/ComboDisplay.js` | 84 | ✅ Pulsante com glow |
| AI Controller | `src/ai/AIController.js` | 242 | ✅ State machine, 3 dificuldades |
| Constants | `src/config/constants.js` | 35 | ✅ Centralizado |
| Character Index | `src/config/characters/index.js` | 22 | ✅ 7 personagens registrados |
| HTML | `index.html` | 192 | ✅ Todos os overlays |
| CSS (battle) | `src/css/battle.css` | ~98 | ✅ HUD + loading |
| CSS (menu) | `src/css/menu.css` | ~200+ | ✅ Dark gaming aesthetic |

**Contagem total:** ~3.100+ linhas de código em 30+ módulos ES.

### ✅ Os 7 character configs existem:

| Personagem | HP | Speed | Peso | Estilo |
|------------|-----|-------|------|--------|
| Samurai Mack | 100 | 5.0 | 1.0 | All-rounder |
| Kenji | 100 | 5.2 | 0.95 | Ágil |
| Evil Wizard | 90 | 4.5 | 0.8 | Mago ofensivo |
| Fantasy Warrior | 110 | 4.8 | 1.1 | Tanque equilibrado |
| Huntress | 85 | 6.0 | 0.75 | Ágil, alto jump |
| Martial Hero | 100 | 5.2 | 1.0 | All-rounder |
| Medieval King | 120 | 4.2 | 1.3 | Tanque pesado |

---

### ⚠️ Pontos de atenção — Riscos para "rodar sem bugs"

| # | Problema Potencial | Arquivo | Severidade |
|---|-------------------|---------|------------|
| 1 | **Gravidade não usa deltaTime** — `GRAVITY = 0.7` é somada diretamente ao velocity por frame. Em FPS variável, a física pode se comportar diferente. O `GameLoop` limita deltaTime mas a gravidade ainda é frame-dependent no `Fighter.update()` | `Fighter.js:171` | 🟡 Média |
| 2 | **AI timer usa hardcoded `1/60`** — O `AIController.decide()` usa `this.stateTimer += 1 / 60` ao invés de `deltaTime`, tornando a IA mais rápida/lenta conforme o FPS | `AIController.js:97` | 🟡 Média |
| 3 | **`PhysicsEngine.js` existe mas não é usado** — Código morto no projeto | `src/systems/` | 🟢 Baixa |
| 4 | **`classes.js` e `utils.js` originais** — Backups não removidos, podem confundir | `src/` | 🟢 Baixa |
| 5 | **Overlay `rgba(255,255,255,0.1)` renderizado todo frame** — Render desnecessário no BattleScene | `BattleScene.js:619-620` | 🟢 Baixa |
| 6 | **`PostMatchScene._confirm` não passa `gameMode` e `aiController`** no rematch — A revanche no modo Arcade vai iniciar sem IA | `PostMatchScene.js:99-102` | 🔴 Alta |
| 7 | **`_isFacingAttacker` sempre retorna `true`** — Bloqueio funciona em qualquer direção, tornando-o potencialmente OP | `CombatSystem.js:48-50` | 🟡 Média |
| 8 | **Pasta `.history/` ainda existe** — 143+ arquivos desnecessários no repositório (mesmo com `.gitignore`) | Raiz | 🟢 Baixa |

> **Veredicto geral:** O projeto **está pronto para rodar** com ressalvas menores. O bug #6 (rematch sem IA no arcade) é o mais impactante.

---

## 2. Pontuações de Melhoria

### 🏎️ Otimização (Performance)

| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| O1 | **Converter gravidade para deltaTime** — `velocity.y += GRAVITY * deltaTime * 60` (ou redesenhar constantes para m/s²). Atualmente, se o FPS cair, a física desacelera. | Alto | Médio |
| O2 | **Background cacheado em off-screen canvas** — O fundo estático é redesenhado a cada frame. Renderizar uma vez num canvas separado e usar `drawImage` do cache elimina ~2 draw calls por frame. | Baixo | Fácil |
| O3 | **Remover overlay branco desnecessário** — `ctx.fillRect` com `rgba(255,255,255,0.1)` aplicado todo frame no battle sem propósito visual real. | Baixo | Trivial |
| O4 | **Sprite atlas** — Cada personagem carrega 7-8 PNGs separados. Um sprite atlas único por personagem reduziria as requests HTTP e melhoraria cache de textura. | Médio | Alto |
| O5 | **Object pooling no CollisionSystem** — Atualmente cria objetos temporários para verificação AABB. Reusar objetos reduz pressão no GC. | Baixo | Fácil |
| O6 | **Lazy-load personagens** — Carregar sprites de todos os 7 personagens no boot é pesado. Carregar apenas os 2 selecionados reduziria tempo de loading de ~6s para ~2s. | Alto | Médio |

---

### 🏗️ Sistema / Arquitetura

| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| S1 | **Integrar ou remover `PhysicsEngine.js`** — Código morto. A física de gravidade, colisão de chão e boundary está espalhada em `Fighter.js`. Centralizar num engine real melhoraria manutenção. | Médio | Médio |
| S2 | **Sistema de eventos (EventBus/Emitter)** — Atualmente `BattleScene` faz tudo: input → combat → audio → particles → UI. Um EventBus desacoplaria os subsistemas (ex: `emit('hit', {attacker, defender, damage})` → AudioManager, ParticleSystem e UIManager reagem independentemente). | Alto | Médio |
| S3 | **Bundler (Vite ou esbuild)** — O projeto usa ES Modules nativos, servidos via `npx serve`. Sem minificação, sem tree-shaking, sem HMR. Migrar para Vite traria: builds otimizados, HMR, resolução de imports mais robusta, e deploy simplificado. | Alto | Médio |
| S4 | **Estado do jogo serializado** — Não há serialização de estado (save/load). Implementar um `GameState` serializável permitiria replay system, save states, e facilita debug. | Baixo | Alto |
| S5 | **Interface de cena formal** — As cenas seguem uma convenção implícita (`enter`/`exit`/`update`/`render`) mas sem interface TypeScript ou classe base abstrata. Uma classe `Scene` base com métodos abstratos previne bugs silenciosos. | Médio | Fácil |
| S6 | **TypeScript** — Todo o código está em JS puro. Migrar para TS (mesmo gradualmente com JSDoc `@ts-check`) traria type safety para configs de personagens, attack data e scene interfaces. | Alto | Alto |
| S7 | **Testes automatizados** — Zero testes. Testes unitários para `CombatSystem`, `CollisionSystem`, `AIController` e configs de personagens garantiriam balanceamento e preveniriam regressões. | Alto | Médio |
| S8 | **Remover backups (`classes.js`, `utils.js`)** — Código original não serve mais. Polui o projeto. | Baixo | Trivial |

---

### 🎮 Gameplay

| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| G1 | **Bloqueio direcional real** — `_isFacingAttacker` retorna `true` sempre. Bloquear deveria exigir estar virado para o atacante (como em jogos de luta reais). Impede "block spam" andando pra trás. | Alto | Fácil |
| G2 | **Super meter / Barra de especial** — Enche com hits dados/recebidos. Ao máximo, libera ataque especial. Adicionaria profundidade estratégica crucial para fighting games. | Alto | Alto |
| G3 | **Agachamento** — Tecla para abaixar o hurtbox, esquivando de ataques altos. Fundamental em fighting games. | Médio | Médio |
| G4 | **Hitbox/hurtbox reais por frame** — Atualmente usa `FIGHTER_WIDTH×FIGHTER_HEIGHT` como colisão, não o sprite real. Personagens podem "acertar" no vazio visual. Frame-data precisa tornaria combate mais justo. | Alto | Alto |
| G5 | **Grab/throw** — Técnica de agarrão que ignora bloqueio. Counter ao block spam. Mecânica básica de fighting games. | Médio | Médio |
| G6 | **Hitstun e recovery frames** — Ao ser atingido, o personagem deveria entrar em hitstun proporcional ao ataque antes de poder agir. Atualmente, takeHit só toca animação. | Alto | Médio |
| G7 | **Dano variável por distância/timing** — Ataques acertados no frame ideal (just-frame) ou na distância ótima (sweet spot) causam mais dano. Recompensa habilidade. | Médio | Médio |
| G8 | **Animações de intro/victory** — Cenas cinemáticas rápidas (1-2s) antes e depois da luta adicionam personalidade aos personagens. | Baixo | Médio |
| G9 | **Gamepad support** — A Web Gamepad API permitiria jogar com controles, experiência muito superior para fighting games. | Alto | Médio |
| G10 | **Treino aprimorado** — O modo treino mostra hitboxes mas falta: input display (mostra as teclas em tempo real), frame data overlay (startup/active/recovery), e opção de dummy (block/jump/attack). | Médio | Médio |
| G11 | **IA não recebe deltaTime** — A IA atualiza state timers com `1/60` hardcoded. Passar `deltaTime` corrigiria comportamento em FPS variável. | Médio | Trivial |

---

## 3. Resumo de Prioridades Recomendadas

### 🔴 Correções imediatas (bugs)
1. **Bug do rematch no Arcade** — `PostMatchScene._confirm` não repassa `gameMode` e `aiController` → revanche sem IA
2. **AI deltaTime** — `stateTimer += 1/60` → `stateTimer += deltaTime`
3. **Gravidade deltaTime** — Padronizar física para ser frame-independent

### 🟡 Melhorias de curto prazo (1-2 dias)
4. Bloqueio direcional real
5. Remover arquivos mortos (`PhysicsEngine.js`, `classes.js`, `utils.js`)
6. Hitstun/recovery frames
7. Cache do background

### 🟢 Melhorias de médio prazo (1 semana)
8. EventBus/Emitter para desacoplar subsistemas
9. Gamepad support
10. Super meter
11. Migrar para Vite
12. Treino aprimorado

### 🔵 Melhorias de longo prazo (futuro)
13. TypeScript
14. Testes automatizados
15. Hitbox/hurtbox por frame
16. Sprite atlas
17. Replay system

---

## 4. Score Atualizado

| Categoria | ANALISE.md (antes) | Agora | Evolução |
|-----------|-------------------|-------|----------|
| Funcionalidade | 7/10 | **9/10** | +2 (quase todas features implementadas) |
| Qualidade do código | 5/10 | **7.5/10** | +2.5 (modular, organizado, mas sem testes/TS) |
| Performance | 6/10 | **7/10** | +1 (deltaTime, preload, mas gravidade frame-dep) |
| Balanceamento | 4/10 | **6.5/10** | +2.5 (stats diversificados, mas hitbox genérica) |
| Features | 3/10 | **8/10** | +5 (3 modos, 7 chars, efeitos, combos, IA) |
| Polish/UX | 2/10 | **7/10** | +5 (menus, pause, post-match, responsivo) |
| Aproveitamento de assets | 2/10 | **7/10** | +5 (5 novos personagens, áudio integrado) |
| **GERAL** | **4.5/10** | **7.5/10** | **+3.0** |

**Status:** O projeto evoluiu de protótipo funcional (~30%) para **jogo jogável completo (~75%)**. As 8 fases estão implementadas e o jogo é funcional. Para alcançar 9+/10, faltam: testes, balanceamento fino com hitboxes reais, gamepad, e super meter.
