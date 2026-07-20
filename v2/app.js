(function () {
  "use strict";

  const content = window.BIOARCHAI_CONTENT?.v2;
  const root = document.getElementById("app");
  const page = document.body.dataset.v2Page;

  if (!content || !root) {
    console.error("BioArchai V2 content failed to load.");
    return;
  }

  const { common, landing, login, workspace } = content;
  const icon = (name, className = "") =>
    `<span class="material-symbols-outlined ${className}" aria-hidden="true">${name}</span>`;
  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const setMeta = (title, description) => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = description;
  };

  const brand = (href, compact = false) => `
    <a class="brand${compact ? " brand-compact" : ""}" href="${href}" aria-label="${common.brandHomeAria}">
      <span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="brand-copy"><strong>${common.brand}</strong><small>${common.product}</small></span>
    </a>`;

  const buttonContent = (label, iconName) =>
    `<span>${label}</span>${iconName ? icon(iconName) : ""}`;

  const solutionUrl = (solution) => `login.html?solution=${encodeURIComponent(solution)}`;

  const setupReveal = () => {
    const elements = [...document.querySelectorAll(".reveal")];
    if (!elements.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6%" }
    );
    elements.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 70}ms`);
      observer.observe(element);
    });
  };

  const setupMobileMenu = () => {
    const toggle = document.querySelector("[data-mobile-menu]");
    const menu = document.querySelector("[data-mobile-menu-panel]");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? common.openNavigationAria : common.closeNavigationAria);
      menu.classList.toggle("is-open", !open);
    });
    menu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", common.openNavigationAria);
        menu.classList.remove("is-open");
      })
    );
  };

  const renderLanding = () => {
    setMeta(content.meta.landingTitle, content.meta.landingDescription);
    root.innerHTML = `
      <header class="marketing-header">
        <div class="marketing-nav">
          ${brand("./")}
          <button class="icon-button mobile-menu-button" type="button" data-mobile-menu aria-expanded="false" aria-label="${common.openNavigationAria}">${icon("menu")}</button>
          <nav class="marketing-links" data-mobile-menu-panel>
            <a href="#overview">${common.navOverview}</a>
            <a href="#solutions">${common.navSolutions}</a>
            <a href="#workflow">${common.navWorkflow}</a>
            <a href="#principles">${common.navPrinciples}</a>
          </nav>
          <div class="marketing-actions">
            <a class="quiet-link" href="../v1/" aria-label="${common.externalAria}">${common.viewV1}</a>
            <a class="button button-ghost" href="login.html">${common.signIn}</a>
            <a class="button button-primary" href="${solutionUrl("tx")}">${buttonContent(common.launchWorkspace, "arrow_forward")}</a>
          </div>
        </div>
      </header>

      <main>
        <section class="nexus-hero" id="overview">
          <canvas class="nexus-canvas" data-nexus-canvas aria-hidden="true"></canvas>
          <div class="hero-grid-overlay" aria-hidden="true"></div>
          <div class="marketing-container hero-content">
            <div class="hero-copy reveal">
              <div class="eyebrow-row"><span class="pulse-dot"></span><span>${landing.eyebrow}</span><span class="version-badge">${common.version}</span></div>
              <h1>${landing.headline}</h1>
              <p>${landing.lede}</p>
              <div class="hero-actions">
                <a class="button button-primary button-large" href="${solutionUrl("tx")}">${buttonContent(landing.primaryAction, "arrow_forward")}</a>
                <a class="button button-ghost button-large" href="#workflow">${buttonContent(landing.secondaryAction, "south")}</a>
              </div>
            </div>
            <div class="hero-map-legend reveal">
              <div class="map-legend-top"><span>${landing.heroSignalLabel}</span><strong><i></i>${landing.heroSignalStatus}</strong></div>
              <div class="map-agent-list">
                ${landing.heroSignals.map((signal, index) => `<span><b>${String(index + 1).padStart(2, "0")}</b>${signal}</span>`).join("")}
              </div>
            </div>
          </div>
          <div class="marketing-container trust-strip reveal">
            ${landing.trustItems.map((item) => `<span>${icon("check_circle")} ${item}</span>`).join("")}
          </div>
        </section>

        <section class="marketing-section solutions-section" id="solutions">
          <div class="marketing-container">
            <div class="section-intro reveal">
              <p class="section-kicker">${landing.solutionsEyebrow}</p>
              <h2>${landing.solutionsTitle}</h2>
              <p>${landing.solutionsLede}</p>
            </div>
            <div class="solution-grid">
              ${landing.solutions.map((solution, index) => `
                <article class="solution-card reveal ${solution.id === "tx" ? "is-featured" : ""}">
                  <div class="solution-card-top">
                    <span class="solution-icon">${icon(solution.icon)}</span>
                    <span class="status-label">${solution.status}</span>
                  </div>
                  <p class="card-index">0${index + 1}</p>
                  <h3>${solution.name}</h3>
                  <p class="solution-audience">${solution.audience}</p>
                  <p>${solution.description}</p>
                  <a href="${solutionUrl(solution.id)}">${solution.action}${icon("arrow_forward")}</a>
                </article>`).join("")}
            </div>
          </div>
        </section>

        <section class="marketing-section workflow-section" id="workflow">
          <div class="marketing-container">
            <div class="split-intro reveal">
              <div><p class="section-kicker">${landing.workflowEyebrow}</p><h2>${landing.workflowTitle}</h2></div>
              <p>${landing.workflowLede}</p>
            </div>
            <div class="workflow-list">
              ${landing.workflowSteps.map((step) => `
                <article class="workflow-row reveal">
                  <span class="workflow-number">${step.number}</span>
                  <h3>${step.title}</h3>
                  <p>${step.description}</p>
                  ${icon("arrow_outward")}
                </article>`).join("")}
            </div>
          </div>
        </section>

        <section class="marketing-section principles-section" id="principles">
          <div class="marketing-container principles-layout">
            <div class="principles-heading reveal">
              <p class="section-kicker">${landing.principlesEyebrow}</p>
              <h2>${landing.principlesTitle}</h2>
            </div>
            <div class="principles-grid">
              ${landing.principles.map((principle) => `
                <article class="principle-item reveal">
                  ${icon(principle.icon)}
                  <h3>${principle.title}</h3>
                  <p>${principle.description}</p>
                </article>`).join("")}
            </div>
          </div>
        </section>

        <section class="marketing-cta">
          <div class="marketing-container cta-layout reveal">
            <div><p class="section-kicker">${common.previewNote}</p><h2>${landing.ctaTitle}</h2><p>${landing.ctaLede}</p></div>
            <a class="button button-primary button-large" href="${solutionUrl("tx")}">${buttonContent(common.launchWorkspace, "arrow_forward")}</a>
          </div>
        </section>
      </main>

      <footer class="marketing-footer">
        <div class="marketing-container footer-layout">
          <div>${brand("./", true)}<p>${common.copyright}</p></div>
          <div class="footer-link-group"><strong>${landing.footerProduct}</strong>${landing.footerLinks.map((link) => `<a href="login.html">${link}</a>`).join("")}</div>
          <div class="footer-link-group"><strong>${landing.footerCompany}</strong><a href="../v1/">${common.viewV1}</a><a href="../v1/demo.html">${common.requestDemo}</a></div>
        </div>
      </footer>`;

    setupMobileMenu();
    setupReveal();
    setupNexusCanvas();
  };

  const setupNexusCanvas = () => {
    const canvas = document.querySelector("[data-nexus-canvas]");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const context = canvas.getContext("2d");
    const labels = landing.heroSignals;
    let width = 0;
    let height = 0;
    let frame = 0;
    const points = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      points.length = 0;
      const originX = width * 0.73;
      const originY = height * 0.44;
      labels.forEach((label, index) => {
        const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
        const radiusX = Math.min(width * 0.24, 360);
        const radiusY = Math.min(height * 0.29, 230);
        points.push({
          label,
          x: originX + Math.cos(angle) * radiusX,
          y: originY + Math.sin(angle) * radiusY,
          phase: index * 0.8
        });
      });
      points.push({ label: common.product, x: originX, y: originY, core: true, phase: 0 });
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const core = points[points.length - 1];
      points.slice(0, -1).forEach((point, index) => {
        const pulse = (Math.sin(frame * 0.018 + point.phase) + 1) / 2;
        context.beginPath();
        context.moveTo(core.x, core.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = `rgba(58, 200, 181, ${0.12 + pulse * 0.14})`;
        context.lineWidth = 1;
        context.stroke();

        const travel = (frame * 0.0025 + index / labels.length) % 1;
        const signalX = point.x + (core.x - point.x) * travel;
        const signalY = point.y + (core.y - point.y) * travel;
        context.beginPath();
        context.arc(signalX, signalY, 2.2, 0, Math.PI * 2);
        context.fillStyle = "rgba(90, 232, 211, 0.9)";
        context.fill();

        context.beginPath();
        context.arc(point.x, point.y, 6 + pulse * 2, 0, Math.PI * 2);
        context.fillStyle = "rgba(8, 20, 29, 0.92)";
        context.fill();
        context.strokeStyle = "rgba(97, 221, 204, 0.7)";
        context.stroke();
        context.fillStyle = "rgba(215, 235, 235, 0.72)";
        context.font = "500 12px Inter, system-ui, sans-serif";
        context.textAlign = point.x < core.x ? "right" : "left";
        context.fillText(point.label, point.x + (point.x < core.x ? -14 : 14), point.y + 4);
      });

      const corePulse = (Math.sin(frame * 0.02) + 1) / 2;
      const gradient = context.createRadialGradient(core.x, core.y, 0, core.x, core.y, 55 + corePulse * 8);
      gradient.addColorStop(0, "rgba(74, 218, 197, 0.32)");
      gradient.addColorStop(1, "rgba(74, 218, 197, 0)");
      context.beginPath();
      context.arc(core.x, core.y, 58 + corePulse * 8, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();
      context.beginPath();
      context.arc(core.x, core.y, 17, 0, Math.PI * 2);
      context.fillStyle = "rgba(10, 35, 42, 0.98)";
      context.fill();
      context.strokeStyle = "rgba(105, 234, 214, 0.92)";
      context.lineWidth = 1.5;
      context.stroke();
      context.fillStyle = "rgba(232, 255, 251, 0.9)";
      context.font = "600 11px Inter, system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText(common.nexusCoreLabel, core.x, core.y + 4);
      frame += 1;
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) draw();
    else requestAnimationFrame(draw);
  };

  const renderLogin = () => {
    setMeta(content.meta.loginTitle, content.meta.loginDescription);
    root.innerHTML = `
      <main class="login-page">
        <div class="login-topbar">${brand("./")}<a href="./">${icon("arrow_back")}<span>${login.returnToSite}</span></a></div>
        <div class="login-layout">
          <section class="login-form-panel">
            <div class="login-form-wrap">
              <p class="section-kicker">${login.eyebrow}</p>
              <h1>${login.title}</h1>
              <p class="login-lede">${login.lede}</p>
              <div class="demo-access-note">${icon("info")}<span>${login.noCredentials}</span></div>
              <form data-login-form novalidate>
                <label class="field"><span>${login.emailLabel}</span><input type="email" autocomplete="email" placeholder="${login.emailPlaceholder}"></label>
                <label class="field"><span>${login.passwordLabel}</span><input type="password" autocomplete="current-password" placeholder="${login.passwordPlaceholder}"></label>
                <div class="login-options"><label class="check-field"><input type="checkbox" checked><span>${login.remember}</span></label><button type="button" class="text-button">${login.forgot}</button></div>
                <button class="button button-primary button-full button-large" type="submit" data-login-submit>${buttonContent(login.submit, "arrow_forward")}</button>
              </form>
              <div class="login-divider"><span>${login.or}</span></div>
              <div class="sso-grid">
                <button type="button" data-demo-sso><span class="sso-mark">G</span>${login.ssoGoogle}</button>
                <button type="button" data-demo-sso><span class="sso-mark">M</span>${login.ssoMicrosoft}</button>
                <button type="button" data-demo-sso><span class="sso-mark">O</span>${login.ssoOkta}</button>
              </div>
              <p class="login-disclaimer">${common.demoDisclaimer}</p>
            </div>
          </section>
          <aside class="login-context-panel">
            <div class="login-context-inner">
              <p class="section-kicker">${login.panelEyebrow}</p>
              <h2>${login.panelTitle}</h2>
              <ol>${login.panelItems.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${item}</p></li>`).join("")}</ol>
            </div>
            <div class="login-network" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          </aside>
        </div>
      </main>`;

    const submit = () => {
      const button = document.querySelector("[data-login-submit]");
      if (button) {
        button.disabled = true;
        button.innerHTML = `${icon("progress_activity", "spin")}<span>${login.sessionMessage}</span>`;
      }
      const params = new URLSearchParams(window.location.search);
      localStorage.setItem("bioarchai-v2-session", "demo");
      localStorage.setItem("bioarchai-v2-solution", params.get("solution") || "tx");
      window.setTimeout(() => window.location.assign("workspace.html#overview"), 550);
    };
    document.querySelector("[data-login-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      submit();
    });
    document.querySelectorAll("[data-demo-sso]").forEach((button) => button.addEventListener("click", submit));
  };

  const appState = {
    activeView: "overview",
    activeReport: "strategy",
    acceptedCards: new Set(workspace.evidence.cards.filter((card) => card.accepted).map((card) => card.id)),
    weights: Object.fromEntries(workspace.scoring.dimensions.map((dimension) => [dimension.id, dimension.weight])),
    defaultWeights: Object.fromEntries(workspace.scoring.dimensions.map((dimension) => [dimension.id, dimension.weight])),
    chatMessages: [],
    agentRunTimer: null
  };

  const renderWorkspaceShell = () => {
    setMeta(content.meta.workspaceTitle, content.meta.workspaceDescription);
    root.innerHTML = `
      <div class="app-shell">
        <aside class="app-sidebar" data-app-sidebar>
          <div class="sidebar-brand-row">${brand("./", true)}<span>${common.version}</span></div>
          <div class="workspace-switcher">
            <span class="workspace-switcher-icon">${workspace.workspaceInitials}</span>
            <div><small>${common.active}</small><strong>${workspace.workspaceName}</strong></div>
            ${icon("unfold_more")}
          </div>
          <nav class="app-nav" aria-label="${common.workspaceNavigationAria}">
            ${workspace.nav.map((item) => `<button type="button" data-view-target="${item.id}">${icon(item.icon)}<span>${item.label}</span></button>`).join("")}
          </nav>
          <div class="sidebar-bottom">
            <p>${common.demoDisclaimer}</p>
            <a href="../v1/">${icon("history")}<span>${common.viewV1}</span></a>
          </div>
        </aside>

        <div class="app-main">
          <header class="app-topbar">
            <button class="icon-button app-menu-button" type="button" data-app-menu aria-label="${common.openNavigationAria}">${icon("menu")}</button>
            <div class="project-context"><span>${workspace.breadcrumb}</span><strong>${workspace.projectName}</strong></div>
            <div class="topbar-actions">
              <button class="copilot-shortcut" type="button" data-view-target="copilot" aria-label="${workspace.copilot.title}">${icon("auto_awesome")}<span>${workspace.copilot.title}</span></button>
              <button class="icon-button notification-button" type="button" aria-label="${common.notificationsAria}">${icon("notifications")}<b>${workspace.notificationCount}</b></button>
              <button class="account-button" type="button" aria-label="${common.accountMenuAria}"><span>${workspace.accountInitials}</span><div><strong>${workspace.accountName}</strong><small>${workspace.accountRole}</small></div>${icon("expand_more")}</button>
              <button class="icon-button signout-button" type="button" data-signout title="${workspace.signOut}">${icon("logout")}</button>
            </div>
          </header>
          <main class="workspace-content" data-workspace-content></main>
        </div>
      </div>
      <div class="toast-region" aria-live="polite" data-toast-region></div>`;

    document.querySelectorAll("[data-view-target]").forEach((button) =>
      button.addEventListener("click", () => setWorkspaceView(button.dataset.viewTarget))
    );
    document.querySelector("[data-signout]")?.addEventListener("click", () => {
      localStorage.removeItem("bioarchai-v2-session");
      window.location.assign("login.html");
    });
    document.querySelector("[data-app-menu]")?.addEventListener("click", () => {
      document.querySelector("[data-app-sidebar]")?.classList.toggle("is-open");
    });

    const hashView = window.location.hash.replace("#", "");
    setWorkspaceView(workspace.nav.some((item) => item.id === hashView) ? hashView : "overview", false);
  };

  const setWorkspaceView = (view, updateHash = true) => {
    if (!workspace.nav.some((item) => item.id === view)) view = "overview";
    appState.activeView = view;
    if (updateHash) history.replaceState(null, "", `#${view}`);
    document.querySelectorAll("[data-view-target]").forEach((button) => button.classList.toggle("is-active", button.dataset.viewTarget === view));
    document.querySelector("[data-app-sidebar]")?.classList.remove("is-open");
    const contentRoot = document.querySelector("[data-workspace-content]");
    if (!contentRoot) return;
    const renderers = {
      overview: renderOverviewView,
      setup: renderSetupView,
      agents: renderAgentsView,
      evidence: renderEvidenceView,
      graph: renderGraphView,
      scoring: renderScoringView,
      copilot: renderCopilotView
    };
    contentRoot.innerHTML = renderers[view]();
    bindViewInteractions(view);
    contentRoot.scrollTo({ top: 0, behavior: "instant" });
  };

  const viewHeader = (eyebrow, title, lede, actions = "") => `
    <div class="workspace-view-header">
      <div><p class="workspace-eyebrow">${eyebrow}</p><h1>${title}</h1><p>${lede}</p></div>
      ${actions ? `<div class="view-header-actions">${actions}</div>` : ""}
    </div>`;

  const projectStrip = () => `
    <div class="project-strip">
      <span><small>${common.status}</small><strong><i></i>${workspace.projectStatus}</strong></span>
      <span><small>${common.version}</small><strong>${workspace.projectVersion}</strong></span>
      <span><small>${workspace.projectCode}</small><strong>${workspace.projectUpdated}</strong></span>
      <span><small>${workspace.projectOwner}</small><strong>${workspace.projectName}</strong></span>
    </div>`;

  const renderOverviewView = () => {
    const data = workspace.overview;
    return `
      ${viewHeader(data.eyebrow, data.title, data.lede, `<button class="button button-primary" type="button" data-overview-resume>${buttonContent(data.resume, "arrow_forward")}</button><button class="button button-secondary" type="button" data-overview-copilot>${buttonContent(data.askCopilot, "auto_awesome")}</button>`)}
      ${projectStrip()}
      <section class="metric-grid">
        ${data.metrics.map((metric) => `<article class="metric-card"><span>${icon(metric.icon)}</span><div><small>${metric.label}</small><strong>${metric.value}</strong><p>${metric.detail}</p></div></article>`).join("")}
      </section>
      <div class="overview-columns">
        <section class="workspace-panel activity-panel"><div class="panel-heading"><h2>${data.activityTitle}</h2><button class="icon-button" type="button" aria-label="${common.moreActionsAria}">${icon("more_horiz")}</button></div><div class="activity-list">${data.activity.map((item) => `<article><span>${item.time}</span><div><strong>${item.title}</strong><p>${item.detail}</p></div></article>`).join("")}</div></section>
        <section class="workspace-panel attention-panel"><div class="panel-heading"><h2>${data.attentionTitle}</h2><span class="count-badge">${data.attention.length}</span></div>${data.attention.map((item) => `<article><span class="severity-badge">${item.severity}</span><h3>${item.title}</h3><p>${item.detail}</p><button class="text-action" type="button" data-attention-action>${item.action}${icon("arrow_forward")}</button></article>`).join("")}</section>
      </div>`;
  };

  const renderSetupView = () => {
    const data = workspace.setup;
    return `
      ${viewHeader(data.eyebrow, data.title, data.lede, `<button class="button button-secondary" type="button" data-use-sample>${buttonContent(data.sampleAction, "auto_fix_high")}</button>`)}
      <div class="setup-layout">
        <form class="workspace-panel setup-form" data-setup-form novalidate>
          <div class="form-section-heading"><h2>${data.sectionRequired}</h2><span>${common.required}</span></div>
          <div class="form-grid two-column">
            <label class="field"><span>${data.drugLabel}<b>${common.required}</b></span><input name="drug" placeholder="${data.drugPlaceholder}"></label>
            <label class="field"><span>${data.indicationLabel}<b>${common.required}</b></span><input name="indication" placeholder="${data.indicationPlaceholder}"></label>
          </div>
          <div class="form-section-heading secondary-heading"><h2>${data.sectionOptional}</h2><span>${common.optional}</span></div>
          <div class="form-grid two-column">
            <label class="field"><span>${data.phaseLabel}</span><select name="phase">${data.phaseOptions.map((option) => `<option>${option}</option>`).join("")}</select></label>
            <label class="field"><span>${data.lineLabel}</span><input name="line" placeholder="${data.linePlaceholder}"></label>
            <label class="field"><span>${data.subtypeLabel}</span><input name="subtype" placeholder="${data.subtypePlaceholder}"></label>
            <label class="field"><span>${data.biologyLabel}</span><input name="biology" placeholder="${data.biologyPlaceholder}"></label>
            <label class="field field-full"><span>${data.contextLabel}</span><textarea name="context" rows="4" placeholder="${data.contextPlaceholder}"></textarea></label>
          </div>
          <p class="form-error" data-setup-error hidden>${data.requiredError}</p>
          <div class="form-actions"><button class="button button-quiet" type="button" data-clear-setup>${data.clearAction}</button><button class="button button-primary" type="submit">${buttonContent(data.runAction, "arrow_forward")}</button></div>
        </form>
        <aside class="workspace-panel assumptions-panel"><span class="panel-icon">${icon("lightbulb")}</span><h2>${data.assumptionsTitle}</h2><ol>${data.assumptions.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${item}</p></li>`).join("")}</ol></aside>
      </div>`;
  };

  const renderAgentsView = () => {
    const data = workspace.agents;
    return `
      ${viewHeader(data.eyebrow, data.title, data.lede, `<button class="button button-primary" type="button" data-run-agents>${buttonContent(data.runAction, "play_arrow")}</button>`)}
      <div class="agent-progress workspace-panel" data-agent-progress><div><span>${data.progressReady}</span><strong>100%</strong></div><div class="progress-track"><i style="width:100%"></i></div></div>
      <section class="agent-grid">
        ${data.items.map((agent) => `
          <article class="agent-card tone-${agent.tone}" data-agent-id="${agent.id}">
            <div class="agent-card-top"><span class="agent-order">${agent.order}</span><span class="agent-status is-complete" data-agent-status>${icon("check_circle")}<b>${agent.status}</b></span></div>
            <h2>${agent.name}</h2>
            <div class="agent-resources"><strong>${data.sourceLabel}</strong><ul>${agent.resources.map((resource) => `<li>${resource}</li>`).join("")}</ul></div>
            <button class="text-action" type="button" data-agent-report="${agent.id}">${common.viewReport}${icon("arrow_forward")}</button>
          </article>`).join("")}
      </section>`;
  };

  const renderEvidenceView = () => {
    const data = workspace.evidence;
    return `
      ${viewHeader(data.eyebrow, data.title, data.lede, `<button class="button button-secondary" type="button" data-evidence-graph>${buttonContent(workspace.graph.title, "account_tree")}</button><button class="button button-primary" type="button" data-generate-report>${buttonContent(data.generateReport, "description")}</button>`)}
      <div class="report-workspace workspace-panel">
        <div class="report-tabs" role="tablist">${data.tabs.map((tab) => `<button type="button" role="tab" data-report-tab="${tab.id}">${tab.label}</button>`).join("")}</div>
        <div class="report-content" data-report-content></div>
      </div>`;
  };

  const renderReportPanel = (reportId) => {
    const data = workspace.evidence;
    if (reportId === "final") return renderFinalReportPanel();
    if (reportId === "scoring") return renderScoringShortcutPanel();
    const report = data.reports[reportId] || data.reports.strategy;
    const showDefinition = reportId === "assay" || reportId === "strategy";
    const showRoles = reportId === "biology" || reportId === "strategy";
    return `
      <section class="agent-report-panel">
        <div class="report-summary"><div><p class="workspace-eyebrow">${workspace.projectVersion}</p><h2>${report.title}</h2><p>${report.summary}</p></div><div class="report-stat-grid">${report.stats.map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`).join("")}</div></div>
        <div class="report-section-heading"><div><h3>${data.cardsTitle}</h3><p>${data.cardsDescription}</p></div></div>
        <div class="evidence-card-list">${data.cards.map((card) => {
          const accepted = appState.acceptedCards.has(card.id);
          return `<article class="evidence-card ${accepted ? "is-accepted" : ""}"><div class="evidence-card-meta"><span>${card.source}</span><span>${card.date}</span><span class="confidence-badge">${card.confidence}</span></div><p>${card.claim}</p><div class="evidence-card-footer"><strong>${card.biomarker}</strong><button type="button" data-evidence-toggle="${card.id}">${icon(accepted ? "check" : "add")}<span>${accepted ? data.addedToReport : data.addToReport}</span></button></div></article>`;
        }).join("")}</div>
        ${showDefinition ? `<section class="report-detail-section"><h3>${data.definitionTitle}</h3><div class="definition-table">${data.definitionRows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div></section>` : ""}
        ${showRoles ? `<section class="report-detail-section"><h3>${data.rolesTitle}</h3><div class="role-grid">${data.roles.map((role) => `<article class="role-item ${role.status === common.inactive ? "is-inactive" : ""}"><div><strong>${role.name}</strong><span>${role.status}</span></div><p>${role.detail}</p></article>`).join("")}</div></section>` : ""}
      </section>`;
  };

  const renderFinalReportPanel = () => {
    const data = workspace.evidence;
    return `
      <section class="final-report-panel">
        <div class="final-report-toolbar"><div><p class="workspace-eyebrow">${data.finalVersion}</p><h2>${data.finalTitle}</h2><span class="draft-badge">${data.finalStatus}</span></div><div><button class="button button-secondary" type="button" data-comment-report>${buttonContent(data.commentAction, "add_comment")}</button><button class="button button-secondary" type="button" data-share-report>${buttonContent(data.shareAction, "ios_share")}</button></div></div>
        <div class="final-report-layout"><article class="report-document">${data.finalSections.map((section, index) => `<section><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${section.title}</h3><p>${section.body}</p></div></section>`).join("")}</article><aside class="export-panel"><span class="panel-icon">${icon("description")}</span><h3>${data.generateReport}</h3><p>${common.demoDisclaimer}</p><button class="button button-primary button-full" type="button" data-export-pdf>${buttonContent(data.exportPdf, "picture_as_pdf")}</button><a class="button button-secondary button-full" href="${buildWordReportHref()}" download="${data.wordFilename}" data-export-word>${buttonContent(data.exportWord, "download")}</a><p class="generated-status" data-generated-status hidden>${data.generatedMessage}</p></aside></div>
      </section>`;
  };

  const renderScoringShortcutPanel = () => `
    <section class="scoring-shortcut-panel">
      <span class="panel-icon">${icon("tune")}</span>
      <p class="workspace-eyebrow">${workspace.scoring.eyebrow}</p>
      <h2>${workspace.scoring.title}</h2>
      <p>${workspace.scoring.lede}</p>
      <div class="score-preview-row"><span><small>${workspace.scoring.baselineTitle}</small><strong>${workspace.scoring.defaultScore}</strong><b>${workspace.scoring.recommendation}</b></span><span>${icon("compare_arrows")}</span><span><small>${workspace.scoring.customTitle}</small><strong>${workspace.scoring.customScore}</strong><b>${workspace.scoring.delta}</b></span></div>
      <button class="button button-primary" type="button" data-open-scoring>${buttonContent(workspace.scoring.title, "arrow_forward")}</button>
    </section>`;

  const renderGraphView = () => {
    const data = workspace.graph;
    return `
      ${viewHeader(data.eyebrow, data.title, data.lede, `<button class="button button-secondary" type="button" data-graph-snapshot>${buttonContent(data.addSnapshot, "add_photo_alternate")}</button><button class="button button-primary" type="button" data-export-relationships>${buttonContent(data.exportRelationships, "download")}</button>`)}
      <div class="graph-toolbar workspace-panel"><span>${data.filterLabel}</span>${data.filters.map((filter, index) => `<button type="button" class="${index === 0 ? "is-active" : ""}">${filter}</button>`).join("")}</div>
      <div class="graph-layout">
        <section class="evidence-graph workspace-panel">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${data.edges.map((edge) => {
            const from = data.nodes.find((node) => node.id === edge.from);
            const to = data.nodes.find((node) => node.id === edge.to);
            return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
          }).join("")}</svg>
          ${data.nodes.map((node) => `<button class="graph-node tone-${node.tone}" type="button" data-graph-node="${node.id}" style="--x:${node.x}%;--y:${node.y}%"><span>${node.type}</span><strong>${node.label}</strong></button>`).join("")}
          ${data.edges.map((edge) => {
            const from = data.nodes.find((node) => node.id === edge.from);
            const to = data.nodes.find((node) => node.id === edge.to);
            const x = (from.x + to.x) / 2;
            const y = (from.y + to.y) / 2;
            return `<button class="graph-edge-label" type="button" data-graph-edge="${edge.id}" style="--x:${x}%;--y:${y}%">${edge.label}</button>`;
          }).join("")}
        </section>
        <aside class="graph-detail workspace-panel" data-graph-detail><span class="panel-icon">${icon("touch_app")}</span><p>${data.detailPlaceholder}</p></aside>
      </div>`;
  };

  const renderScoringView = () => {
    const data = workspace.scoring;
    const total = Object.values(appState.weights).reduce((sum, weight) => sum + Number(weight), 0);
    const changed = Object.keys(appState.weights).some((key) => appState.weights[key] !== appState.defaultWeights[key]);
    return `
      ${viewHeader(data.eyebrow, data.title, data.lede, `<button class="button button-secondary" type="button" data-restore-weights>${buttonContent(data.restore, "restart_alt")}</button><button class="button button-primary" type="button" data-save-scoring>${buttonContent(data.saveTemplate, "save")}</button>`)}
      <div class="score-comparison">
        <article class="score-summary workspace-panel"><span>${data.baselineTitle}</span><strong>${data.defaultScore}</strong><p>${data.recommendation}</p></article>
        <span class="score-compare-icon">${icon("compare_arrows")}</span>
        <article class="score-summary workspace-panel is-custom"><span>${data.customTitle}</span><strong data-custom-score>${changed ? data.adjustedScore : data.customScore}</strong><p data-score-delta>${changed ? data.adjustedDelta : data.delta}</p></article>
      </div>
      <div class="scoring-layout">
        <section class="workspace-panel weight-panel">
          <label class="field preset-field"><span>${data.presetLabel}</span><select data-score-preset>${data.presets.map((preset) => `<option>${preset}</option>`).join("")}</select></label>
          <div class="weight-heading"><h2>${data.weightsTitle}</h2><span class="total-weight ${total === 100 ? "is-valid" : "is-invalid"}" data-total-weight><b>${data.totalLabel}</b><strong>${total}%</strong><small>${total === 100 ? data.totalValid : data.totalInvalid}</small></span></div>
          <div class="weight-list">${data.dimensions.map((dimension) => {
            const value = appState.weights[dimension.id];
            return `<label class="weight-row"><span>${dimension.label}</span><input type="range" min="0" max="40" step="5" value="${value}" data-weight-range="${dimension.id}"><input type="number" min="0" max="100" step="5" value="${value}" data-weight-number="${dimension.id}"><b>%</b></label>`;
          }).join("")}</div>
          <label class="field rationale-field"><span>${data.rationaleLabel}</span><textarea rows="4" placeholder="${data.rationalePlaceholder}" data-score-rationale></textarea></label>
          <p class="form-error" data-score-error hidden></p>
        </section>
        <aside class="scoring-side">
          <section class="workspace-panel gate-panel"><div class="panel-heading"><h2>${data.gatesTitle}</h2>${icon("shield")}</div>${data.gates.map((gate) => `<article><div><h3>${gate.title}</h3><span>${gate.level}</span></div><p>${gate.rule}</p><label class="switch-control"><input type="checkbox" checked aria-label="${gate.title}"><span></span></label></article>`).join("")}</section>
          <section class="workspace-panel audit-panel"><h2>${data.auditTitle}</h2>${data.auditRows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}<div class="audit-actions"><button class="button button-quiet" type="button">${data.duplicate}</button><button class="button button-quiet" type="button">${data.lock}</button></div></section>
        </aside>
      </div>`;
  };

  const renderCopilotView = () => {
    const data = workspace.copilot;
    return `
      ${viewHeader(data.eyebrow, data.title, data.lede, `<label class="model-select"><span>${data.modelLabel}</span><select data-copilot-model>${data.models.map((model) => `<option>${model}</option>`).join("")}</select></label>`)}
      <div class="copilot-layout workspace-panel">
        <aside class="conversation-sidebar"><button class="button button-secondary button-full" type="button" data-new-chat>${buttonContent(data.newConversation, "add")}</button><h2>${data.historyTitle}</h2><nav>${data.history.map((item, index) => `<button type="button" class="${index === 0 ? "is-active" : ""}">${icon("chat_bubble")}<span>${item}</span></button>`).join("")}</nav><p>${common.demoDisclaimer}</p></aside>
        <section class="chat-main">
          <div class="chat-scroll" data-chat-scroll>
            ${appState.chatMessages.length ? renderChatMessages() : `<div class="chat-welcome"><span class="copilot-mark">${icon("auto_awesome")}</span><h2>${data.welcomeTitle}</h2><p>${data.welcomeBody}</p><span>${data.suggestedLabel}</span><div class="suggestion-grid">${data.suggestions.map((suggestion) => `<button type="button" data-chat-suggestion="${escapeHtml(suggestion)}">${suggestion}${icon("north_west")}</button>`).join("")}</div></div>`}
          </div>
          <form class="chat-composer" data-chat-form><textarea rows="1" placeholder="${data.inputPlaceholder}" data-chat-input></textarea><button class="icon-button send-button" type="submit" aria-label="${data.send}">${icon("arrow_upward")}</button></form>
        </section>
      </div>`;
  };

  const renderChatMessages = () => {
    const data = workspace.copilot;
    return `<div class="message-list">${appState.chatMessages.map((message) => {
      if (message.type === "user") return `<article class="chat-message is-user"><div class="message-avatar">${workspace.accountInitials}</div><div><strong>${data.userLabel}</strong><p>${escapeHtml(message.body)}</p></div></article>`;
      if (message.type === "thinking") return `<article class="chat-message is-assistant"><div class="message-avatar">${icon("auto_awesome")}</div><div><strong>${data.assistantLabel}</strong><p class="thinking-line">${icon("progress_activity", "spin")}<span>${data.thinking}</span></p></div></article>`;
      return `<article class="chat-message is-assistant"><div class="message-avatar">${icon("auto_awesome")}</div><div class="assistant-response"><div class="response-heading"><strong>${data.assistantLabel}</strong><span>${message.response.confidence}</span></div><h3>${message.response.title}</h3><p>${message.response.body}</p><div class="response-sources"><span>${data.sourcesLabel}</span>${message.response.sources.map((source) => `<b>${icon("description")}${source}</b>`).join("")}</div><small>${data.responseDisclaimer}</small></div></article>`;
    }).join("")}</div>`;
  };

  const bindViewInteractions = (view) => {
    const bindings = {
      overview: bindOverview,
      setup: bindSetup,
      agents: bindAgents,
      evidence: bindEvidence,
      graph: bindGraph,
      scoring: bindScoring,
      copilot: bindCopilot
    };
    bindings[view]?.();
  };

  const bindOverview = () => {
    document.querySelector("[data-overview-resume]")?.addEventListener("click", () => setWorkspaceView("evidence"));
    document.querySelector("[data-overview-copilot]")?.addEventListener("click", () => setWorkspaceView("copilot"));
    document.querySelectorAll("[data-attention-action]").forEach((button) => button.addEventListener("click", () => setWorkspaceView("evidence")));
  };

  const bindSetup = () => {
    const form = document.querySelector("[data-setup-form]");
    const data = workspace.setup;
    document.querySelector("[data-use-sample]")?.addEventListener("click", () => {
      form.elements.drug.value = data.sampleDrug;
      form.elements.indication.value = data.sampleIndication;
      form.elements.phase.value = data.samplePhase;
      form.elements.line.value = data.sampleLine;
      form.elements.subtype.value = data.sampleSubtype;
      form.elements.biology.value = data.sampleBiology;
      form.elements.context.value = data.sampleContext;
    });
    document.querySelector("[data-clear-setup]")?.addEventListener("click", () => {
      form.reset();
      document.querySelector("[data-setup-error]").hidden = true;
    });
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const valid = form.elements.drug.value.trim() && form.elements.indication.value.trim();
      const error = document.querySelector("[data-setup-error]");
      error.hidden = Boolean(valid);
      if (!valid) return;
      showToast(workspace.toasts.projectCreated);
      window.setTimeout(() => setWorkspaceView("agents"), 450);
    });
  };

  const bindAgents = () => {
    document.querySelectorAll("[data-agent-report]").forEach((button) => button.addEventListener("click", () => {
      appState.activeReport = button.dataset.agentReport;
      setWorkspaceView("evidence");
    }));
    document.querySelector("[data-run-agents]")?.addEventListener("click", runAgentDemo);
  };

  const runAgentDemo = () => {
    if (appState.agentRunTimer) window.clearInterval(appState.agentRunTimer);
    const cards = [...document.querySelectorAll("[data-agent-id]")];
    const progress = document.querySelector("[data-agent-progress]");
    cards.forEach((card, index) => {
      const status = card.querySelector("[data-agent-status]");
      status.className = "agent-status is-queued";
      status.innerHTML = `${icon("schedule")}<b>${common.queued}</b>`;
      if (index === 0) {
        status.className = "agent-status is-running";
        status.innerHTML = `${icon("progress_activity", "spin")}<b>${common.running}</b>`;
      }
    });
    progress.innerHTML = `<div><span>${workspace.agents.progressRunning}</span><strong>0%</strong></div><div class="progress-track"><i style="width:0%"></i></div>`;
    let completed = 0;
    appState.agentRunTimer = window.setInterval(() => {
      const current = cards[completed];
      if (current) {
        const status = current.querySelector("[data-agent-status]");
        status.className = "agent-status is-complete";
        status.innerHTML = `${icon("check_circle")}<b>${common.complete}</b>`;
      }
      completed += 1;
      const next = cards[completed];
      if (next) {
        const status = next.querySelector("[data-agent-status]");
        status.className = "agent-status is-running";
        status.innerHTML = `${icon("progress_activity", "spin")}<b>${common.running}</b>`;
      }
      const percent = Math.min(Math.round((completed / cards.length) * 100), 100);
      progress.querySelector("strong").textContent = `${percent}%`;
      progress.querySelector("i").style.width = `${percent}%`;
      if (completed >= cards.length) {
        window.clearInterval(appState.agentRunTimer);
        appState.agentRunTimer = null;
        progress.querySelector("span").textContent = workspace.agents.progressComplete;
        showToast(workspace.toasts.agentsComplete);
      }
    }, 520);
  };

  const bindEvidence = () => {
    document.querySelectorAll("[data-report-tab]").forEach((button) => button.addEventListener("click", () => {
      const tab = button.dataset.reportTab;
      if (tab === "scoring") {
        setWorkspaceView("scoring");
        return;
      }
      appState.activeReport = tab;
      updateReportPanel();
    }));
    document.querySelector("[data-evidence-graph]")?.addEventListener("click", () => setWorkspaceView("graph"));
    document.querySelector("[data-generate-report]")?.addEventListener("click", () => {
      appState.activeReport = "final";
      updateReportPanel();
      const status = document.querySelector("[data-generated-status]");
      if (status) status.hidden = false;
    });
    updateReportPanel();
  };

  const updateReportPanel = () => {
    document.querySelectorAll("[data-report-tab]").forEach((button) => {
      const active = button.dataset.reportTab === appState.activeReport;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    const panel = document.querySelector("[data-report-content]");
    if (!panel) return;
    panel.innerHTML = renderReportPanel(appState.activeReport);
    panel.querySelectorAll("[data-evidence-toggle]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.evidenceToggle;
      if (appState.acceptedCards.has(id)) appState.acceptedCards.delete(id);
      else appState.acceptedCards.add(id);
      showToast(workspace.toasts.evidenceUpdated);
      updateReportPanel();
    }));
    panel.querySelector("[data-open-scoring]")?.addEventListener("click", () => setWorkspaceView("scoring"));
    panel.querySelector("[data-export-pdf]")?.addEventListener("click", () => window.print());
    panel.querySelector("[data-export-word]")?.addEventListener("click", () => showToast(workspace.toasts.downloadStarted));
    panel.querySelectorAll("[data-comment-report], [data-share-report]").forEach((button) => button.addEventListener("click", () => showToast(workspace.evidence.generatedMessage)));
  };

  function buildWordReportHref() {
    const data = workspace.evidence;
    const documentMarkup = `<!doctype html><html><head><meta charset="utf-8"><title>${data.finalTitle}</title></head><body><h1>${data.finalTitle}</h1><p>${data.finalVersion}</p>${data.finalSections.map((section) => `<h2>${section.title}</h2><p>${section.body}</p>`).join("")}</body></html>`;
    return `data:application/msword;charset=utf-8,${encodeURIComponent(documentMarkup)}`;
  }

  const bindGraph = () => {
    const detail = document.querySelector("[data-graph-detail]");
    const showDetail = (item, relationship = false) => {
      detail.innerHTML = `<div class="graph-detail-header"><span class="panel-icon">${icon(relationship ? "conversion_path" : "hub")}</span><span>${relationship ? common.relationship : item.type}</span></div><h2>${item.label}</h2><dl><div><dt>${common.confidence}</dt><dd>${item.confidence}</dd></div><div><dt>${common.source}</dt><dd>${item.source}</dd></div></dl><div class="graph-detail-body"><strong>${common.whyItMatters}</strong><p>${item.detail}</p></div>`;
    };
    document.querySelectorAll("[data-graph-node]").forEach((button) => button.addEventListener("click", () => {
      document.querySelectorAll(".graph-node, .graph-edge-label").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      showDetail(workspace.graph.nodes.find((node) => node.id === button.dataset.graphNode));
    }));
    document.querySelectorAll("[data-graph-edge]").forEach((button) => button.addEventListener("click", () => {
      document.querySelectorAll(".graph-node, .graph-edge-label").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      showDetail(workspace.graph.edges.find((edge) => edge.id === button.dataset.graphEdge), true);
    }));
    document.querySelector("[data-graph-snapshot]")?.addEventListener("click", () => showToast(workspace.graph.snapshotAdded));
    document.querySelector("[data-export-relationships]")?.addEventListener("click", exportRelationships);
  };

  const exportRelationships = () => {
    const header = [common.relationship, common.confidence, common.source, common.whyItMatters];
    const rows = workspace.graph.edges.map((edge) => [edge.label, edge.confidence, edge.source, edge.detail]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = workspace.graph.relationshipsFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(workspace.toasts.downloadStarted);
  };

  const [defaultPreset, phaseOnePreset, phaseTwoPreset, phaseThreePreset, diagnosticPreset] = workspace.scoring.presets;
  const scorePresets = {
    [defaultPreset]: [20, 20, 15, 15, 15, 10, 5],
    [phaseOnePreset]: [15, 15, 10, 10, 10, 25, 15],
    [phaseTwoPreset]: [25, 20, 10, 15, 20, 5, 5],
    [phaseThreePreset]: [25, 25, 20, 15, 10, 5, 0],
    [diagnosticPreset]: [15, 35, 20, 10, 10, 5, 5]
  };

  const bindScoring = () => {
    const update = (id, value) => {
      appState.weights[id] = Math.max(0, Math.min(100, Number(value) || 0));
      document.querySelector(`[data-weight-range="${id}"]`).value = appState.weights[id];
      document.querySelector(`[data-weight-number="${id}"]`).value = appState.weights[id];
      updateScoreSummary();
    };
    document.querySelectorAll("[data-weight-range]").forEach((input) => input.addEventListener("input", () => update(input.dataset.weightRange, input.value)));
    document.querySelectorAll("[data-weight-number]").forEach((input) => input.addEventListener("input", () => update(input.dataset.weightNumber, input.value)));
    document.querySelector("[data-score-preset]")?.addEventListener("change", (event) => {
      const preset = scorePresets[event.target.value];
      if (!preset) return;
      workspace.scoring.dimensions.forEach((dimension, index) => update(dimension.id, preset[index]));
    });
    document.querySelector("[data-restore-weights]")?.addEventListener("click", () => {
      Object.entries(appState.defaultWeights).forEach(([id, value]) => update(id, value));
      document.querySelector("[data-score-preset]").value = workspace.scoring.presets[0];
      document.querySelector("[data-score-rationale]").value = "";
    });
    document.querySelector("[data-save-scoring]")?.addEventListener("click", saveScoring);
  };

  const updateScoreSummary = () => {
    const data = workspace.scoring;
    const total = Object.values(appState.weights).reduce((sum, weight) => sum + Number(weight), 0);
    const totalElement = document.querySelector("[data-total-weight]");
    totalElement.classList.toggle("is-valid", total === 100);
    totalElement.classList.toggle("is-invalid", total !== 100);
    totalElement.querySelector("strong").textContent = `${total}%`;
    totalElement.querySelector("small").textContent = total === 100 ? data.totalValid : data.totalInvalid;
    const changed = Object.keys(appState.weights).some((key) => appState.weights[key] !== appState.defaultWeights[key]);
    document.querySelector("[data-custom-score]").textContent = changed ? data.adjustedScore : data.customScore;
    document.querySelector("[data-score-delta]").textContent = changed ? data.adjustedDelta : data.delta;
  };

  const saveScoring = () => {
    const data = workspace.scoring;
    const total = Object.values(appState.weights).reduce((sum, weight) => sum + Number(weight), 0);
    const changed = Object.keys(appState.weights).some((key) => appState.weights[key] !== appState.defaultWeights[key]);
    const rationale = document.querySelector("[data-score-rationale]").value.trim();
    const error = document.querySelector("[data-score-error]");
    if (total !== 100) {
      error.textContent = data.totalInvalid;
      error.hidden = false;
      return;
    }
    if (changed && !rationale) {
      error.textContent = data.rationaleRequired;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    showToast(data.savedMessage);
  };

  const bindCopilot = () => {
    const form = document.querySelector("[data-chat-form]");
    const input = document.querySelector("[data-chat-input]");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      sendChatMessage(input.value);
      input.value = "";
    });
    document.querySelectorAll("[data-chat-suggestion]").forEach((button) => button.addEventListener("click", () => sendChatMessage(button.dataset.chatSuggestion)));
    document.querySelector("[data-new-chat]")?.addEventListener("click", () => {
      appState.chatMessages = [];
      setWorkspaceView("copilot", false);
    });
  };

  const sendChatMessage = (value) => {
    const message = value.trim();
    if (!message) return;
    appState.chatMessages.push({ type: "user", body: message }, { type: "thinking" });
    setWorkspaceView("copilot", false);
    const scroll = document.querySelector("[data-chat-scroll]");
    scroll?.scrollTo({ top: scroll.scrollHeight, behavior: "smooth" });
    window.setTimeout(() => {
      appState.chatMessages = appState.chatMessages.filter((item) => item.type !== "thinking");
      const responses = workspace.copilot.responses;
      const normalized = message.toLowerCase();
      const matchedIndex = normalized.includes("assay") || normalized.includes("positivity")
        ? 1
        : normalized.includes("gap") || normalized.includes("phase iii")
          ? 2
          : normalized.includes("resistance")
            ? 3
            : normalized.includes("prevalence") || normalized.includes("enrollment")
              ? 4
              : normalized.includes("scor")
                ? 5
                : normalized.includes("selected") || normalized.includes("recommend")
                  ? 0
                  : Math.floor(Math.random() * responses.length);
      const response = responses[matchedIndex];
      appState.chatMessages.push({ type: "assistant", response });
      setWorkspaceView("copilot", false);
      const updatedScroll = document.querySelector("[data-chat-scroll]");
      updatedScroll?.scrollTo({ top: updatedScroll.scrollHeight, behavior: "smooth" });
    }, 850);
  };

  const showToast = (message) => {
    const region = document.querySelector("[data-toast-region]");
    if (!region) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `${icon("check_circle")}<span>${message}</span>`;
    region.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 250);
    }, 2600);
  };

  if (page === "landing") renderLanding();
  if (page === "login") renderLogin();
  if (page === "workspace") {
    if (localStorage.getItem("bioarchai-v2-session") !== "demo") {
      window.location.replace("login.html?next=workspace");
    } else {
      renderWorkspaceShell();
    }
  }
})();
