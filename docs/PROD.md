# PROD.md: non_steam_adder

## 1. Visão Geral

Aplicação desktop desenvolvida para adicionar executáveis de jogos avulsos (DRM-free) à biblioteca da Steam. A ferramenta automatiza a criação do atalho e a aplicação das artes oficiais (Cover, Background, Logo e Wide Cover) consumindo a API do SteamGridDB.

## 2. Stack Tecnológico

- **Framework:** Tauri
- **Frontend:** SolidJS (TypeScript)
- **Backend:** Rust
- **Integração API:** Chave do SteamGridDB embutida no binário no momento do build (via macro `env!()` no Rust).

## 3. Fluxo de Usuário e Funcionalidades

### 3.1. Tela Inicial (Importação)

- **Interface:** Uma área de Dropzone centralizada.
- **Ações:**
  - Arrastar e soltar um arquivo `.exe` para dentro da janela.
  - Clicar na Dropzone para abrir o seletor nativo de arquivos do SO e selecionar o `.exe`.
- **Processamento Automático:** O backend em Rust recebe o caminho do arquivo, extrai os metadados do binário (como `ProductName` ou `FileDescription`) para tentar determinar o nome do jogo automaticamente.

### 3.2. Tela de Gerenciamento (Sincronização de Artes)

- **Busca:** Input de texto contendo o nome do jogo (preenchido automaticamente pelos metadados ou inserido/corrigido pelo usuário) acompanhado de um botão "Buscar".
- **Visualização (Layout):** Quatro slots vazios ou preenchidos automaticamente com a primeira resposta da API, respeitando as proporções:
  - Cover (Capa vertical)
  - Wide Cover (Capa horizontal / Grid)
  - Background (Fundo)
  - Logo
- **Seleção Manual (Dialog):** Ao clicar em qualquer um dos slots, um modal é sobreposto. Este modal exibe uma galeria com todas as imagens retornadas pela API para aquela categoria específica do jogo. O clique em uma imagem do modal atualiza a escolha do slot e fecha o modal.
- **Ação Final:** Botão de confirmação ("Adicionar à Steam").

### 3.3. Processamento Final (Backend)

Ao confirmar, o sistema deve executar as seguintes rotinas em background:

1.  Ler o arquivo `shortcuts.vdf` do usuário atual na Steam.
2.  Injetar o novo jogo no arquivo VDF gerando o AppID correto para atalhos não-Steam.
3.  Fazer o download das quatro imagens selecionadas.
4.  Salvar as imagens na pasta `userdata/<steam_id>/config/grid`, nomeando-as no padrão exigido pela Steam usando o AppID gerado (ex: `<appid>p.png`, `<appid>_hero.png`, `<appid>_logo.png`).
5.  Exibir alerta de sucesso e retornar à Tela 1.

## 4. UI / UX

- **Design System:** Minimalista, inspirado no cliente nativo da Steam.
- **Paleta Base:**
  - Background Primário: `#1b2838`
  - Elementos e Paineis: `#171a21`
  - Highlights/Botões: `#66c0f4` e gradações de azul Steam.
- **Comportamento:** Transições instantâneas (SolidJS) sem carregamentos desnecessários. Feedback visual claro durante o drag and drop e durante requisições de rede.

## 5. Segurança e Distribuição

- **API Key:** A chave do SteamGridDB ficará oculta no código-fonte através do uso de variáveis de ambiente (`.env`) durante o processo de compilação do Tauri, resultando em um binário final que não expõe o token de forma legível e não requer configuração por parte do usuário final.
