(function () {
  "use strict";

  var WA_NUMBER = "5513981343637";
  var WA_DEFAULT =
    "Olá Jamilson! Conheci a Guarujá Tec pelo site e gostaria de saber como atrair mais clientes para o meu negócio.";

  function waUrl(message) {
    return (
      "https://wa.me/" +
      WA_NUMBER +
      "?text=" +
      encodeURIComponent(message || WA_DEFAULT)
    );
  }

  document.querySelectorAll("[data-wa]").forEach(function (el) {
    var custom = el.getAttribute("data-wa-msg");
    el.setAttribute("href", waUrl(custom));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  var header = document.getElementById("site-header");
  var lastY = 0;

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    lastY = window.scrollY;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  function closeMobile() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
      document.body.classList.toggle("nav-open", !open);
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobile);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobile();
      var offset = header ? header.offsetHeight + 8 : 80;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  var helpButtons = document.querySelectorAll(".help-option");
  var helpCta = document.getElementById("help-cta");
  var helpCtaText = document.getElementById("help-cta-text");

  helpButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      helpButtons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      var msg = btn.getAttribute("data-wa-msg") || WA_DEFAULT;
      if (helpCta) {
        helpCta.setAttribute("href", waUrl(msg));
        helpCta.classList.add("is-visible");
      }
      if (helpCtaText) {
        helpCtaText.textContent = "Falar com o Jamilson";
      }
    });
  });

  document.querySelectorAll(".faq-item").forEach(function (item) {
    var button = item.querySelector(".faq-question");
    if (!button) return;
    button.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item").forEach(function (other) {
        other.classList.remove("is-open");
        var q = other.querySelector(".faq-question");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  var form = document.getElementById("lead-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.elements.nome && form.elements.nome.value.trim()) || "";
      var company =
        (form.elements.empresa && form.elements.empresa.value.trim()) || "";
      var phone =
        (form.elements.whatsapp && form.elements.whatsapp.value.trim()) || "";
      var service =
        (form.elements.servico && form.elements.servico.value) || "";
      var desc =
        (form.elements.descricao && form.elements.descricao.value.trim()) ||
        "";

      if (!name || !phone || !service) {
        form.classList.add("is-invalid");
        return;
      }

      var lines = [
        "Olá Jamilson! Conheci a Guarujá Tec pelo site e gostaria de pedir um orçamento grátis.",
        "",
        "Nome: " + name,
        company ? "Empresa: " + company : "",
        "WhatsApp: " + phone,
        "O que preciso: " + service,
        desc ? "Detalhes: " + desc : "",
      ].filter(Boolean);

      window.open(waUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Suporte a abrir o Agente IA diretamente via link ou URL (#chat ou ?chat=open)
  function openAIAgent() {
    var btn = document.getElementById("ai-agent-btn");
    var container = document.getElementById("ai-agent-frame-container");
    if (btn && container && !container.classList.contains("active")) {
      btn.click();
    }
  }

  // Qualquer link ou botão com href="#chat" ou data-open-chat abre o Agente de IA
  document.querySelectorAll('a[href="#chat"], [data-open-chat]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openAIAgent();
    });
  });

  // Abrir automaticamente se a URL tiver #chat ou ?chat=open
  if (window.location.hash === "#chat" || window.location.search.indexOf("chat=") !== -1) {
    var chatCheckTimer = setInterval(function () {
      var btn = document.getElementById("ai-agent-btn");
      if (btn) {
        openAIAgent();
        clearInterval(chatCheckTimer);
      }
    }, 250);
    setTimeout(function () { clearInterval(chatCheckTimer); }, 6000);
  }
})();
