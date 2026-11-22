(function () {
  "use strict";

  var STORAGE_KEY = "guarujatec_portfolio";

  var DEFAULT_PROJECTS = [
    {
      id: "proj-1",
      title: "Mecamatic CRM & Gestão Web",
      category: "sistemas",
      categoryLabel: "Sistema Web",
      description: "Sistema completo para gestão de ordens de serviço, clientes, estoque e dashboards financeiros em tempo real para empresas automotivas e de serviços.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      tags: ["Painel Web", "Dashboard", "Gestão", "Relatórios"],
      link: "https://guarujatec.com.br",
      active: true,
      featured: true
    },
    {
      id: "proj-2",
      title: "FitFuel E-commerce & Suplementos",
      category: "ecommerce",
      categoryLabel: "Loja Virtual",
      description: "E-commerce moderno de alta performance com catálogo intuitivo, cálculo dinâmico de frete, múltiplos meios de pagamento e finalização de compras por WhatsApp.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      tags: ["E-commerce", "Carrinho", "Checkout Rápido", "SEO"],
      link: "https://guarujatec.com.br",
      active: true,
      featured: true
    },
    {
      id: "proj-3",
      title: "Naty Gomes Personal Trainer",
      category: "sites",
      categoryLabel: "Site Profissional",
      description: "Landing page de alta conversão para serviços de personal trainer no Guarujá, integrada ao WhatsApp e totalmente otimizada para buscas no Google Meu Negócio.",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      tags: ["Design Exclusivo", "SEO Local", "Alta Velocidade", "Mobile"],
      link: "https://guarujatec.com.br",
      active: true,
      featured: true
    },
    {
      id: "proj-4",
      title: "Agente IA Atendimento 24h WhatsApp",
      category: "automacao",
      categoryLabel: "Automação & IA",
      description: "Assistente inteligente com IA conectado ao WhatsApp para qualificação automática de leads, agendamento de reuniões e suporte 24 horas por dia.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      tags: ["Chatbot IA", "WhatsApp API", "Qualificação", "Follow-up"],
      link: "https://guarujatec.com.br",
      active: true,
      featured: false
    },
    {
      id: "proj-5",
      title: "DJ Cell Imports & Acessórios",
      category: "ecommerce",
      categoryLabel: "Loja Virtual",
      description: "Catálogo vitrine com exibição de modelos, cálculo de parcelas, variações de cores/capacidade e pedidos diretos encaminhados para a equipe comercial.",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=800&q=80",
      tags: ["Vitrine Virtual", "Smartphones", "WhatsApp Direct", "Catálogo"],
      link: "https://guarujatec.com.br",
      active: true,
      featured: false
    },
    {
      id: "proj-6",
      title: "Clínica Odonto Santos & Guarujá",
      category: "sites",
      categoryLabel: "Site Profissional",
      description: "Presença digital completa e otimização para SEO Local, aumentando em mais de 180% a captação de pacientes particulares via buscas locais do Google.",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
      tags: ["Google Meu Negócio", "SEO Local", "Autoridade", "Conversão"],
      link: "https://guarujatec.com.br",
      active: true,
      featured: false
    }
  ];

  function getProjects() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Erro ao ler localStorage do portfólio:", e);
    }
    // Salva o padrão no localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
    } catch (e) {}
    return DEFAULT_PROJECTS;
  }

  var currentFilter = "all";

  function renderPortfolio() {
    var grid = document.getElementById("portfolio-grid");
    if (!grid) return;

    var projects = getProjects();
    // Filtra apenas projetos com active !== false
    var activeProjects = projects.filter(function (p) {
      return p.active !== false;
    });

    if (currentFilter !== "all") {
      activeProjects = activeProjects.filter(function (p) {
        return p.category === currentFilter;
      });
    }

    if (activeProjects.length === 0) {
      grid.innerHTML =
        '<div class="portfolio-empty">' +
        '<div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg></div>' +
        '<h3>Nenhum projeto exibido nesta categoria</h3>' +
        '<p>Selecione outra categoria ou acesse o painel administrativo para adicionar novos projetos à vitrine.</p>' +
        '<a href="admin.html" class="btn btn-outline btn-sm">Abrir Painel Administrativo</a>' +
        '</div>';
      return;
    }

    var html = "";
    activeProjects.forEach(function (proj) {
      var tagsHtml = "";
      if (Array.isArray(proj.tags)) {
        proj.tags.forEach(function (t) {
          tagsHtml += '<span class="portfolio-tag">' + escapeHtml(t) + '</span>';
        });
      }

      var linkHref = proj.link && proj.link.trim() !== "" ? proj.link : "#contato";
      var linkTarget = proj.link && proj.link.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
      var isWa = linkHref.indexOf("wa.me") !== -1 || linkHref === "#contato";
      var waData = isWa ? ' data-wa data-wa-msg="Olá! Vi o projeto ' + escapeHtml(proj.title) + ' no portfólio da Guarujá Tec e gostaria de um projeto similar para minha empresa."' : "";

      html +=
        '<article class="portfolio-card reveal is-visible" data-category="' + escapeHtml(proj.category) + '">' +
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

    grid.innerHTML = html;
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
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFilters();
    renderPortfolio();

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
