# LUTA - Análise Completa do Projeto

## O que é o projeto?

Um jogo de luta 2D local (dois jogadores no mesmo teclado) feito com **HTML5 Canvas** e **JavaScript puro**. Dois personagens samurais (Samurai Mack vs Kenji) lutam em uma arena com limite de 90 segundos. Quem tiver mais vida no final ganha.

**Stack tecnológica:** Canvas API, ES6 Classes, GSAP (animação das barras de vida), Google Fonts.

---

## Estrutura Atual

```
luta/
├── src/
│   ├── main.js          (337 linhas - loop do jogo, inputs, inicialização)
│   ├── classes.js        (201 linhas - classes Sprite e Fighter)
│   ├── utils.js          (20 linhas - colisão e winner)
│   └── css/
│       └── battle.css    (98 linhas - estilização)
├── images/
│   ├── samuraiMack/      (9 sprites - Player 1)
│   ├── kenji/            (8 sprites - Player 2)
│   ├── background.png
│   ├── shop.png
│   └── Logo.jpg
├── Characters/           (9 personagens extras - NÃO utilizados)
├── audio/
│   └── Perimore.mp3      (música - NÃO carregada no jogo)
├── index.html            (42 linhas)
└── readme.md             (5 linhas - apenas créditos)
```

---

## O que funciona

- [x] Game loop com `requestAnimationFrame`
- [x] Sistema de sprites com animação por frames
- [x] 7 estados de animação por personagem (idle, run, jump, fall, attack, takeHit, death)
- [x] Colisão AABB (Axis-Aligned Bounding Box) para ataques
- [x] Sistema de vida (100 HP, -20 por hit)
- [x] Timer de 90 segundos
- [x] Gravidade e física de pulo
- [x] Controles para 2 jogadores (WASD + Espaço / Setas + Seta pra baixo)
- [x] Tela de vitória/empate
- [x] Barras de vida animadas com GSAP

---

## Problemas de Código

### Números mágicos espalhados por todo o código

| Valor | Local | Significado |
|-------|-------|-------------|
| `1024, 576` | main.js:2-3 | Dimensões do canvas |
| `0.7` | main.js:11 | Gravidade |
| `5` | main.js:153, 166 | Velocidade de movimento |
| `-20` | main.js:282, 296 | Velocidade do pulo |
| `20` | classes.js:125 | Dano por ataque |
| `5` | classes.js:8, 71 | Frame hold (velocidade da animação) |
| `90` | main.js:117 | Duração da partida |

### Código duplicado

- **Atualização das barras de vida** aparece duplicado em `main.js:145-147` e `main.js:159-161` (mesmo código GSAP para os dois jogadores)
- **Lógica de movimento** duplicada para Player 1 e Player 2 no game loop

### Variáveis globais

- `c` (contexto do canvas), `gravity`, `keys`, `player`, `enemy` todos no escopo global
- `classes.js` depende de `c` global sem import/export

### Detecção de hit frágil

```javascript
// main.js:143 - Player 1 acerta no frame EXATO 4 de 6
player.framesCurrent === 4

// main.js:157 - Player 2 acerta no frame EXATO 2 de 4
enemy.framesCurrent === 2
```

Se a velocidade de animação mudar, a colisão quebra.

### Propriedade `offset` duplicada

Em `main.js:45-51`, o objeto do player define `offset` duas vezes. A primeira é ignorada (JS sobrescreve).

### Comparação frágil de imagens

Em `classes.js:163-173`, usa `this.image === this.sprites.attack1.image` para checar estado de animação. Deveria usar um enum/string.

---

## Desbalanceamento dos Personagens

| Atributo | Samurai Mack (P1) | Kenji (P2) | Problema |
|----------|-------------------|------------|----------|
| Frame de hit | 4 de 6 (67%) | 2 de 4 (50%) | Kenji acerta mais cedo na animação |
| Largura do attack box | 140px | 170px | Kenji tem 30px a mais de alcance |
| Offset do attack box | x: 100 | x: -170 | Posicionamento inconsistente |
| Velocidade | 5px/frame | 5px/frame | Sem diferenciação |
| Pulo | -20 | -20 | Sem diferenciação |
| Dano | 20 | 20 | Sem diferenciação |

**Resultado:** Kenji tem vantagem significativa sobre Samurai Mack.

---

## Assets não utilizados (~85% do conteúdo)

### Personagens (pasta `Characters/`)
9 personagens prontos que nunca foram implementados:
- Arcane Archer
- Evil Wizard 2
- Fantasy Warrior
- Huntress / Huntress 2
- Imp Axe Demon
- Martial Hero 3
- Medieval King Pack 2
- Skeleton Enemy

### Sprites existentes não usados
- `Attack2.png` de ambos personagens (segundo ataque)
- `Take hit white silhouette` (variante de hit)

### Áudio
- `Perimore.mp3` existe mas **nunca é carregado** no jogo

---

## O que falta (Features)

### Prioridade ALTA - Essenciais

- [ ] **Menu principal** (Start, Seleção de personagem, Configurações)
- [ ] **Tela de seleção de personagens** (usar os assets da pasta Characters/)
- [ ] **Sistema de áudio** (música de fundo + efeitos sonoros)
- [ ] **Botão de pausa** (ESC)
- [ ] **Botão de restart** (atualmente precisa recarregar a página)
- [ ] **Segundo ataque** (sprites de Attack2 já existem)
- [ ] **Sistema de bloqueio/defesa**

### Prioridade MÉDIA - Gameplay

- [ ] **Knockback** ao ser atingido (pushback)
- [ ] **Dash/esquiva** (movimento rápido com cooldown)
- [ ] **Sistema de combos** (chain de ataques)
- [ ] **Barra de especial/rage** (super meter)
- [ ] **Dano variável** (baseado em distância, timing, tipo de ataque)
- [ ] **Mecânica de throw/grab** (agarrão em curta distância)
- [ ] **Agachamento**

### Prioridade BAIXA - Polish

- [ ] **Efeitos visuais** (screen shake, partículas, flash ao hit)
- [ ] **Indicador de dano flutuante** (números saindo do personagem)
- [ ] **Contador de combos**
- [ ] **Tela de estatísticas** pós-partida (dano dado, hits, precisão)
- [ ] **Animações cinemáticas** (intro, outro)
- [ ] **Responsividade** (adaptar para telas menores)
- [ ] **AI para modo single player**
- [ ] **Tutorial/How to Play**

---

## O que otimizar

### Performance

1. **Preload de imagens** - Criar um `ImageManager` que carrega tudo antes do jogo iniciar (atualmente carrega no construtor, podendo causar lag)
2. **Cache do background** - Renderizar fundo em canvas separado ao invés de redesenhar todo frame
3. **Remover overlay desnecessário** - `main.js:126` aplica `fillRect` com opacidade 0.1 a cada frame (desnecessário e custoso)
4. **Animação baseada em tempo** - Usar `deltaTime` ao invés de contar frames (atualmente a velocidade do jogo depende do FPS)

### Arquitetura

1. **Modularizar o código** com ES Modules (`import/export`)
2. **Extrair constantes** para um arquivo `config.js`
3. **Separar responsabilidades:**
   - `GameState` - gerenciar estado do jogo
   - `InputHandler` - gerenciar teclado
   - `PhysicsEngine` - gravidade, velocidade, colisões
   - `AudioManager` - sons e música
   - `UIManager` - HUD, menus, overlays
4. **Usar enums** para estados de animação ao invés de comparar objetos Image
5. **Sistema de eventos** ao invés de polling para detecção de hit

### Qualidade

1. **Remover pasta `.history/`** (143 arquivos desnecessários, adicionar ao `.gitignore`)
2. **Adicionar tratamento de erros** (falha ao carregar imagens, contexto canvas)
3. **Padronizar nomes** (algumas propriedades inconsistentes como `imageSrc` vs `image`)
4. **Criar `.gitignore`** adequado

---

## Avaliação Geral

| Categoria | Nota | Observação |
|-----------|------|------------|
| Funcionalidade | 7/10 | Core funciona corretamente |
| Qualidade do código | 5/10 | Precisa refatorar |
| Performance | 6/10 | Adequada para 2 jogadores |
| Balanceamento | 4/10 | Personagens desbalanceados |
| Features | 3/10 | Mínimas, muitas ausentes |
| Polish/UX | 2/10 | Muito cru |
| Aproveitamento de assets | 2/10 | ~85% não utilizado |
| **GERAL** | **4.5/10** | **Protótipo funcional** |

**Status:** O projeto é um protótipo funcional (~30% completo). O game loop, renderização, inputs e física funcionam. Precisa de trabalho significativo em: balanceamento, features, refatoração, áudio e UI.

---

## Ordem sugerida de trabalho

1. **Refatorar a base** - Modularizar, extrair constantes, corrigir bugs
2. **Balancear personagens** - Normalizar attack boxes, frames de hit, stats
3. **Adicionar áudio** - Carregar música existente + efeitos
4. **Sistema de bloqueio** - Mecânica fundamental de fighting game
5. **Menu principal + Seleção de personagem** - UI básica
6. **Segundo ataque** - Usar sprites que já existem
7. **Implementar novos personagens** - Usar assets da pasta Characters/
8. **Efeitos visuais** - Screen shake, partículas, flash
9. **Modos de jogo** - AI single player, restart
10. **Polish final** - Responsividade, tutorial, estatísticas
