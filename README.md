# Muninn Observing

Muninn Observing é um protótipo de tecnologia cidadã para organizar informações públicas sobre alagamentos, interdições, deslizamentos, incêndios e outros riscos em vias e espaços públicos de Diadema, São Paulo.

## Objetivo da solução

O projeto permite consultar e cadastrar resumos de ocorrências a partir de fontes públicas. A proposta busca reunir informações locais que ajudem moradores e pessoas que circulam pela cidade a observar riscos, sem substituir canais oficiais, serviços de emergência ou decisões de deslocamento.

## Problema e cidadão

**Cidadão afetado:** moradores de Diadema e pessoas que dependem das vias públicas e do transporte para circular pela cidade e pela região.

**Problema:** alagamentos e outros riscos podem dificultar deslocamentos e tornar a circulação menos segura.

**Evidência:** uma reportagem do Diário do Grande ABC sobre um temporal em 16 de outubro de 2026 descreveu alagamentos em vias de Diadema e impactos no transporte regional.

- [Reportagem do Diário do Grande ABC](https://www.dgabc.com.br/Noticia/4353062/temporal-alaga-vias-em-diadema-e-sao-bernardo-e-afeta-transporte-no-grande-abc)

**ODS:** a solução se relaciona à **ODS 11 - Cidades e Comunidades Sustentáveis**, por explorar comunicação local e preparação comunitária diante de riscos urbanos.

## Tecnologias utilizadas

- HTML5 semântico
- CSS3
- Flexbox e CSS Grid
- JavaScript
- Bootstrap 5.3.3
- sessionStorage
- Git e GitHub

## Funcionalidades

- Cadastro de uma informação pública com tipo, bairro, ponto de referência, data e hora, resumo e fonte.
- Validação nativa do HTML5 e validação adicional em JavaScript.
- Adição, listagem, edição e remoção de relatos pelo DOM.
- Consulta e filtros por bairro e tipo.
- Painel de atividades com data, hora, ação e resultado.
- Tema claro e escuro.
- Controles de tamanho do texto.
- Navegação entre páginas e recursos básicos de acessibilidade.

## Como executar o projeto

1. Abra o Visual Studio Code.
2. Abra a pasta do projeto.
3. Instale a extensão Live Server, caso necessário.
4. Abra o arquivo `index.html`.
5. Use a opção **Go Live** ou **Open with Live Server**.

O projeto também pode ser aberto diretamente no navegador. É necessário acesso à internet para carregar o Bootstrap pela CDN.

## Estrutura de arquivos

```text
Muninn-Observing/
|-- index.html
|-- relatos.html
|-- sobre.html
|-- termos.html
|-- privacidade.html
|-- css/
|   `-- style.css
|-- js/
|   `-- app.js
|-- img/
|   |-- logo-augna.svg
|   `-- png/
|       `-- arquivos .png das capturas
`-- README.md
```

## Arquitetura das páginas

- `index.html`: apresentação da solução, resumo da sessão e links principais.
- `relatos.html`: formulário, filtros, mural de informações e histórico de atividades.
- `sobre.html`: problema, cidadão, evidência, ODS, limites e próximos passos.
- `termos.html`: regras de utilização do protótipo.
- `privacidade.html`: informações sobre coleta, uso e armazenamento dos dados.
- `css/style.css`: estilos, responsividade e tema escuro.
- `js/app.js`: validações, armazenamento, renderização e eventos.

## Modelo de dados

### Relato

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | texto | Identificador único |
| `tipo` | texto | Tipo da informação |
| `bairro` | texto | Bairro em Diadema |
| `local` | texto | Ponto de referência público |
| `observadoEm` | data e hora | Data informada pela fonte |
| `descricao` | texto | Resumo da informação pública |
| `fonteUrl` | texto | URL HTTP ou HTTPS da fonte |
| `criadoEm` | data e hora | Momento do cadastro |
| `atualizadoEm` | data e hora | Momento da edição |

### Atividade

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | texto | Identificador único |
| `quando` | data e hora | Momento da operação |
| `action` | texto | Tipo da ação |
| `result` | texto | Resultado da operação |

Os relatos e atividades são guardados no `sessionStorage` da aba atual. Os dados não são enviados a um servidor e podem ser removidos ao encerrar a sessão ou limpar os dados do navegador.

## Privacidade e segurança

- Nome, telefone, documento e endereço residencial não são solicitados.
- Os dados ficam somente na sessão atual do navegador.
- Campos vazios, espaços extras, limites de tamanho, formato da URL e datas futuras são validados.
- Informações carregadas do armazenamento são verificadas antes de serem exibidas.
- Elementos HTML são criados com `textContent` e DOM para evitar conteúdo não confiável.
- O usuário recebe mensagens simples em caso de erro, sem detalhes técnicos.

### Principais ameaças

1. **Inserção de HTML ou script:** mitigada pela criação de elementos DOM e pelo uso de `textContent`.
2. **Dados inválidos ou corrompidos:** mitigada pelas validações nativa e JavaScript e pela verificação dos dados recuperados.
3. **Exposição de dados pessoais:** mitigada pela coleta mínima e pelo armazenamento local, sem envio para servidor.

## Validação e testes

O projeto deve ser testado nas seguintes larguras:

- Celular: 360 px
- Tablet: 768 px
- Desktop: 1280 px

Casos sugeridos:

- Campos obrigatórios vazios.
- Texto contendo apenas espaços.
- Texto abaixo ou acima dos limites definidos.
- Link sem `http://` ou `https://`.
- Data ou horário posterior ao momento atual.
- Cadastro, edição e remoção de relatos.
- Filtros por bairro e por tipo.
- Alternância do tema claro e escuro.
- Ajustes de tamanho do texto.
- Navegação pelo teclado e link para pular ao conteúdo.

## Capturas de tela

As imagens das capturas devem ser colocadas em `img/png/`. Ao adicioná-las manualmente, use caminhos relativos no formato `img/png/nome-da-captura.png`.

## Sustentabilidade e evolução

Uma hipótese de negócio de impacto seria oferecer implantação e suporte do serviço para organizações comunitárias ou instituições públicas, mantendo a consulta gratuita para a população. A versão real exigiria backend, moderação, processo de correção, responsável pelo tratamento dos dados, canal de contato e validação com moradores.

## Limitações

- Não utiliza API ou base oficial de ocorrências.
- Não envia alertas.
- Não monitora emergências em tempo real.
- Não verifica automaticamente se uma fonte é pública ou verdadeira.
- Os dados são limitados à sessão do navegador.
- Não substitui órgãos públicos, defesa civil ou serviços de emergência.

## Git e GitHub

Antes da entrega, o repositório público deve conter pelo menos cinco commits realizados ao longo do desenvolvimento, com mensagens claras e relacionadas às alterações.

Sugestão de etapas:

1. Estrutura inicial das páginas.
2. Estilos responsivos e componentes.
3. Formulário e validações.
4. Operações de cadastro, consulta, edição e remoção.
5. Histórico de atividades e ajustes finais.

## Uso de IA e código de terceiros

A geração inicial da estrutura e da documentação contou com auxílio de ferramentas de IA. A implementação e os textos devem ser revisados e declarados no relatório acadêmico.

O Bootstrap 5.3.3 é carregado pela CDN jsDelivr e possui licença MIT. A logo local `img/logo-augna.svg` integra a identidade visual deste projeto.
