(function () {
  "use strict";

  var STORAGE_KEY = "guarujatec_portfolio";
  var VERSION_KEY = "guarujatec_portfolio_version";
  var CURRENT_VERSION = "20261124_v4";

  var DEFAULT_PROJECTS = [
    {
      id: "proj-guarujatec",
      order: 1,
      title: "Guarujá Tec — Digital IA Marketing",
      category: "sites",
      categoryLabel: "Site & IA Marketing",
      description: "Sites rápidos de alta conversão, perfil completo no Google e atendimento automatizado com Inteligência Artificial para empresas de Guarujá e Baixada Santista.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      link: "https://guarujatec.pages.dev",
      tags: ["Sites que Vendem", "IA no WhatsApp", "Google Meu Negócio", "Automação"],
      active: true,
      featured: true
    },
    {
      id: "proj-djcell",
      order: 2,
      title: "iPhones DJ Cell • A Referência Apple no Guarujá",
      category: "ecommerce",
      categoryLabel: "Loja Virtual",
      description: "Catálogo vitrine de iPhones lacrados e seminovos com cálculo em até 18x no cartão, garantia e pedidos enviados direto para o WhatsApp na Enseada, Guarujá.",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=800&q=80",
      link: "https://djcell.pages.dev",
      tags: ["Catálogo Vitrine", "Smartphones", "WhatsApp Direct", "E-commerce"],
      active: true,
      featured: true
    },
    {
      id: "proj-mecamatic",
      order: 3,
      title: "Mecamatic CRM & Gestão Web",
      category: "sistemas",
      categoryLabel: "Sistema Web",
      description: "Sistema moderno para gestão de ordens de serviço, clientes, estoque e relatórios operacionais em tempo real para oficinas automotivas e prestadores de serviço.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      link: "https://mecamaticsite.pages.dev",
      tags: ["Painel Web", "Gestão de OS", "Dashboard", "Relatórios"],
      active: true,
      featured: true
    },
    {
      id: "proj-lamiapizza",
      order: 4,
      title: "La Mia Pizza • Cardápio Digital & Delivery",
      category: "ecommerce",
      categoryLabel: "Cardápio & Pedidos",
      description: "Cardápio digital moderno e interativo para pizzaria e delivery. Pedidos online rápidos, seleção de sabores/adicionais e envio direto para o WhatsApp sem comissões.",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      link: "https://lamiapizza-f50.pages.dev",
      tags: ["Cardápio Digital", "Delivery", "WhatsApp Pedidos", "Pizzaria"],
      active: true,
      featured: true
    },
    {
      id: "proj-conecta-guaruja",
      order: 5,
      title: "Conecta Guarujá • Guia Comercial Oficial",
      category: "sistemas",
      categoryLabel: "Portal & Guia Local",
      description: "Guia comercial inteligente e portal de negócios do Guarujá. Destaque para comércios locais, quiosques, pousadas e prestadores de serviços da Baixada Santista.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      link: "https://conecta-guaruja.pages.dev",
      tags: ["Guia Comercial", "Negócios Locais", "SEO Local", "Portal Web"],
      active: true,
      featured: true
    }
  ];

  var liveProjects = null;

  async function syncFromD1() {
    try {
      var res = await fetch("/api/projects", { cache: "no-store" });
      if (res.ok) {
        var data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          liveProjects = data;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (e) {}
          renderPortfolio();
        }
      }
    } catch (err) {
      // Falha silenciosa no ambiente local sem worker, usando fallback do localStorage
    }
  }

  function getProjects() {
    if (liveProjects && Array.isArray(liveProjects) && liveProjects.length > 0) {
      return liveProjects;
    }
    var projects = DEFAULT_PROJECTS;
    try {
      var savedVersion = localStorage.getItem(VERSION_KEY);
      if (savedVersion !== CURRENT_VERSION) {
        // Nova versão: limpa cache legado do celular/navegador e re-semeia dados mais recentes
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
        return DEFAULT_PROJECTS;
      }

      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          projects = parsed;
        }
      }
    } catch (e) {
      console.warn("Erro ao ler localStorage do portfólio:", e);
    }

    // Garante que cada projeto tenha um campo de ordem numérico
    projects.forEach(function (p, index) {
      if (p.order === undefined || p.order === null || isNaN(Number(p.order))) {
        p.order = index + 1;
      } else {
        p.order = Number(p.order);
      }
    });

    // Ordena de forma ascendente pela ordem definida
    projects.sort(function (a, b) {
      return (a.order || 999) - (b.order || 999);
    });

    return projects;
  }

  var currentFilter = "all";
  var autoPlayTimer = null;
  var isPointerInteracting = false;

  function renderPortfolio() {
    var track = document.getElementById("portfolio-track") || document.getElementById("portfolio-grid");
    if (!track) return;

    var projects = getProjects();
    // Filtra apenas projetos ativos (active !== false)
    var activeProjects = projects.filter(function (p) {
      return p.active !== false;
    });

    if (currentFilter !== "all") {
      activeProjects = activeProjects.filter(function (p) {
        return p.category === currentFilter;
      });
    }

    if (activeProjects.length === 0) {
      track.innerHTML =
        '<div class="portfolio-empty">' +
        '<div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg></div>' +
        '<h3>Nenhum projeto nesta categoria no momento</h3>' +
        '<p>Selecione outra categoria ou entre em contato para solicitar uma demonstração sob medida para sua empresa.</p>' +
        '<a href="#contato" class="btn btn-gold btn-sm">Solicitar Demonstração</a>' +
        '</div>';
      return;
    }

    var total = activeProjects.length;
    var html = "";

    activeProjects.forEach(function (proj, idx) {
      var tagsHtml = "";
      if (Array.isArray(proj.tags)) {
        proj.tags.forEach(function (t) {
          tagsHtml += '<span class="portfolio-tag">' + escapeHtml(t) + '</span>';
        });
      }

      var linkHref = proj.link && proj.link.trim() !== "" ? proj.link : "#contato";
      var isHttp = linkHref.startsWith("http");
      var isWa = linkHref.indexOf("wa.me") !== -1 || linkHref === "#contato";
      var linkTarget = isHttp ? ' target="_blank" rel="noopener noreferrer"' : "";
      var waData = isWa ? ' data-wa data-wa-msg="Olá! Vi o projeto ' + escapeHtml(proj.title) + ' na vitrine da Guarujá Tec e gostaria de uma solução similar para minha empresa."' : "";

      html +=
        '<article class="portfolio-card is-visible" tabindex="0" role="group" aria-roledescription="slide" aria-label="Projeto ' + (idx + 1) + ' de ' + total + ': ' + escapeHtml(proj.title) + '" data-link="' + escapeHtml(linkHref) + '" data-is-http="' + (isHttp ? 'true' : 'false') + '" data-category="' + escapeHtml(proj.category) + '"' + waData + '>' +
        '  <div class="portfolio-thumb">' +
        '    <img src="' + escapeHtml(proj.image) + '" alt="' + escapeHtml(proj.title) + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80\'">' +
        '    <span class="portfolio-badge">' + escapeHtml(proj.categoryLabel || proj.category) + '</span>' +
        '  </div>' +
        '  <div class="portfolio-content">' +
        '    <h3 class="portfolio-title">' + escapeHtml(proj.title) + '</h3>' +
        '    <p class="portfolio-desc">' + escapeHtml(proj.description) + '</p>' +
        '    <div class="portfolio-tags">' + tagsHtml + '</div>' +
        '    <div class="portfolio-action">' +
        '      <a class="btn btn-gold btn-portfolio" href="' + escapeHtml(linkHref) + '"' + linkTarget + waData + '>' +
        '        <span>Ver Projeto</span>' +
        '        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>' +
        '      </a>' +
        '    </div>' +
        '  </div>' +
        '</article>';
    });

    track.innerHTML = html;
    bindCardClicks(track);
  }

  function bindCardClicks(track) {
    var cards = track.querySelectorAll(".portfolio-card");
    cards.forEach(function (card) {
      // Ao clicar em qualquer área do card (exceto se já clicou diretamente no <a> interno)
      card.addEventListener("click", function (e) {
        if (card.dataset.dragged === "true") {
          return; // Não abre se o usuário estava arrastando o carrossel
        }
        if (e.target.closest("a")) {
          return; // Deixa o link nativo agir normalmente
        }

        var link = card.getAttribute("data-link");
        var isHttp = card.getAttribute("data-is-http") === "true";
        if (card.hasAttribute("data-wa")) {
          var msg = card.getAttribute("data-wa-msg") || "Olá! Gostaria de um orçamento com a Guarujá Tec.";
          window.open("https://wa.me/5513981343637?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
        } else if (isHttp) {
          window.open(link, "_blank", "noopener,noreferrer");
        } else if (link) {
          window.location.hash = link;
        }
      });

      // Acessibilidade: tecla Enter ativa o card
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          card.click();
        }
      });
    });
  }

  function initCarouselControls() {
    var track = document.getElementById("portfolio-track");
    var btnPrev = document.getElementById("portfolio-prev");
    var btnNext = document.getElementById("portfolio-next");

    if (!track) return;

    function getScrollAmount() {
      var firstCard = track.querySelector(".portfolio-card");
      return firstCard ? firstCard.offsetWidth + 24 : 380;
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", function () {
        var amount = getScrollAmount();
        if (track.scrollLeft <= 10) {
          track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
        } else {
          track.scrollBy({ left: -amount, behavior: "smooth" });
        }
        resetAutoPlay();
      });
    }

    if (btnNext) {
      btnNext.addEventListener("click", function () {
        var amount = getScrollAmount();
        var maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 15) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          track.scrollBy({ left: amount, behavior: "smooth" });
        }
        resetAutoPlay();
      });
    }

    // Suporte a arrastar com o mouse no Desktop (Drag-to-scroll)
    var isDown = false;
    var startX = 0;
    var scrollLeft = 0;
    var draggedThreshold = 6;
    var dragDist = 0;

    track.addEventListener("mousedown", function (e) {
      // Ignora clique em botões internos
      if (e.target.closest("button") || e.target.closest("a")) return;
      isDown = true;
      track.classList.add("is-dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      dragDist = 0;
    });

    window.addEventListener("mouseup", function () {
      if (!isDown) return;
      isDown = false;
      track.classList.remove("is-dragging");
      setTimeout(function () {
        track.querySelectorAll(".portfolio-card").forEach(function (c) {
          c.dataset.dragged = "false";
        });
      }, 50);
    });

    track.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 1.4;
      dragDist = Math.abs(walk);
      if (dragDist > draggedThreshold) {
        track.querySelectorAll(".portfolio-card").forEach(function (c) {
          c.dataset.dragged = "true";
        });
      }
      track.scrollLeft = scrollLeft - walk;
    });

    // Auto-scroll suave com pausa no hover
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(function () {
        if (isPointerInteracting) return;
        var maxScroll = track.scrollWidth - track.clientWidth;
        var amount = getScrollAmount();
        if (track.scrollLeft >= maxScroll - 20) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          track.scrollBy({ left: amount, behavior: "smooth" });
        }
      }, 4500);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    // Pausa carrossel no mouseover / hover do cursor
    track.addEventListener("mouseenter", function () {
      isPointerInteracting = true;
      stopAutoPlay();
    });

    track.addEventListener("mouseleave", function () {
      isPointerInteracting = false;
      startAutoPlay();
    });

    // Pausa ao tocar na tela (mobile)
    track.addEventListener("touchstart", function () {
      isPointerInteracting = true;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener("touchend", function () {
      setTimeout(function () {
        isPointerInteracting = false;
        startAutoPlay();
      }, 3000);
    }, { passive: true });

    startAutoPlay();
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initFilters() {
    var filterBtns = document.querySelectorAll(".portfolio-filters .filter-btn");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        currentFilter = btn.getAttribute("data-filter") || "all";
        renderPortfolio();
        var track = document.getElementById("portfolio-track");
        if (track) track.scrollTo({ left: 0, behavior: "smooth" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFilters();
    renderPortfolio();
    initCarouselControls();
    syncFromD1();

    // Sincroniza em tempo real se o painel adm for atualizado em outra aba
    window.addEventListener("storage", function (e) {
      if (e.key === STORAGE_KEY) {
        renderPortfolio();
      }
    });
  });

  // Exporta função global para forçar atualização se necessário
  window.reloadPortfolio = renderPortfolio;
})();
