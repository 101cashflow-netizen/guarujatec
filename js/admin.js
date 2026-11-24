(function () {
  "use strict";

  var STORAGE_KEY = "guarujatec_portfolio";
  var AUTH_KEY = "guarujatec_admin_auth";
  var PWD_KEY = "guarujatec_admin_pwd";
  var DEFAULT_PASSWORD = "guarujatec";

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

  var categoryLabels = {
    sites: "Site Profissional",
    ecommerce: "Loja Virtual",
    sistemas: "Sistema Web",
    automacao: "Automação & IA"
  };

  function getAdminPassword() {
    return sessionStorage.getItem(PWD_KEY) || DEFAULT_PASSWORD;
  }

  // --- API CLOUDFLARE D1 ---
  async function apiD1(action, payload) {
    try {
      var bodyData = Object.assign({ action: action }, payload || {});
      var res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": getAdminPassword(),
        },
        body: JSON.stringify(bodyData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("D1 API não disponível (ambiente local ou offline):", err);
    }
    return null;
  }

  async function syncFromD1() {
    try {
      var res = await fetch("/api/projects?all=true", {
        headers: { "X-Admin-Password": getAdminPassword() },
        cache: "no-store",
      });
      if (res.ok) {
        var data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveProjectsLocally(data);
          updateStats(data);
          renderProjectsList(data);
        }
      }
    } catch (err) {
      console.warn("Falha ao sincronizar admin do D1:", err);
    }
  }

  // --- AUTENTICAÇÃO ---
  function checkAuth() {
    var isAuth = sessionStorage.getItem(AUTH_KEY) === "true";
    var loginScreen = document.getElementById("login-screen");
    var adminApp = document.getElementById("admin-app");

    if (isAuth) {
      if (loginScreen) loginScreen.style.display = "none";
      if (adminApp) adminApp.style.display = "block";
      initAdmin();
    } else {
      if (loginScreen) loginScreen.style.display = "flex";
      if (adminApp) adminApp.style.display = "none";
    }
  }

  function initLogin() {
    var form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var passInput = document.getElementById("admin-password");
      var pass = passInput ? passInput.value.trim() : "";

      if (pass === DEFAULT_PASSWORD || pass === "admin123") {
        sessionStorage.setItem(AUTH_KEY, "true");
        sessionStorage.setItem(PWD_KEY, pass);
        checkAuth();
      } else {
        alert("Senha incorreta! Dica: a senha padrão é " + DEFAULT_PASSWORD);
        if (passInput) passInput.focus();
      }
    });

    var btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", function () {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(PWD_KEY);
        checkAuth();
      });
    }
  }

  // --- GERENCIAMENTO DE DADOS ---
  function loadProjects() {
    var projects = DEFAULT_PROJECTS;
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          projects = parsed;
        }
      }
    } catch (e) {
      console.warn("Erro ao ler localStorage:", e);
    }

    // Normaliza os números de ordem
    projects.forEach(function (p, index) {
      if (p.order === undefined || p.order === null || isNaN(Number(p.order))) {
        p.order = index + 1;
      } else {
        p.order = Number(p.order);
      }
    });

    // Ordena de forma ascendente
    projects.sort(function (a, b) {
      return (a.order || 999) - (b.order || 999);
    });

    return projects;
  }

  function saveProjectsLocally(projects) {
    try {
      projects.sort(function (a, b) {
        return (Number(a.order) || 999) - (Number(b.order) || 999);
      });
      projects.forEach(function (p, i) {
        p.order = i + 1;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {}
  }

  function saveProjects(projects, targetProject) {
    saveProjectsLocally(projects);
    updateStats(projects);
    renderProjectsList(projects);

    // Persiste no Cloudflare D1
    if (targetProject) {
      apiD1("save", { project: targetProject });
    }
  }

  function moveProjectOrder(id, direction) {
    var projects = loadProjects();
    var idx = -1;
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].id === id) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return;

    var targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    // Troca as posições no array
    var temp = projects[idx];
    projects[idx] = projects[targetIdx];
    projects[targetIdx] = temp;

    // Atualiza os números de ordem sequencialmente
    projects.forEach(function (p, i) {
      p.order = i + 1;
    });

    saveProjectsLocally(projects);
    updateStats(projects);
    renderProjectsList(projects);

    // Envia atualização de ordem em lote para o Cloudflare D1
    apiD1("reorder", {
      orders: projects.map(function (p) {
        return { id: p.id, order: p.order };
      }),
    });
  }

  // --- RENDERIZAÇÃO DA LISTA ---
  function updateStats(projects) {
    var total = projects.length;
    var active = projects.filter(function (p) { return p.active !== false; }).length;
    var inactive = total - active;

    var elTotal = document.getElementById("stat-total");
    var elActive = document.getElementById("stat-active");
    var elInactive = document.getElementById("stat-inactive");

    if (elTotal) elTotal.textContent = total;
    if (elActive) elActive.textContent = active;
    if (elInactive) elInactive.textContent = inactive;
  }

  function renderProjectsList(projects) {
    var container = document.getElementById("projects-list-container");
    if (!container) return;

    var searchVal = (document.getElementById("search-input") ? document.getElementById("search-input").value : "").toLowerCase().trim();

    var filtered = projects.filter(function (p) {
      if (!searchVal) return true;
      var matchTitle = p.title && p.title.toLowerCase().indexOf(searchVal) !== -1;
      var matchCat = p.categoryLabel && p.categoryLabel.toLowerCase().indexOf(searchVal) !== -1;
      var matchTags = Array.isArray(p.tags) && p.tags.join(" ").toLowerCase().indexOf(searchVal) !== -1;
      return matchTitle || matchCat || matchTags;
    });

    if (filtered.length === 0) {
      container.innerHTML =
        '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #141414; border-radius: 14px; border: 1px dashed rgba(255,255,255,0.1);">' +
        '<h3>Nenhum projeto encontrado</h3>' +
        '<p style="color: #888; font-size: 0.9rem; margin-top: 6px;">Clique em "+ Novo Projeto" para cadastrar.</p>' +
        '</div>';
      return;
    }

    var html = "";
    filtered.forEach(function (proj, index) {
      var isActive = proj.active !== false;
      var statusClass = isActive ? "status-active" : "status-inactive";
      var statusText = isActive ? "Visível na Vitrine" : "Oculto";
      var cardClass = isActive ? "admin-card" : "admin-card is-inactive";

      var tagsHtml = "";
      if (Array.isArray(proj.tags)) {
        proj.tags.forEach(function (t) {
          tagsHtml += '<span class="admin-card-tag">' + escapeHtml(t) + '</span>';
        });
      }

      var isFirst = index === 0;
      var isLast = index === filtered.length - 1;

      html +=
        '<div class="' + cardClass + '" data-id="' + escapeHtml(proj.id) + '">' +
        '  <div class="admin-card-thumb">' +
        '    <img src="' + escapeHtml(proj.image) + '" alt="' + escapeHtml(proj.title) + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80\'">' +
        '    <span class="admin-card-order" title="Ordem no Carrossel">#' + (proj.order || (index + 1)) + '</span>' +
        '    <span class="admin-card-status ' + statusClass + '">' + statusText + '</span>' +
        '  </div>' +
        '  <div class="admin-card-body">' +
        '    <div class="admin-card-cat">' + escapeHtml(proj.categoryLabel || categoryLabels[proj.category] || proj.category) + '</div>' +
        '    <h3 class="admin-card-title">' + escapeHtml(proj.title) + '</h3>' +
        '    <p class="admin-card-desc">' + escapeHtml(proj.description) + '</p>' +
        '    <div class="admin-card-tags">' + tagsHtml + '</div>' +
        '    <div class="admin-card-footer">' +
        '      <label class="switch-label" title="Clique para exibir ou ocultar do site">' +
        '        <input type="checkbox" class="toggle-active" data-id="' + escapeHtml(proj.id) + '" ' + (isActive ? "checked" : "") + '>' +
        '        <span class="switch-slider"></span>' +
        '        <span>' + (isActive ? "Ativo" : "Oculto") + '</span>' +
        '      </label>' +
        '      <div class="card-actions">' +
        '        <button class="btn-icon btn-order-up" data-id="' + escapeHtml(proj.id) + '" title="Mover para cima (exibir antes no carrossel)" ' + (isFirst ? "disabled style='opacity:0.3;cursor:not-allowed'" : "") + '>' +
        '          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 15l-6-6-6 6"/></svg>' +
        '        </button>' +
        '        <button class="btn-icon btn-order-down" data-id="' + escapeHtml(proj.id) + '" title="Mover para baixo (exibir depois no carrossel)" ' + (isLast ? "disabled style='opacity:0.3;cursor:not-allowed'" : "") + '>' +
        '          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>' +
        '        </button>' +
        '        <button class="btn-icon btn-edit" data-id="' + escapeHtml(proj.id) + '" title="Editar Projeto">' +
        '          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
        '        </button>' +
        '        <button class="btn-icon btn-icon-delete btn-delete" data-id="' + escapeHtml(proj.id) + '" title="Excluir Projeto">' +
        '          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>' +
        '        </button>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    });

    container.innerHTML = html;
    bindCardEvents();
  }

  function bindCardEvents() {
    // Reordenar para cima
    document.querySelectorAll(".btn-order-up").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        moveProjectOrder(id, -1);
      });
    });

    // Reordenar para baixo
    document.querySelectorAll(".btn-order-down").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        moveProjectOrder(id, 1);
      });
    });

    // Toggle active
    document.querySelectorAll(".toggle-active").forEach(function (toggle) {
      toggle.addEventListener("change", function () {
        var id = this.getAttribute("data-id");
        var checked = this.checked;
        var projects = loadProjects();
        var p = projects.find(function (item) { return item.id === id; });
        if (p) {
          p.active = checked;
          saveProjects(projects, p);
        }
      });
    });

    // Editar
    document.querySelectorAll(".btn-edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        openEditModal(id);
      });
    });

    // Excluir
    document.querySelectorAll(".btn-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        if (confirm("Tem certeza que deseja excluir este projeto da vitrine?")) {
          var projects = loadProjects();
          var updated = projects.filter(function (item) { return item.id !== id; });
          saveProjectsLocally(updated);
          updateStats(updated);
          renderProjectsList(updated);
          apiD1("delete", { id: id });
        }
      });
    });
  }

  // --- MODAL DE CADASTRO / EDIÇÃO ---
  var modal = document.getElementById("project-modal");
  var form = document.getElementById("project-form");
  var modalTitle = document.getElementById("modal-title");
  var imageInput = document.getElementById("proj-image");
  var imageFile = document.getElementById("proj-image-file");
  var imagePreview = document.getElementById("image-preview");
  var previewPlaceholder = document.getElementById("preview-placeholder");

  function openCreateModal() {
    form.reset();
    document.getElementById("proj-id").value = "";
    document.getElementById("proj-active").checked = true;
    var projects = loadProjects();
    document.getElementById("proj-order").value = projects.length + 1;
    modalTitle.textContent = "Adicionar Novo Projeto";
    updateImagePreview("");
    modal.style.display = "flex";
  }

  function openEditModal(id) {
    var projects = loadProjects();
    var p = projects.find(function (item) { return item.id === id; });
    if (!p) return;

    document.getElementById("proj-id").value = p.id;
    document.getElementById("proj-order").value = p.order || 1;
    document.getElementById("proj-title").value = p.title || "";
    document.getElementById("proj-category").value = p.category || "sites";
    document.getElementById("proj-desc").value = p.description || "";
    document.getElementById("proj-image").value = p.image || "";
    document.getElementById("proj-link").value = p.link || "";
    document.getElementById("proj-tags").value = Array.isArray(p.tags) ? p.tags.join(", ") : "";
    document.getElementById("proj-active").checked = p.active !== false;

    modalTitle.textContent = "Editar Projeto: " + p.title;
    updateImagePreview(p.image || "");
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  function updateImagePreview(src) {
    if (src && src.trim() !== "") {
      imagePreview.src = src;
      imagePreview.style.display = "block";
      if (previewPlaceholder) previewPlaceholder.style.display = "none";
    } else {
      imagePreview.src = "";
      imagePreview.style.display = "none";
      if (previewPlaceholder) previewPlaceholder.style.display = "block";
    }
  }

  function initModal() {
    var btnNew = document.getElementById("btn-new-project");
    var btnClose = document.getElementById("modal-close");
    var btnCancel = document.getElementById("modal-cancel");

    if (btnNew) btnNew.addEventListener("click", openCreateModal);
    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnCancel) btnCancel.addEventListener("click", closeModal);

    // Fechar ao clicar no backdrop
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    // Preview ao digitar URL
    if (imageInput) {
      imageInput.addEventListener("input", function () {
        updateImagePreview(this.value.trim());
      });
    }

    // Upload local em base64
    if (imageFile) {
      imageFile.addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function (evt) {
            var dataUrl = evt.target.result;
            if (imageInput) imageInput.value = dataUrl;
            updateImagePreview(dataUrl);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Submissão do formulário
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var id = document.getElementById("proj-id").value;
      var order = parseInt(document.getElementById("proj-order").value, 10);
      if (isNaN(order) || order < 1) order = 1;

      var title = document.getElementById("proj-title").value.trim();
      var category = document.getElementById("proj-category").value;
      var desc = document.getElementById("proj-desc").value.trim();
      var image = document.getElementById("proj-image").value.trim();
      var link = document.getElementById("proj-link").value.trim();
      var tagsRaw = document.getElementById("proj-tags").value;
      var active = document.getElementById("proj-active").checked;

      var tags = tagsRaw
        .split(",")
        .map(function (t) { return t.trim(); })
        .filter(function (t) { return t.length > 0; });

      var projects = loadProjects();
      var savedProj = null;

      if (id) {
        // Atualizar existente
        var existing = projects.find(function (p) { return p.id === id; });
        if (existing) {
          existing.order = order;
          existing.title = title;
          existing.category = category;
          existing.categoryLabel = categoryLabels[category] || category;
          existing.description = desc;
          existing.image = image;
          existing.link = link;
          existing.tags = tags;
          existing.active = active;
          savedProj = existing;
        }
      } else {
        // Adicionar novo
        savedProj = {
          id: "proj-" + Date.now(),
          order: order,
          title: title,
          category: category,
          categoryLabel: categoryLabels[category] || category,
          description: desc,
          image: image,
          link: link,
          tags: tags,
          active: active,
          featured: false
        };
        projects.push(savedProj);
      }

      saveProjects(projects, savedProj);
      closeModal();
    });
  }

  // --- IMPORTAÇÃO / EXPORTAÇÃO / RESTAURAÇÃO ---
  function initTools() {
    var searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        var projects = loadProjects();
        renderProjectsList(projects);
      });
    }

    // Exportar JSON
    var btnExport = document.getElementById("btn-export-json");
    if (btnExport) {
      btnExport.addEventListener("click", function () {
        var projects = loadProjects();
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
        var downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "portfolio-guarujatec.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    }

    // Importar JSON
    var btnImport = document.getElementById("btn-import-json");
    var fileInput = document.getElementById("file-import-json");
    if (btnImport && fileInput) {
      btnImport.addEventListener("click", function () {
        fileInput.click();
      });

      fileInput.addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function (evt) {
          try {
            var imported = JSON.parse(evt.target.result);
            if (Array.isArray(imported)) {
              if (confirm("Importar " + imported.length + " projetos e sincronizar com o banco D1?")) {
                saveProjectsLocally(imported);
                updateStats(imported);
                renderProjectsList(imported);

                // Envia para o Cloudflare D1
                for (var i = 0; i < imported.length; i++) {
                  await apiD1("save", { project: imported[i] });
                }
                alert("Projetos importados e sincronizados com a nuvem!");
              }
            } else {
              alert("Arquivo inválido: o formato precisa ser um array de projetos.");
            }
          } catch (err) {
            alert("Erro ao ler arquivo JSON: " + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Restaurar Padrão
    var btnReset = document.getElementById("btn-reset-default");
    if (btnReset) {
      btnReset.addEventListener("click", async function () {
        if (confirm("Tem certeza que deseja restaurar os 6 projetos originais da Guarujá Tec no banco D1?")) {
          saveProjectsLocally(DEFAULT_PROJECTS);
          updateStats(DEFAULT_PROJECTS);
          renderProjectsList(DEFAULT_PROJECTS);

          for (var i = 0; i < DEFAULT_PROJECTS.length; i++) {
            await apiD1("save", { project: DEFAULT_PROJECTS[i] });
          }
          alert("Vitrine restaurada para o padrão com sucesso!");
        }
      });
    }
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

  function initAdmin() {
    var projects = loadProjects();
    updateStats(projects);
    renderProjectsList(projects);
    initModal();
    initTools();
    syncFromD1();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLogin();
    checkAuth();
  });
})();
