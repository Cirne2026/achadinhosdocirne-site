/* ==========================================================================
   Achadinhos do Cirne
   Comportamento do site.

   Regras seguidas:
   - nenhum window.addEventListener("scroll"). Todo movimento ligado a
     rolagem passa por ScrollTrigger ou IntersectionObserver.
   - so transform e opacity sao animados.
   - tudo colapsa sob prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  var reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (temGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------------------------------------
     1. Tema claro e escuro
     ------------------------------------------------------------------------ */

  var botaoTema = document.getElementById("tema");
  var iconeTema = document.getElementById("tema-icone");

  function lerTemaGravado() {
    try {
      return window.localStorage.getItem("adc-tema");
    } catch (e) {
      return null;
    }
  }

  function gravarTema(valor) {
    try {
      window.localStorage.setItem("adc-tema", valor);
    } catch (e) {
      /* navegacao privativa ou armazenamento bloqueado: segue sem persistir */
    }
  }

  function temaAtual() {
    var marcado = document.documentElement.getAttribute("data-tema");
    if (marcado) return marcado;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "escuro";
  }

  function pintarIcone() {
    if (!iconeTema) return;
    var proximo = temaAtual() === "escuro" ? "#i-sun" : "#i-moon-stars";
    var uso = iconeTema.querySelector("use");
    if (uso) uso.setAttribute("href", proximo);
  }

  var gravado = lerTemaGravado();
  if (gravado === "claro" || gravado === "escuro") {
    document.documentElement.setAttribute("data-tema", gravado);
  }
  pintarIcone();

  if (botaoTema) {
    botaoTema.addEventListener("click", function () {
      var novo = temaAtual() === "escuro" ? "claro" : "escuro";
      document.documentElement.setAttribute("data-tema", novo);
      gravarTema(novo);
      pintarIcone();
      if (temGsap) ScrollTrigger.refresh();
    });
  }

  /* ------------------------------------------------------------------------
     2. Acordeao das dicas
     Comunica estado, por isso a animacao existe.
     ------------------------------------------------------------------------ */

  var botoesGuia = document.querySelectorAll(".guia__botao");

  Array.prototype.forEach.call(botoesGuia, function (botao) {
    botao.addEventListener("click", function () {
      var painel = document.getElementById(botao.getAttribute("aria-controls"));
      if (!painel) return;
      var abrindo = botao.getAttribute("aria-expanded") !== "true";
      botao.setAttribute("aria-expanded", abrindo ? "true" : "false");
      painel.setAttribute("data-aberto", abrindo ? "sim" : "nao");
      /* O sinal nao troca de icone: o CSS gira o mais em 135 graus e ele vira
         um xis. Uma troca por um menos daria um traco deitado ao girar. */
      if (temGsap) {
        window.setTimeout(function () {
          ScrollTrigger.refresh();
        }, 500);
      }
    });
  });

  /* ------------------------------------------------------------------------
     3. Player de video embutido

     O cartao mostra a capa servida da propria pasta. O iframe do YouTube so
     nasce no clique: quem nunca clicou nao faz nenhuma requisicao a terceiro
     e nao recebe rastreador. Dominio nocookie pelo mesmo motivo.
     ------------------------------------------------------------------------ */

  (function playerDeVideo() {
    var cartoes = document.querySelectorAll(".video__cartao");

    /* O player embutido do YouTube exige origem http ou https valida. Aberto
       direto do disco (file:), ou dentro de um documento sem origem (data:,
       blob:, about:), nao ha origem para o YouTube validar e ele devolve o
       erro 153. Nesse caso o cartao vira link para o YouTube, em vez de
       abrir um player que nunca vai tocar. */
    var semOrigem = !/^https?:$/.test(window.location.protocol);

    Array.prototype.forEach.call(cartoes, function (cartao) {
      if (semOrigem) {
        var id0 = cartao.getAttribute("data-video");
        var acao0 = cartao.querySelector(".video__acao");
        if (acao0) acao0.childNodes[0].nodeValue = "Abrir no YouTube ";
        cartao.addEventListener("click", function () {
          window.open("https://youtu.be/" + id0, "_blank", "noopener");
        });
        return;
      }

      cartao.addEventListener("click", function () {
        var id = cartao.getAttribute("data-video");
        var titulo = cartao.getAttribute("data-titulo") || "";
        var caixa = cartao.parentNode;
        if (!id || !caixa) return;

        var palco = document.createElement("div");
        palco.className = "video__palco";

        var quadro = document.createElement("iframe");
        quadro.src = "https://www.youtube-nocookie.com/embed/" + id +
          "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
        quadro.title = titulo;
        quadro.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share");
        quadro.setAttribute("allowfullscreen", "");
        quadro.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        palco.appendChild(quadro);

        var legenda = document.createElement("p");
        legenda.className = "video__legenda";
        legenda.textContent = titulo;

        /* Saida de emergencia: se o player nao tocar por qualquer motivo,
           restricao de rede, bloqueador, politica do navegador, o visitante
           nao fica preso olhando um retangulo preto. */
        var escape = document.createElement("a");
        escape.className = "video__escape";
        escape.href = "https://youtu.be/" + id;
        escape.target = "_blank";
        escape.rel = "noopener";
        escape.textContent = "Nao carregou? Abrir no YouTube";

        caixa.replaceChild(palco, cartao);
        caixa.appendChild(legenda);
        caixa.appendChild(escape);

        /* a caixa mudou de altura, os gatilhos precisam remedir */
        if (temGsap) {
          window.setTimeout(function () { ScrollTrigger.refresh(); }, 120);
        }
      });
    });
  })();

  /* ------------------------------------------------------------------------
     4. Carrossel de categorias da loja

     A rolagem e nativa. Sem script a pista continua rolando no toque e no
     trackpad, e tambem pelo teclado, porque a pista recebe foco e o navegador
     rola sozinho com as setas. O script so acrescenta os botoes e o medidor de
     posicao, e por isso o pe do carrossel nasce escondido no CSS: se o script
     nao carregar, ninguem fica olhando para uma seta que nao faz nada.
     ------------------------------------------------------------------------ */

  (function carrosseis() {
    var caixas = document.querySelectorAll("[data-carrossel]");

    Array.prototype.forEach.call(caixas, function (caixa) {
      var pista = caixa.querySelector(".carrossel__pista");
      if (!pista) return;

      var barra = caixa.querySelector(".carrossel__barra");
      var setas = caixa.querySelectorAll(".carrossel__seta");

      /* um cartao mais o vao entre cartoes: o passo do botao e sempre um
         cartao, para cair certo no ponto de encaixe do scroll-snap */
      function passoDeUmCartao() {
        var cartao = pista.firstElementChild;
        if (!cartao) return pista.clientWidth;
        var vao = parseFloat(window.getComputedStyle(pista).columnGap) || 0;
        return cartao.getBoundingClientRect().width + vao;
      }

      function pintar() {
        var sobra = pista.scrollWidth - pista.clientWidth;
        caixa.classList.toggle("carrossel--ativo", sobra > 2);
        if (sobra <= 2) return;

        var posicao = Math.min(1, Math.max(0, pista.scrollLeft / sobra));

        /* O medidor e um polegar: largura proporcional ao que cabe na tela,
           deslocado pela posicao. O translateX vem depois do scaleX, entao ele
           anda no sistema ja escalado e a porcentagem precisa ser dividida
           pela fracao. */
        if (barra) {
          var fracao = pista.clientWidth / pista.scrollWidth;
          barra.style.transform = "scaleX(" + fracao + ") translateX(" +
            (posicao * (1 - fracao) / fracao * 100) + "%)";
        }

        Array.prototype.forEach.call(setas, function (seta) {
          var passo = Number(seta.getAttribute("data-passo"));
          seta.disabled = passo < 0
            ? pista.scrollLeft <= 1
            : pista.scrollLeft >= sobra - 1;
        });
      }

      var agendado = false;
      function agendarPintura() {
        if (agendado) return;
        agendado = true;
        window.requestAnimationFrame(function () {
          agendado = false;
          pintar();
        });
      }

      /* Listener de rolagem do proprio elemento, nunca da janela. E a unica
         forma de saber onde a pista esta, e nada aqui depende do scroll da
         pagina. */
      pista.addEventListener("scroll", agendarPintura, { passive: true });

      Array.prototype.forEach.call(setas, function (seta) {
        seta.addEventListener("click", function () {
          pista.scrollBy({
            left: (Number(seta.getAttribute("data-passo")) || 1) * passoDeUmCartao(),
            behavior: reduzirMovimento ? "auto" : "smooth"
          });
        });
      });

      if ("ResizeObserver" in window) {
        new ResizeObserver(agendarPintura).observe(pista);
      } else {
        window.addEventListener("resize", agendarPintura);
      }

      pintar();
      /* as fotos entram com lazy: a largura util so e final depois da carga */
      window.addEventListener("load", pintar);
    });
  })();

  /* ------------------------------------------------------------------------
     5. Vidro da barra de navegacao

     Fica FORA do bloco de movimento de proposito. O fosco nao e enfeite: no
     topo a barra flutua sobre a foto do heroi e, sem ele, o texto da barra
     perde contraste assim que a pagina rola. Quem pede movimento reduzido
     tambem precisa conseguir ler a barra.

     Usa IntersectionObserver com uma sentinela de 1px, nunca um listener de
     scroll.
     ------------------------------------------------------------------------ */

  (function vidroDaBarra() {
    var barra = document.getElementById("nav");
    if (!barra) return;

    var sentinela = document.createElement("div");
    sentinela.setAttribute("aria-hidden", "true");
    sentinela.style.cssText = "position:absolute;top:0;left:0;width:1px;height:14px;pointer-events:none;";
    document.body.insertBefore(sentinela, document.body.firstChild);

    if (!("IntersectionObserver" in window)) {
      barra.classList.add("esta-fosca");
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      barra.classList.toggle("esta-fosca", !entradas[0].isIntersecting);
    }, { threshold: 0 });

    observador.observe(sentinela);
  })();

  /* ------------------------------------------------------------------------
     5b. Menu do celular

     Ate aqui o menu simplesmente sumia abaixo de 900px e nada tomava o lugar
     dele: no celular nao havia como chegar em Loja, Quem sou eu, Dicas,
     Canais nem Ofertas. Como quase todo o publico vem do Instagram, ou seja,
     de celular, isso escondia o site do proprio visitante.

     O painel e o MESMO <nav> de sempre, so que o CSS o transforma. Aqui em
     cima so existe estado: abrir, fechar, e as saidas por onde a pessoa
     espera sair.
     ------------------------------------------------------------------------ */
  (function menuDoCelular() {
    var barra = document.getElementById("nav");
    var botao = document.getElementById("menu-botao");
    var painel = document.getElementById("menu");
    if (!barra || !botao || !painel) return;

    var aberto = false;
    var telaEstreita = window.matchMedia("(max-width: 900px)");

    function focaveis() {
      return painel.querySelectorAll("a[href], button:not([disabled])");
    }

    function abrir() {
      if (aberto) return;
      aberto = true;
      barra.classList.add("esta-aberto");
      document.documentElement.classList.add("menu-travado");
      botao.setAttribute("aria-expanded", "true");
      botao.setAttribute("aria-label", "Fechar o menu");

      /* Levar o foco para o primeiro item e o que faz o menu existir para quem
         navega por teclado ou leitor de tela. Sem isso o foco continuaria
         atras do painel, num link que a pessoa nem ve. */
      var itens = focaveis();
      if (itens.length) itens[0].focus();
    }

    function fechar(devolverFoco) {
      if (!aberto) return;
      aberto = false;
      barra.classList.remove("esta-aberto");
      document.documentElement.classList.remove("menu-travado");
      botao.setAttribute("aria-expanded", "false");
      botao.setAttribute("aria-label", "Abrir o menu");
      if (devolverFoco) botao.focus();
    }

    botao.addEventListener("click", function () {
      if (aberto) fechar(true); else abrir();
    });

    /* Clicar num item fecha. Sao ancoras para secoes desta pagina: deixar o
       painel aberto por cima do destino seria esconder justamente o que a
       pessoa pediu para ver. */
    painel.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) fechar(false);
    });

    document.addEventListener("keydown", function (ev) {
      if (!aberto) return;

      if (ev.key === "Escape") {
        fechar(true);
        return;
      }

      /* Prende o Tab dentro do painel. Ele cobre a tela inteira, entao tabular
         para tras dele levaria o foco a links invisiveis. */
      if (ev.key !== "Tab") return;
      var itens = focaveis();
      if (!itens.length) return;
      var primeiro = itens[0];
      var ultimo = itens[itens.length - 1];

      if (ev.shiftKey && document.activeElement === primeiro) {
        ev.preventDefault();
        ultimo.focus();
      } else if (!ev.shiftKey && document.activeElement === ultimo) {
        ev.preventDefault();
        primeiro.focus();
      }
    });

    /* Girar o aparelho ou abrir o site no computador passa de 900px, e ai o
       menu volta a ser a barra de sempre. Se o estado ficasse aberto, a
       rolagem continuaria travada num layout que nem tem painel. */
    function aoMudarLargura() {
      if (!telaEstreita.matches) fechar(false);
    }
    if (telaEstreita.addEventListener) {
      telaEstreita.addEventListener("change", aoMudarLargura);
    } else if (telaEstreita.addListener) {
      telaEstreita.addListener(aoMudarLargura);
    }
  })();

  /* ------------------------------------------------------------------------
     6. Quebra dos titulos em palavras
     Serve a revelacao em sequencia. Sem movimento, nao quebra nada.
     ------------------------------------------------------------------------ */

  function quebrarEmPalavras(elemento) {
    var palavras = elemento.textContent.trim().split(/\s+/);
    elemento.textContent = "";
    palavras.forEach(function (palavra, i) {
      var fora = document.createElement("span");
      fora.className = "palavra";
      var dentro = document.createElement("span");
      dentro.textContent = palavra;
      fora.appendChild(dentro);
      elemento.appendChild(fora);
      if (i < palavras.length - 1) {
        elemento.appendChild(document.createTextNode(" "));
      }
    });
    return elemento.querySelectorAll(".palavra > span");
  }

  /* ------------------------------------------------------------------------
     7. Movimento
     ------------------------------------------------------------------------ */

  if (temGsap && !reduzirMovimento) {
    var mm = gsap.matchMedia();

    /* --- 7.1 heroi: entrada em sequencia e profundidade na rolagem --- */
    var tituloHeroi = document.querySelector(".heroi__titulo[data-palavras]");
    var imgHeroi = document.getElementById("heroi-img");

    /* A entrada do heroi roda no carregamento, e o estado inicial esconde o
       titulo. Se o relogio de animacao nao andar (aba em segundo plano,
       janela minimizada, GSAP falhando), o titulo ficaria invisivel para
       sempre. Por isso ela so e montada com a pagina visivel, e existe uma
       rede de seguranca que limpa tudo se nao tiver rodado. */
    var palavrasHeroi = tituloHeroi ? quebrarEmPalavras(tituloHeroi) : null;

    function montarEntrada() {
      var entrada = gsap.timeline({ defaults: { ease: "expo.out" } });

      if (imgHeroi) {
        entrada.fromTo(imgHeroi, { scale: 1.22 }, { scale: 1.12, duration: 1.9 }, 0);
      }

      entrada.from(".heroi__rotulo", { opacity: 0, y: 16, duration: 0.9 }, 0.15);

      if (palavrasHeroi) {
        entrada.from(palavrasHeroi, {
          yPercent: 118,
          duration: 1.15,
          stagger: 0.075
        }, 0.28);
      }

      entrada.from(".heroi__acoes > *", {
        opacity: 0,
        y: 18,
        duration: 0.85,
        stagger: 0.09
      }, 0.72);

      window.setTimeout(function () {
        if (entrada.progress() === 0) {
          entrada.kill();
          if (palavrasHeroi) gsap.set(palavrasHeroi, { clearProps: "all" });
          gsap.set(".heroi__rotulo, .heroi__acoes > *", { clearProps: "all" });
          if (imgHeroi) gsap.set(imgHeroi, { clearProps: "all" });
        }
      }, 2600);
    }

    if (document.visibilityState === "visible") {
      montarEntrada();
    } else {
      document.addEventListener("visibilitychange", function aoAparecer() {
        if (document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", aoAparecer);
        montarEntrada();
      });
    }

    if (imgHeroi) {
      gsap.to(imgHeroi, {
        yPercent: 11,
        ease: "none",
        scrollTrigger: {
          trigger: ".heroi",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    /* --- 7.2 titulos de secao: hierarquia, em sequencia de leitura ---
       immediateRender: false e obrigatorio aqui. Sem ele o GSAP aplica o
       estado inicial na criacao do gatilho, e todo titulo abaixo da dobra
       fica com as palavras empurradas para baixo, invisiveis dentro do
       overflow e com a caixa invadindo o texto seguinte. O estado em
       repouso tem que ser o estado legivel. */
    var titulos = document.querySelectorAll("[data-palavras]:not(.heroi__titulo)");
    Array.prototype.forEach.call(titulos, function (titulo) {
      var palavras = quebrarEmPalavras(titulo);
      gsap.from(palavras, {
        yPercent: 112,
        duration: 1,
        ease: "expo.out",
        stagger: 0.055,
        immediateRender: false,
        scrollTrigger: {
          trigger: titulo,
          start: "top 92%",
          once: true
        }
      });
    });

    /* --- 7.3 itens que entram em cena --- */
    var entrantes = document.querySelectorAll(".entra");
    Array.prototype.forEach.call(entrantes, function (item) {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "expo.out",
        scrollTrigger: {
          trigger: item,
          start: "top 92%",
          once: true
        },
        onStart: function () { item.classList.add("visivel"); }
      });
    });

    /* --- 7.4 pilha fixa dos processadores ---
       Storytelling: Intel, depois AMD, depois os outros fatores, em
       sequencia. O painel anterior recua quando o proximo chega. */
    var itensPilha = gsap.utils.toArray(".pilha__item");
    itensPilha.forEach(function (item, i) {
      if (i === itensPilha.length - 1) return;
      var painel = item.querySelector(".painel");
      if (!painel) return;
      gsap.to(painel, {
        scale: 0.94,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: itensPilha[i + 1],
          start: "top bottom",
          end: "top top",
          scrub: true
        }
      });
    });

    /* --- 7.5 pan horizontal das marcas de TV ---
       Storytelling: a comparacao entre as tres marcas e o proprio
       deslocamento lateral. So acima de 900px. */
    mm.add("(min-width: 901px)", function () {
      var palco = document.getElementById("pan-palco");
      var trilho = document.getElementById("pan-trilho");
      if (!palco || !trilho) return;

      var gatilho = ScrollTrigger.create({
        trigger: palco,
        start: "top top",
        end: function () {
          return "+=" + Math.max(1, trilho.scrollWidth - window.innerWidth);
        },
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        animation: gsap.to(trilho, {
          x: function () {
            return -Math.max(0, trilho.scrollWidth - window.innerWidth);
          },
          ease: "none"
        })
      });

      return function () {
        gatilho.kill();
        gsap.set(trilho, { clearProps: "x" });
      };
    });

    /* --- 7.6 fecho: profundidade --- */
    var imgFecho = document.getElementById("fecho-img");
    if (imgFecho) {
      gsap.fromTo(imgFecho, { yPercent: -7 }, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: ".fecho",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }

    /* recalcula quando as fontes assentam, para nao desalinhar os gatilhos */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  } else {
    /* sem GSAP ou com movimento reduzido: conteudo visivel de imediato */
    var paraMostrar = document.querySelectorAll(".entra");
    Array.prototype.forEach.call(paraMostrar, function (item) {
      item.classList.add("visivel");
    });
  }
})();
