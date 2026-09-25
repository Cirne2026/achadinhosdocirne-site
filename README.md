# Achadinhos do Cirne

Site estático. Sem build, sem dependência de CDN, sem passo de compilação.

## Publicar no Netlify, mantendo o endereço atual

O endereço `achadinhosdocirne.netlify.app` pertence ao **site** no Netlify, não ao deploy. Qualquer
publicação nova dentro do mesmo site mantém o endereço. Trocar o conteúdo não mexe no domínio.

**NÃO use [netlify.com/drop](https://app.netlify.com/drop) para esta atualização.** O Drop cria um
site novo, com um subdomínio aleatório, e o endereço antigo continua servindo a versão velha. É o
erro que faz perder o endereço que está impresso nos banners.

**O caminho certo:**

1. Entre em [app.netlify.com](https://app.netlify.com) e abra o site `achadinhosdocirne`.
2. Vá na aba **Deploys**.
3. Confira antes, em **Site configuration → Build & deploy → Continuous deployment**:
   - Se disser algo como "not configured" ou oferecer deploy manual, siga para o passo 4.
   - Se estiver ligado a um repositório Git, o arrasto é ignorado ou sobrescrito no próximo push.
     Nesse caso o conteúdo desta pasta tem que ir para o repositório, não para o painel.
4. Na área de deploy manual, arraste o arquivo **`achadinhos-site.zip`** (que fica um nível acima
   desta pasta) ou a pasta `achadinhos-site` inteira.
5. Aguarde o deploy terminar e abra o endereço. Se algo estiver errado, o Netlify guarda todos os
   deploys anteriores: em **Deploys**, abra o anterior e use **Publish deploy** para voltar.

O `netlify.toml` já define `publish = "."`, os cabeçalhos de segurança e o cache longo para fontes
e imagens. Não é preciso configurar nada no painel.

### O zip

`achadinhos-site.zip` é esta pasta empacotada com `index.html` na raiz e barras normais nos
caminhos internos, que é o que o Netlify espera. Se for regerar o zip pelo Explorador do Windows,
selecione **o conteúdo** da pasta e não a pasta, senão tudo fica um nível abaixo e o site sobe em
branco.

### O que muda em relação ao site atual

O site atual é **um único `index.html`** servido na raiz. Nenhum outro caminho existe: `/robots.txt`,
`/sitemap.xml` e `/favicon` respondem 404 hoje. Não há URL antiga para preservar nem redirecionamento
a montar, porque só existe `/`.

O site atual também não tem `<title>`, `description`, nem tags Open Graph. Compartilhar o link hoje
não mostra título nem imagem. Esta versão traz tudo isso, mais favicon, robots e sitemap.

## O que tem dentro

```
index.html                  página única, todo o conteúdo
favicon.svg                 marca, lupa sobre disco verde
netlify.toml                publicação, cabeçalhos e cache
robots.txt / sitemap.xml    busca
assets/
  css/site.css              sistema de design, tokens, dois temas
  js/site.js                comportamento e movimento
  js/gsap.min.js            GSAP 3.12.5 (local, não vem de CDN)
  js/ScrollTrigger.min.js   GSAP ScrollTrigger 3.12.5 (local)
  fonts/*.woff2             Cabinet Grotesk e Satoshi, auto-hospedadas
  img/*                     fotografia e recortes de produto
  icons/*                   ícones Phosphor e o sprite montado
```

## Trocar a URL do site

Se o endereço final não for `achadinhosdocirne.netlify.app`, substitua em três lugares do
`index.html` (`canonical`, `og:url`, `og:image`) e no `sitemap.xml` e `robots.txt`.

## Links da loja

São de dois tipos.

**Os botões "Ver ofertas de hoje"** (barra, herói, fim da seção Loja, fecho) e o link do rodapé vão
para a raiz da loja: `https://www.magazinevoce.com.br/magazinesaquatem/`. Cinco ocorrências.

**Os cinco cartões de categoria do carrossel** vão cada um para o seu departamento:

| Bloco | Departamento |
|---|---|
| Eletrodomésticos | `/eletrodomesticos/l/ed/` |
| Eletrônicos | `/audio/l/ea/` |
| Celulares | `/celulares-e-smartphones/l/te/` |
| Móveis | `/moveis/l/mo/` |
| Utilidades domésticas | `/utilidades-domesticas/l/ud/` |

O padrão da URL é `magazinevoce.com.br/magazinesaquatem/<slug>/l/<codigo>/`. Os códigos vêm da
própria loja e não são inventados. Outros úteis, se quiser mudar algum destino:
`tv-e-video/l/et/`, `informatica/l/in/`, `eletroportateis/l/ep/`, `ar-e-ventilacao/l/ar/`,
`suplementos-alimentares/l/sa/`, `games/l/ga/`, `casa-e-construcao/l/cj/`.

**Atenção em "Eletrônicos":** a loja não tem um departamento com esse nome. O bloco aponta para
**Áudio**, que é o que combina com a foto dele (fone e caixa de som). Se preferir um destino mais
amplo, `tv-e-video/l/et/` ou `informatica/l/in/` são as trocas naturais.

## Cache: leia antes de mexer no netlify.toml

**Nenhum arquivo deste site tem impressão digital no nome.** O CSS é sempre
`site.css`, a foto é sempre `quem-sou-eu.jpg`. Quando o conteúdo muda, o nome
não muda. Cache longo só é seguro quando o nome muda junto com o conteúdo.

A versão anterior do `netlify.toml` errava nisso duas vezes: CSS e JS com sete
dias, e imagens com um ano e `immutable`. O resultado apareceu depois de uma
publicação: quem já tinha visitado o site continuava recebendo o CSS antigo. Os
ícones do rodapé sumiam, porque as regras deles não existiam no CSS velho, e a
arte circular de "Quem sou eu" ganhava um quadrado branco em volta, porque no
CSS velho o raio ainda era 14px em vez de 50%. Em janela anônima tudo aparecia
certo. O site estava certo; o navegador é que servia peça velha.

Hoje: HTML, CSS e JS revalidam sempre, imagens guardam uma hora, e só as fontes
continuam eternas, porque trocar de fonte significa trocar de arquivo.

O `?v=2` no `index.html`, no CSS, no JS e em duas imagens serve para furar o
cache que já está guardado nos navegadores de quem visitou antes da correção.
Trocar o cabeçalho não resgata essas cópias: só uma URL diferente obriga o
navegador a buscar de novo. Foi preciso uma vez; daqui para frente os
cabeçalhos dão conta e esse `?v=` pode sumir.

## Decisões que valem saber antes de editar

**Acento único.** O dourado `#E9B540` é o único acento da página e nunca é usado como cor de texto
sobre fundo claro, porque não passa contraste. Para texto dourado existe o token `--accent-ink`,
que troca de valor entre os temas.

**Raio de canto.** Superfícies e mídia usam 14px; tudo que é clicável usa pílula completa. A regra
está no topo do CSS e vale para a página toda.

**Dois temas.** Escuro é a expressão principal, claro é alternativa completa. Ambos saem dos mesmos
tokens e respeitam a preferência do sistema, com um alternador na barra que grava a escolha.
Herói, fecho e rodapé são as pontas escuras nos dois temas, de propósito.

**Movimento.** Nada usa listener de scroll. Tudo passa por GSAP ScrollTrigger ou
IntersectionObserver, e o conjunto colapsa para estático sob `prefers-reduced-motion`. O vidro da
barra fica fora do bloco de movimento de propósito: ele é legibilidade, não enfeite.

**Fundo opaco na pilha de painéis.** `.pilha__item` precisa de fundo opaco. Os painéis recuam
perdendo opacidade, e sem esse fundo a transparência revelaria o painel anterior por baixo,
sobrepondo dois textos.

**Carrossel da loja: a rolagem é do navegador.** A pista é uma grade de colunas automáticas com
`overflow-x: auto` e `scroll-snap`. Funciona no toque, no trackpad e no teclado sem nenhum script,
porque a própria pista recebe foco. As setas e o medidor são acréscimo do `site.js`, e o pé do
carrossel nasce escondido no CSS: só aparece quando o script confirma que existe transbordo. Assim
não sobra seta morta se o script não carregar.

**O nome da categoria fica fora da foto, embaixo dela.** Antes ele era uma pílula de vidro por cima
da imagem, e não funcionou: media 71% da largura e 26% da altura do cartão, então lia como um botão
colado na foto em vez de legenda. Tirar o nome de cima da imagem resolveu três coisas de uma vez:
sumiu o problema de contraste sobre foto, sumiu a cortina escura que existia só para resolver ele,
e a fotografia passou a aparecer inteira. O nome agora é `var(--ink)` sobre o fundo da seção, um par
de tokens que já é auditado como qualquer outro texto da página.

O cartão é `.tile` (grade de duas linhas) contendo `.tile__foto` (a imagem, em 3:2, com o canto
arredondado e a sombra) e `.tile__nome`. Se for reintroduzir sobreposição algum dia, o problema do
contraste volta junto: quatro das cinco fotos têm janela branca perto de 255 de luminância.

**O retrato de "Quem sou eu" é redondo, não de raio 14px.** O anel verde já vem
desenhado na própria arte, e o `border-radius: 50%` faz a borda do elemento
coincidir com esse anel. Com o raio de 14px das outras superfícies sobrariam
quatro cantos brancos da arte, que no tema escuro apareceriam como manchas
claras. Se um dia a foto for trocada por uma **sem** anel desenhado, é esse
`border-radius` que volta para `var(--r-surface)`.

**Ícones de rede social no rodapé.** São quatro, do mesmo conjunto Phosphor do
resto do site (`instagram-logo`, `tiktok-logo`, `youtube-logo`, `facebook-logo`),
embutidos no sprite do `index.html` como `#i-instagram`, `#i-tiktok`,
`#i-youtube` e `#i-facebook`. Os arquivos soltos ficam em `assets/icons/` só como
fonte, o site não os carrega. Todos os quatro apontam para `achadinhosdocirne`, o
mesmo arroba da seção Canais: se um endereço mudar, muda nos dois lugares.

O rodapé é uma grade de duas linhas, não flex com `wrap`. A linha de cima é a
que já existia, marca à esquerda e endereço da loja à direita, e continua
intacta; os ícones ganharam uma segunda linha própria. Em flex com `wrap` a
quebra acontecia por falta de espaço, ou seja, o arranjo mudava conforme a
largura da janela.

**Cartões de TV em grade, não em flex.** As três marcas não têm a mesma quantidade de atributos: a
TCL tem quatro, Samsung e LG têm três. Em flex centralizado cada cartão ficava com a sua própria
altura, e eram três tamanhos diferentes flutuando na tela. Na grade a linha é dimensionada pelo
cartão mais alto e os três esticam para ela. O ritmo interno do cartão é de propósito mais curto
que o das outras seções: é o que faz o mais alto caber na tela sem passar a rolar por dentro.

## Conteúdo

Títulos, parágrafos e listas são os mesmos do site anterior, preservados na íntegra. A única linha
acrescentada é o aviso "Confira o preço no link, muda rápido." na seção de fecho, exigido pela
seção 4 do documento-base da marca.
