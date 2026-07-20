const content = window.BIOARCHAI_CONTENT;

const getCopy = (path) => {
  const value = path
    .split(".")
    .reduce((current, key) => current?.[key], content);

  if (value === undefined) {
    console.error(`Missing BioArchai content key: ${path}`);
  }

  return value;
};

const hydrateCopy = () => {
  if (!content) {
    console.error("BioArchai content failed to load.");
    return;
  }

  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = getCopy(element.dataset.copy);
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      if (!attribute.name.startsWith("data-copy-")) return;

      const targetAttribute = attribute.name.slice("data-copy-".length);
      const value = getCopy(attribute.value);

      if (typeof value === "string") {
        element.setAttribute(targetAttribute, value);
      }
    });
  });
};

const validateCopyCoverage = () => {
  const uncoveredText = [];
  const walker = document.createTreeWalker(
    document.documentElement,
    NodeFilter.SHOW_TEXT
  );
  let node;

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    const value = node.nodeValue.trim();

    if (
      !value ||
      !parent ||
      ["SCRIPT", "STYLE"].includes(parent.tagName) ||
      parent.closest("[data-copy], [data-copy-generated], .material-symbols-outlined")
    ) {
      continue;
    }

    uncoveredText.push(value);
  }

  const uncoveredAttributes = [];
  document.querySelectorAll("*").forEach((element) => {
    if (element.closest("[data-copy-generated]")) return;

    ["aria-label", "placeholder"].forEach((attribute) => {
      if (
        element.getAttribute(attribute) &&
        !element.hasAttribute(`data-copy-${attribute}`)
      ) {
        uncoveredAttributes.push(`${element.tagName.toLowerCase()}[${attribute}]`);
      }
    });

    if (
      element.matches('meta[name="description"]') &&
      !element.hasAttribute("data-copy-content")
    ) {
      uncoveredAttributes.push("meta[description]");
    }

    if (
      (element.matches('a[href^="mailto:"]') ||
        element.matches('form[action^="mailto:"]')) &&
      !element.hasAttribute(
        element.matches("a") ? "data-copy-href" : "data-copy-action"
      )
    ) {
      uncoveredAttributes.push(`${element.tagName.toLowerCase()}[mailto]`);
    }
  });

  if (uncoveredText.length || uncoveredAttributes.length) {
    console.error("User-facing copy must be added to content.js.", {
      text: uncoveredText,
      attributes: uncoveredAttributes
    });
  }
};

hydrateCopy();

const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setupScrollReveal = () => {
  const revealGroups = [
    { selector: ".hero-copy", type: "left" },
    { selector: ".signal-panel", type: "right", baseDelay: 120 },
    { selector: ".page-hero-grid > *", type: "rise", step: 110 },
    { selector: ".section-header", type: "rise" },
    { selector: ".split-header > *", type: "rise", step: 90 },
    { selector: ".platform-flow > *", type: "rise", step: 95 },
    { selector: ".card-grid > *", type: "rise", step: 90 },
    { selector: ".feature-grid > *", type: "rise", step: 80 },
    { selector: ".story-grid > *", type: "rise", step: 95 },
    { selector: ".cta-band > *", type: "rise", step: 90 },
    { selector: ".final-cta-inner > *", type: "rise", step: 95 },
    { selector: ".architecture-map > *", type: "rise", step: 110 },
    { selector: ".timeline > *", type: "rise", step: 80 },
    { selector: ".profile-grid > *", type: "rise", step: 90 },
    { selector: ".news-grid > *", type: "rise", step: 90 },
    { selector: ".form-shell > *", type: "rise", step: 100 },
    { selector: ".tx-hero-grid > *", type: "rise", step: 110 },
    { selector: ".tx-workspace-shell > *", type: "rise", step: 110 },
    { selector: ".tx-route-grid > *", type: "rise", step: 85 },
    { selector: ".tx-workflow-strip > *", type: "rise", step: 65 },
    { selector: ".tx-agent-grid > *", type: "rise", step: 80 },
    { selector: ".tx-dashboard-layout > *", type: "rise", step: 95 },
    { selector: ".tx-graph-layout > *", type: "rise", step: 95 },
    { selector: ".tx-score-layout > *", type: "rise", step: 95 },
    { selector: ".mapping-table-wrap", type: "fade" },
    { selector: ".footer-grid > *", type: "rise", step: 70 }
  ];

  const revealElements = new Set();

  revealGroups.forEach(({ selector, type, baseDelay = 0, step = 0 }) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (!(element instanceof HTMLElement) || revealElements.has(element)) return;
      element.dataset.reveal = type;
      element.style.setProperty("--reveal-delay", `${baseDelay + index * step}ms`);
      revealElements.add(element);
    });
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    document.documentElement.classList.add("reduce-motion");
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  document.documentElement.classList.add("reveal-enabled");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -4% 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("open", !expanded);
  });

  siteNav.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    if (link) {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("open");
    }
  });
}

const setupTxArchaiWorkspace = () => {
  const workspace = document.querySelector("[data-tx-workspace]");
  if (!(workspace instanceof HTMLElement) || !content?.txArchai) return;

  const tx = getCopy("txArchai");
  const panels = new Map(
    [...workspace.querySelectorAll("[data-tx-panel]")].map((panel) => [
      panel.dataset.txPanel,
      panel
    ])
  );
  const stepNav = workspace.querySelector("[data-tx-step-nav]");
  const defaultWeights = Object.fromEntries(
    tx.scoring.dimensions.map((dimension) => [
      dimension.id,
      dimension.defaultWeight
    ])
  );
  const defaultThresholds = Object.fromEntries(
    tx.scoring.thresholds.map((threshold) => [threshold.id, threshold.value])
  );
  const state = {
    step: "routing",
    dashboardTab: "report-label",
    graphSelection: tx.graph.nodes[0]?.id || "",
    graphSelectionType: "node",
    weights: { ...defaultWeights },
    thresholds: { ...defaultThresholds },
    presetId: "default",
    rationale: "",
    scoringStatus: "",
    graphStatus: ""
  };

  const markGenerated = (element) => {
    element.dataset.copyGenerated = "true";
    return element;
  };

  const createElement = (tagName, options = {}) => {
    const element = document.createElement(tagName);
    const {
      className,
      text,
      attrs = {},
      dataset = {},
      children = []
    } = options;

    if (className) element.className = className;
    if (text !== undefined && text !== null) {
      element.textContent = String(text);
      markGenerated(element);
    }

    Object.entries(attrs).forEach(([name, value]) => {
      if (value === false || value === undefined || value === null) return;
      if (value === true) {
        element.setAttribute(name, "");
        return;
      }
      element.setAttribute(name, String(value));
    });

    if (attrs.placeholder || attrs["aria-label"]) {
      markGenerated(element);
    }

    Object.entries(dataset).forEach(([name, value]) => {
      element.dataset[name] = String(value);
    });

    children.forEach((child) => {
      if (child) element.append(child);
    });

    return element;
  };

  const icon = (name) =>
    createElement("span", {
      className: "material-symbols-outlined",
      text: name,
      attrs: { "aria-hidden": "true" }
    });

  const clear = (element) => element.replaceChildren();

  const renderPanelHeader = (panel, { kicker, heading, lede, actions = [] }) => {
    const header = createElement("div", { className: "tx-panel-header" });
    const copy = createElement("div");
    copy.append(
      createElement("p", { className: "kicker", text: kicker }),
      createElement("h2", { text: heading }),
      createElement("p", { text: lede })
    );
    header.append(copy);
    if (actions.length) {
      const actionRow = createElement("div", { className: "tx-panel-actions" });
      actions.forEach((action) => actionRow.append(action));
      header.append(actionRow);
    }
    panel.append(header);
  };

  const renderList = (items, className = "tx-list") => {
    const list = createElement("ul", { className });
    items.forEach((item) => {
      list.append(createElement("li", { text: item }));
    });
    return list;
  };

  const renderKeyValue = (label, value) =>
    createElement("div", {
      className: "tx-kv",
      children: [
        createElement("span", { text: label }),
        createElement("strong", { text: value })
      ]
    });

  const setStep = (stepId, shouldScroll = false) => {
    state.step = stepId;
    panels.forEach((panel, id) => {
      panel.hidden = id !== stepId;
      panel.classList.toggle("is-active", id === stepId);
    });
    panels.get(stepId)?.querySelectorAll("[data-reveal]").forEach((element) => {
      element.classList.add("is-visible");
    });
    workspace.querySelectorAll("[data-tx-nav-step]").forEach((button) => {
      const isActive = button.dataset.txNavStep === stepId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "step" : "false");
    });
    if (shouldScroll) {
      workspace.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
  };

  const renderStepNav = () => {
    if (!stepNav) return;
    clear(stepNav);
    tx.steps.forEach((step) => {
      const button = createElement("button", {
        className: "tx-step-button",
        attrs: { type: "button" },
        dataset: { txNavStep: step.id },
        children: [
          createElement("span", { className: "tx-step-index", text: step.short }),
          icon(step.icon),
          createElement("span", {
            className: "tx-step-copy",
            children: [
              createElement("strong", { text: step.label }),
              createElement("small", { text: step.status })
            ]
          })
        ]
      });
      button.addEventListener("click", () => setStep(step.id, true));
      stepNav.append(button);
    });
  };

  const renderRouting = (panel) => {
    clear(panel);
    renderPanelHeader(panel, {
      kicker: tx.routing.kicker,
      heading: tx.routing.heading,
      lede: tx.routing.lede
    });

    const grid = createElement("div", { className: "tx-route-grid" });
    tx.routing.solutionCards.forEach((card) => {
      const isTx = card.id === "tx";
      const action = createElement("button", {
        className: isTx ? "button primary" : "button secondary",
        attrs: { type: "button", disabled: !isTx },
        children: [
          createElement("span", { text: card.action }),
          icon(isTx ? "arrow_forward" : "schedule")
        ]
      });
      if (isTx) action.addEventListener("click", () => setStep("setup", true));

      grid.append(
        createElement("article", {
          className: `tx-route-card${isTx ? " is-active" : ""}`,
          children: [
            createElement("div", {
              className: "tx-card-heading",
              children: [
                icon(isTx ? "medication" : card.id === "dx" ? "troubleshoot" : "insights"),
                createElement("div", {
                  children: [
                    createElement("h3", { text: card.title }),
                    createElement("span", { className: "tx-status-pill", text: card.status })
                  ]
                })
              ]
            }),
            createElement("p", { text: card.description }),
            action
          ]
        })
      );
    });
    panel.append(grid);

    const workflow = createElement("div", { className: "tx-workflow-block" });
    workflow.append(createElement("h3", { text: tx.routing.workflowHeading }));
    const strip = createElement("div", { className: "tx-workflow-strip" });
    tx.routing.workflow.forEach((item, index) => {
      strip.append(
        createElement("div", {
          className: "tx-step-card",
          children: [
            createElement("span", { text: String(index + 1).padStart(2, "0") }),
            createElement("strong", { text: item })
          ]
        })
      );
    });
    workflow.append(strip);
    panel.append(workflow);

    const principles = createElement("div", {
      className: "tx-principle-panel",
      children: [renderList(tx.routing.principles, "tx-check-list")]
    });
    panel.append(principles);
  };

  const renderSetup = (panel) => {
    clear(panel);
    renderPanelHeader(panel, {
      kicker: tx.setup.kicker,
      heading: tx.setup.heading,
      lede: tx.setup.lede
    });

    const layout = createElement("div", { className: "tx-setup-layout" });
    const form = createElement("form", { className: "tx-setup-form", attrs: { novalidate: true } });
    const grid = createElement("div", { className: "tx-form-grid" });

    tx.setup.fields.forEach((field) => {
      const inputId = `tx-${field.id}`;
      const input = createElement("input", {
        attrs: {
          id: inputId,
          name: field.id,
          type: "text",
          placeholder: field.placeholder,
          value: field.value,
          required: field.required
        }
      });
      const badge = createElement("span", {
        className: field.required ? "tx-required" : "tx-optional",
        text: field.required ? tx.ui.required : tx.ui.optional
      });
      grid.append(
        createElement("div", {
          className: "field",
          children: [
            createElement("label", {
              attrs: { for: inputId },
              children: [createElement("span", { text: field.label }), badge]
            }),
            input,
            createElement("p", { className: "form-note", text: field.helper })
          ]
        })
      );
    });

    const status = createElement("p", { className: "form-status", text: tx.ui.allGood });
    const submit = createElement("button", {
      className: "button primary",
      attrs: { type: "submit" },
      children: [createElement("span", { text: tx.ui.startAnalysis }), icon("arrow_forward")]
    });

    form.append(grid, createElement("div", { className: "form-actions", children: [submit] }), status);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalid = tx.setup.fields
        .filter((field) => field.required)
        .some((field) => {
          const input = form.elements.namedItem(field.id);
          return input instanceof HTMLInputElement && !input.value.trim();
        });

      status.textContent = invalid ? tx.ui.missingRequired : tx.ui.allGood;
      status.classList.toggle("is-error", invalid);
      markGenerated(status);
      if (!invalid) setStep("agents", true);
    });

    const behavior = createElement("aside", { className: "tx-system-panel" });
    behavior.append(
      createElement("h3", { text: tx.setup.systemBehaviorHeading }),
      renderList(tx.setup.systemBehavior, "tx-check-list"),
      createElement("h3", { text: tx.setup.assumptionsHeading }),
      renderList(tx.setup.assumptions, "tx-token-list")
    );

    layout.append(form, behavior);
    panel.append(layout);
  };

  const renderAgents = (panel) => {
    clear(panel);
    renderPanelHeader(panel, {
      kicker: tx.steps.find((step) => step.id === "agents")?.label,
      heading: tx.steps.find((step) => step.id === "agents")?.status,
      lede: tx.routing.principles[2],
      actions: [
        createElement("button", {
          className: "button secondary",
          attrs: { type: "button" },
          children: [createElement("span", { text: tx.ui.openDashboard }), icon("dashboard")]
        })
      ]
    });
    panel.querySelector(".tx-panel-actions button")?.addEventListener("click", () => setStep("dashboard", true));

    const grid = createElement("div", { className: "tx-agent-grid" });
    tx.agents.forEach((agent) => {
      const reportButton = createElement("button", {
        className: "button secondary",
        attrs: { type: "button" },
        children: [createElement("span", { text: tx.ui.viewReport }), icon("article")]
      });
      reportButton.addEventListener("click", () => {
        state.dashboardTab = agent.tabId;
        renderDashboardContent();
        setStep("dashboard", true);
      });

      grid.append(
        createElement("article", {
          className: `tx-agent-card tx-status-${agent.statusTone}`,
          children: [
            createElement("div", {
              className: "tx-agent-topline",
              children: [
                createElement("span", { className: "tx-agent-order", text: agent.order }),
                createElement("span", { className: "tx-status-pill", text: agent.status })
              ]
            }),
            createElement("h3", { text: agent.name }),
            createElement("p", { text: agent.role }),
            createElement("div", {
              className: "tx-resource-block",
              children: [
                createElement("strong", { text: tx.ui.resources }),
                renderList(agent.resources, "tx-resource-list")
              ]
            }),
            reportButton
          ]
        })
      );
    });
    panel.append(grid);
  };

  const renderAgentReport = (container, agent) => {
    container.append(
      createElement("div", {
        className: "tx-report-header",
        children: [
          createElement("span", { className: "tx-status-pill", text: agent.evidenceFamily }),
          createElement("h3", { text: agent.reportName }),
          createElement("p", { text: agent.role })
        ]
      }),
      createElement("div", {
        className: "tx-report-grid",
        children: [
          createElement("section", {
            className: "tx-dashboard-card",
            children: [
              createElement("h4", { text: tx.ui.resources }),
              renderList(agent.resources, "tx-resource-list")
            ]
          }),
          createElement("section", {
            className: "tx-dashboard-card",
            children: [
              createElement("h4", { text: tx.ui.report }),
              renderList(agent.reportItems, "tx-check-list")
            ]
          }),
          createElement("section", {
            className: "tx-dashboard-card",
            children: [
              createElement("h4", { text: tx.ui.status }),
              renderList(agent.optionalResources, "tx-token-list")
            ]
          })
        ]
      })
    );
  };

  const renderEvidenceCards = (container) => {
    container.append(createElement("h3", { text: tx.dashboard.evidenceCardsHeading }));
    const grid = createElement("div", { className: "tx-evidence-grid" });
    tx.dashboard.evidenceCards.forEach((card) => {
      const toggle = createElement("button", {
        className: "tx-toggle-button",
        attrs: { type: "button" },
        children: [icon("add_task"), createElement("span", { text: tx.ui.addToReport })]
      });
      toggle.addEventListener("click", () => {
        const accepted = toggle.classList.toggle("is-active");
        toggle.querySelector("span:last-child").textContent = accepted ? tx.ui.accepted : tx.ui.addToReport;
        markGenerated(toggle.querySelector("span:last-child"));
      });

      grid.append(
        createElement("article", {
          className: "tx-evidence-card",
          children: [
            createElement("h4", { text: card.sourceName }),
            createElement("p", { text: card.claim }),
            renderKeyValue(tx.ui.source, card.sourceType),
            renderKeyValue(tx.ui.biomarker, card.biomarker),
            renderKeyValue(tx.ui.confidence, card.confidence),
            renderKeyValue(tx.ui.citation, card.citation),
            renderKeyValue(tx.ui.dateVersion, card.date),
            toggle
          ]
        })
      );
    });
    container.append(grid);
  };

  const renderRows = (container, heading, rows, columns) => {
    container.append(createElement("h3", { text: heading }));
    const tableWrap = createElement("div", { className: "tx-table-wrap" });
    const table = createElement("table", { className: "mapping-table tx-table" });
    const thead = createElement("thead");
    const headRow = createElement("tr");
    columns.forEach((column) => headRow.append(createElement("th", { text: column.label })));
    thead.append(headRow);
    const tbody = createElement("tbody");
    rows.forEach((row) => {
      const tr = createElement("tr");
      columns.forEach((column) => tr.append(createElement("td", { text: row[column.key] })));
      tbody.append(tr);
    });
    table.append(thead, tbody);
    tableWrap.append(table);
    container.append(tableWrap);
  };

  const renderTrialImplications = (container) => {
    container.append(createElement("h3", { text: tx.dashboard.trialImplicationsHeading }));
    const grid = createElement("div", { className: "tx-dashboard-grid" });
    tx.dashboard.trialImplications.forEach((item) => {
      grid.append(
        createElement("article", {
          className: "tx-dashboard-card",
          children: [
            createElement("h4", { text: item.phase }),
            createElement("p", { text: item.recommendation }),
            createElement("span", { className: "tx-status-pill", text: item.risk })
          ]
        })
      );
    });
    container.append(grid);
  };

  const renderRoles = (container) => {
    container.append(createElement("h3", { text: tx.dashboard.rolesHeading }));
    const grid = createElement("div", { className: "tx-role-grid" });
    tx.roleTaxonomy.forEach((role) => {
      const inactive = role.status.toLowerCase().includes("inactive");
      grid.append(
        createElement("article", {
          className: `tx-role-card${inactive ? " is-inactive" : ""}`,
          children: [
            createElement("h4", { text: role.role }),
            createElement("p", { text: role.definition }),
            createElement("span", { className: "tx-status-pill", text: role.status }),
            createElement("small", { text: role.basis })
          ]
        })
      );
    });
    container.append(grid);
  };

  const renderDashboardContent = () => {
    const panel = panels.get("dashboard");
    const contentPanel = panel?.querySelector("[data-tx-dashboard-content]");
    if (!contentPanel) return;
    clear(contentPanel);

    panel.querySelectorAll("[data-tx-dashboard-tab]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.txDashboardTab === state.dashboardTab);
    });

    const agent = tx.agents.find((item) => item.tabId === state.dashboardTab);
    if (agent) {
      renderAgentReport(contentPanel, agent);
      return;
    }

    if (state.dashboardTab === "evidence-cards") {
      renderEvidenceCards(contentPanel);
    } else if (state.dashboardTab === "prevalence-context") {
      renderRows(contentPanel, tx.dashboard.prevalenceContextHeading, tx.dashboard.prevalenceRows, [
        { key: "cohort", label: tx.ui.cohort },
        { key: "estimate", label: tx.ui.estimate },
        { key: "denominator", label: tx.ui.denominator },
        { key: "limitation", label: tx.ui.limitation }
      ]);
    } else if (state.dashboardTab === "assay-definition") {
      renderRows(contentPanel, tx.dashboard.definitionHeading, tx.dashboard.definitionRows, [
        { key: "field", label: tx.ui.uiField },
        { key: "meaning", label: tx.ui.meaning },
        { key: "example", label: tx.ui.example }
      ]);
    } else if (state.dashboardTab === "trial-design") {
      renderTrialImplications(contentPanel);
    } else if (state.dashboardTab === "gaps") {
      contentPanel.append(createElement("h3", { text: tx.dashboard.gapsHeading }), renderList(tx.dashboard.gaps, "tx-check-list"));
    } else if (state.dashboardTab === "roles") {
      renderRoles(contentPanel);
    } else if (state.dashboardTab === "scoring-tab") {
      renderScoringInner(contentPanel);
    } else if (state.dashboardTab === "final-report") {
      renderFinalInner(contentPanel);
    }
  };

  const renderDashboard = (panel) => {
    clear(panel);
    renderPanelHeader(panel, {
      kicker: tx.dashboard.kicker,
      heading: tx.dashboard.heading,
      lede: tx.dashboard.lede,
      actions: [
        createElement("button", {
          className: "button secondary",
          attrs: { type: "button" },
          children: [createElement("span", { text: tx.ui.openGraph }), icon("share")]
        }),
        createElement("button", {
          className: "button secondary",
          attrs: { type: "button" },
          children: [createElement("span", { text: tx.ui.openScoring }), icon("tune")]
        })
      ]
    });
    const [graphButton, scoringButton] = panel.querySelectorAll(".tx-panel-actions button");
    graphButton?.addEventListener("click", () => setStep("graph", true));
    scoringButton?.addEventListener("click", () => setStep("scoring", true));

    const layout = createElement("div", { className: "tx-dashboard-layout" });
    const tabs = createElement("div", { className: "tx-tab-list" });
    tx.dashboard.tabs.forEach((tab) => {
      const button = createElement("button", {
        className: "tx-tab",
        attrs: { type: "button" },
        dataset: { txDashboardTab: tab.id },
        text: tab.label
      });
      button.addEventListener("click", () => {
        state.dashboardTab = tab.id;
        renderDashboardContent();
      });
      tabs.append(button);
    });
    const contentPanel = createElement("div", { className: "tx-dashboard-content", dataset: { txDashboardContent: "" } });
    layout.append(tabs, contentPanel);
    panel.append(layout);
    renderDashboardContent();
  };

  const renderGraphDetail = () => {
    const detail = panels.get("graph")?.querySelector("[data-tx-graph-detail]");
    if (!detail) return;
    clear(detail);
    const selected =
      state.graphSelectionType === "edge"
        ? tx.graph.edges.find((edge) => edge.id === state.graphSelection)
        : tx.graph.nodes.find((node) => node.id === state.graphSelection);
    if (!selected) return;

    detail.append(
      createElement("p", { className: "eyebrow", text: tx.ui.selectedNode }),
      createElement("h3", { text: selected.label }),
      renderKeyValue(tx.ui.type, selected.type || tx.ui.relationship),
      renderKeyValue(tx.ui.confidence, selected.confidence),
      renderKeyValue(tx.ui.status, selected.status || selected.source),
      renderKeyValue(tx.ui.source, selected.source),
      createElement("p", { text: selected.detail })
    );

    const status = createElement("p", { className: "form-status", text: state.graphStatus });
    const snapshot = createElement("button", {
      className: "button secondary",
      attrs: { type: "button" },
      children: [createElement("span", { text: tx.ui.addGraphSnapshot }), icon("add_photo_alternate")]
    });
    snapshot.addEventListener("click", () => {
      state.graphStatus = tx.ui.snapshotStatus;
      status.textContent = state.graphStatus;
      markGenerated(status);
    });
    const exportButton = createElement("button", {
      className: "button secondary",
      attrs: { type: "button" },
      children: [createElement("span", { text: tx.ui.exportRelationships }), icon("download")]
    });
    exportButton.addEventListener("click", () => {
      state.graphStatus = tx.ui.graphStatus;
      status.textContent = state.graphStatus;
      markGenerated(status);
    });
    detail.append(createElement("div", { className: "form-actions", children: [snapshot, exportButton] }), status);
  };

  const renderGraph = (panel) => {
    clear(panel);
    renderPanelHeader(panel, {
      kicker: tx.graph.kicker,
      heading: tx.graph.heading,
      lede: tx.graph.lede,
      actions: [
        createElement("button", {
          className: "button secondary",
          attrs: { type: "button" },
          children: [createElement("span", { text: tx.ui.backToDashboard }), icon("dashboard")]
        })
      ]
    });
    panel.querySelector(".tx-panel-actions button")?.addEventListener("click", () => setStep("dashboard", true));

    const layout = createElement("div", { className: "tx-graph-layout" });
    const canvasPanel = createElement("div", { className: "tx-graph-canvas" });
    const filters = createElement("div", { className: "tag-row tx-filter-row" });
    tx.graph.filters.forEach((filter) => filters.append(createElement("span", { text: filter })));

    const nodeGrid = createElement("div", { className: "tx-node-grid" });
    tx.graph.nodes.forEach((node) => {
      const button = createElement("button", {
        className: "tx-node-button",
        attrs: { type: "button" },
        children: [
          createElement("span", { text: node.type }),
          createElement("strong", { text: node.label }),
          createElement("small", { text: node.meta })
        ]
      });
      button.addEventListener("click", () => {
        state.graphSelection = node.id;
        state.graphSelectionType = "node";
        renderGraphDetail();
      });
      nodeGrid.append(button);
    });

    const edgeList = createElement("div", { className: "tx-edge-list" });
    tx.graph.edges.forEach((edge) => {
      const from = tx.graph.nodes.find((node) => node.id === edge.from)?.label;
      const to = tx.graph.nodes.find((node) => node.id === edge.to)?.label;
      const button = createElement("button", {
        className: "tx-edge-button",
        attrs: { type: "button" },
        children: [
          createElement("span", { text: edge.label }),
          createElement("small", { text: `${from} -> ${to}` })
        ]
      });
      button.addEventListener("click", () => {
        state.graphSelection = edge.id;
        state.graphSelectionType = "edge";
        renderGraphDetail();
      });
      edgeList.append(button);
    });

    canvasPanel.append(filters, nodeGrid, edgeList);
    const detailPanel = createElement("aside", { className: "tx-graph-detail", dataset: { txGraphDetail: "" } });
    layout.append(canvasPanel, detailPanel);
    panel.append(layout);
    renderGraphDetail();
  };

  const calculateScore = () => {
    const total = Object.values(state.weights).reduce((sum, value) => sum + Number(value || 0), 0);
    const delta = tx.scoring.dimensions.reduce((sum, dimension) => {
      const current = Number(state.weights[dimension.id] || 0);
      return sum + (current - dimension.defaultWeight) * Number(dimension.impact || 0);
    }, 0);
    const score = Math.max(0, Math.min(100, Math.round(tx.scoring.defaultScore + delta / 5)));
    const orderedThresholds = [...tx.scoring.thresholds].sort((a, b) => b.value - a.value);
    const recommendation = orderedThresholds.find((threshold) => score >= Number(state.thresholds[threshold.id] || threshold.value));
    return {
      total,
      score,
      delta: score - tx.scoring.defaultScore,
      recommendation: recommendation?.label || tx.scoring.thresholds[tx.scoring.thresholds.length - 1]?.label
    };
  };

  const scoringChanged = () =>
    tx.scoring.dimensions.some((dimension) => Number(state.weights[dimension.id]) !== dimension.defaultWeight) ||
    tx.scoring.thresholds.some((threshold) => Number(state.thresholds[threshold.id]) !== threshold.value) ||
    state.presetId !== "default";

  const updateScoringSummary = (container) => {
    const { total, score, delta, recommendation } = calculateScore();
    const changed = scoringChanged();
    const valid = total === 100 && (!changed || state.rationale.trim());
    container.querySelectorAll("[data-tx-weight-total]").forEach((node) => {
      node.textContent = `${total}%`;
      markGenerated(node);
    });
    container.querySelectorAll("[data-tx-custom-score]").forEach((node) => {
      node.textContent = `${score}/100`;
      markGenerated(node);
    });
    container.querySelectorAll("[data-tx-score-delta]").forEach((node) => {
      node.textContent = `${delta >= 0 ? "+" : ""}${delta}`;
      markGenerated(node);
    });
    container.querySelectorAll("[data-tx-recommendation]").forEach((node) => {
      node.textContent = recommendation;
      markGenerated(node);
    });
    container.querySelectorAll("[data-tx-scoring-status]").forEach((node) => {
      node.textContent = state.scoringStatus || (total !== 100 ? tx.ui.weightsNeed100 : changed && !state.rationale.trim() ? tx.ui.rationaleRequired : tx.ui.allGood);
      node.classList.toggle("is-error", !valid);
      markGenerated(node);
    });
    container.querySelectorAll("[data-tx-save-scoring]").forEach((button) => {
      button.disabled = !valid;
    });
  };

  const setPreset = (presetId) => {
    const preset = tx.scoring.presets.find((item) => item.id === presetId);
    if (!preset) return;
    state.presetId = presetId;
    state.weights = { ...preset.weights };
    state.scoringStatus = "";
  };

  const refreshScoringViews = () => {
    renderScoring(panels.get("scoring"));
    if (state.dashboardTab === "scoring-tab") renderDashboardContent();
  };

  const renderScoringInner = (container) => {
    const scoreLayout = createElement("div", { className: "tx-score-layout" });
    const controlPanel = createElement("section", { className: "tx-score-panel" });
    const comparePanel = createElement("section", { className: "tx-score-panel tx-score-compare" });

    const presetSelect = createElement("select");
    tx.scoring.presets.forEach((preset) => {
      const option = createElement("option", { text: preset.label, attrs: { value: preset.id } });
      option.selected = preset.id === state.presetId;
      presetSelect.append(option);
    });
    presetSelect.addEventListener("change", () => {
      setPreset(presetSelect.value);
      refreshScoringViews();
    });

    const accessSelect = createElement("select");
    tx.scoring.accessLevels.forEach((level) => {
      accessSelect.append(createElement("option", { text: level, attrs: { value: level } }));
    });

    const weightList = createElement("div", { className: "tx-weight-list" });
    tx.scoring.dimensions.forEach((dimension) => {
      const slider = createElement("input", {
        attrs: { type: "range", min: 0, max: 40, step: 5, value: state.weights[dimension.id] },
        dataset: { txWeightInput: dimension.id }
      });
      const number = createElement("input", {
        attrs: { type: "number", min: 0, max: 100, step: 5, value: state.weights[dimension.id] },
        dataset: { txWeightInput: dimension.id }
      });
      const onInput = (event) => {
        const value = Number(event.target.value || 0);
        state.weights[dimension.id] = value;
        weightList.querySelectorAll(`[data-tx-weight-input="${dimension.id}"]`).forEach((input) => {
          if (input !== event.target) input.value = String(value);
        });
        state.presetId = "custom";
        state.scoringStatus = "";
        updateScoringSummary(scoreLayout);
      };
      slider.addEventListener("input", onInput);
      number.addEventListener("input", onInput);
      weightList.append(
        createElement("div", {
          className: "tx-weight-row",
          children: [
            createElement("div", {
              children: [
                createElement("strong", { text: dimension.label }),
                createElement("small", { text: dimension.agent })
              ]
            }),
            slider,
            number
          ]
        })
      );
    });

    const rationale = createElement("textarea", {
      attrs: { rows: 4 },
      dataset: { txRationale: "" }
    });
    rationale.value = state.rationale;
    rationale.addEventListener("input", () => {
      state.rationale = rationale.value;
      state.scoringStatus = "";
      updateScoringSummary(scoreLayout);
    });

    const thresholdGrid = createElement("div", { className: "tx-threshold-grid" });
    tx.scoring.thresholds.forEach((threshold) => {
      const input = createElement("input", {
        attrs: { type: "number", min: 0, max: 100, step: 5, value: state.thresholds[threshold.id] }
      });
      input.addEventListener("input", () => {
        state.thresholds[threshold.id] = Number(input.value || 0);
        state.scoringStatus = "";
        updateScoringSummary(scoreLayout);
      });
      thresholdGrid.append(
        createElement("label", {
          className: "tx-threshold-field",
          children: [createElement("span", { text: threshold.label }), input]
        })
      );
    });

    const gateList = createElement("div", { className: "tx-gate-list" });
    tx.scoring.gates.forEach((gate) => {
      gateList.append(
        createElement("article", {
          className: "tx-gate-card",
          children: [
            createElement("h4", { text: gate.label }),
            createElement("p", { text: gate.defaultRule }),
            createElement("small", { text: gate.customizable }),
            createElement("select", {
              children: [
                createElement("option", { text: tx.ui.warning, attrs: { value: "warning" } }),
                createElement("option", { text: tx.ui.hardStop, attrs: { value: "hard-stop" } })
              ]
            })
          ]
        })
      );
    });

    const save = createElement("button", {
      className: "button primary",
      attrs: { type: "button" },
      dataset: { txSaveScoring: "" },
      children: [createElement("span", { text: tx.ui.save }), icon("save")]
    });
    save.addEventListener("click", () => {
      state.scoringStatus = tx.ui.savedValid;
      updateScoringSummary(scoreLayout);
    });
    const duplicate = createElement("button", {
      className: "button secondary",
      attrs: { type: "button" },
      children: [createElement("span", { text: tx.ui.duplicate }), icon("content_copy")]
    });
    duplicate.addEventListener("click", () => {
      state.scoringStatus = tx.ui.duplicateStatus;
      updateScoringSummary(scoreLayout);
    });
    const restore = createElement("button", {
      className: "button secondary",
      attrs: { type: "button" },
      children: [createElement("span", { text: tx.ui.restoreDefault }), icon("restart_alt")]
    });
    restore.addEventListener("click", () => {
      state.weights = { ...defaultWeights };
      state.thresholds = { ...defaultThresholds };
      state.presetId = "default";
      state.rationale = "";
      state.scoringStatus = tx.ui.restoredDefault;
      refreshScoringViews();
    });
    const lock = createElement("button", {
      className: "button secondary",
      attrs: { type: "button" },
      children: [createElement("span", { text: tx.ui.lockTemplate }), icon("lock")]
    });
    lock.addEventListener("click", () => {
      state.scoringStatus = tx.ui.lockedStatus;
      updateScoringSummary(scoreLayout);
    });

    controlPanel.append(
      createElement("h3", { text: tx.scoring.customName }),
      createElement("div", {
        className: "tx-form-grid compact",
        children: [
          createElement("div", { className: "field", children: [createElement("label", { text: tx.ui.presetSelector }), presetSelect] }),
          createElement("div", { className: "field", children: [createElement("label", { text: tx.ui.roleAccess }), accessSelect] })
        ]
      }),
      createElement("h4", { text: tx.ui.weightTotal }),
      weightList,
      createElement("h4", { text: tx.ui.thresholds }),
      thresholdGrid,
      createElement("h4", { text: tx.ui.gatingRules }),
      gateList,
      createElement("div", { className: "field", children: [createElement("label", { text: tx.ui.rationale }), rationale] }),
      createElement("div", { className: "form-actions", children: [save, duplicate, restore, lock] }),
      createElement("p", { className: "form-status", dataset: { txScoringStatus: "" } })
    );

    comparePanel.append(
      createElement("h3", { text: tx.scoring.baselineName }),
      createElement("div", {
        className: "tx-score-cards",
        children: [
          createElement("article", {
            className: "tx-score-card",
            children: [
              createElement("span", { text: tx.ui.defaultScore }),
              createElement("strong", { text: `${tx.scoring.defaultScore}/100` }),
              createElement("small", { text: tx.scoring.defaultRecommendation })
            ]
          }),
          createElement("article", {
            className: "tx-score-card is-custom",
            children: [
              createElement("span", { text: tx.ui.customScore }),
              createElement("strong", { dataset: { txCustomScore: "" }, text: "" }),
              createElement("small", { dataset: { txRecommendation: "" }, text: "" })
            ]
          }),
          createElement("article", {
            className: "tx-score-card",
            children: [
              createElement("span", { text: tx.ui.weightTotal }),
              createElement("strong", { dataset: { txWeightTotal: "" }, text: "" }),
              createElement("small", { text: tx.ui.scoreDelta }),
              createElement("small", { dataset: { txScoreDelta: "" }, text: "" })
            ]
          })
        ]
      }),
      createElement("h4", { text: tx.ui.auditTrail }),
      renderList(tx.scoring.auditEntries, "tx-token-list")
    );

    scoreLayout.append(controlPanel, comparePanel);
    container.append(scoreLayout);
    updateScoringSummary(scoreLayout);
  };

  const renderScoring = (panel) => {
    if (!panel) return;
    clear(panel);
    renderPanelHeader(panel, {
      kicker: tx.scoring.kicker,
      heading: tx.scoring.heading,
      lede: tx.scoring.lede
    });
    renderScoringInner(panel);
  };

  const createWordDraft = () => {
    const sections = tx.finalReport.sections
      .map((section) => `<h2>${section.title}</h2><p>${section.content}</p>`)
      .join("");
    const metadata = tx.finalReport.metadata
      .map((item) => `<p><strong>${item.label}:</strong> ${item.value}</p>`)
      .join("");
    const html = `<!doctype html><html><head><meta charset="UTF-8"><title>${tx.finalReport.heading}</title></head><body><h1>${tx.finalReport.heading}</h1>${metadata}${sections}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = tx.finalReport.wordFileName;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const renderFinalInner = (container) => {
    const layout = createElement("div", { className: "tx-final-layout" });
    const report = createElement("section", { className: "tx-report-preview" });
    tx.finalReport.sections.forEach((section) => {
      report.append(
        createElement("article", {
          className: "tx-report-section",
          children: [
            createElement("h3", { text: section.title }),
            createElement("p", { text: section.content })
          ]
        })
      );
    });

    const status = createElement("p", { className: "form-status" });
    const print = createElement("button", {
      className: "button primary",
      attrs: { type: "button" },
      children: [createElement("span", { text: tx.ui.printPdf }), icon("picture_as_pdf")]
    });
    print.addEventListener("click", () => {
      status.textContent = tx.ui.printStatus;
      markGenerated(status);
      window.print();
    });
    const word = createElement("button", {
      className: "button secondary",
      attrs: { type: "button" },
      children: [createElement("span", { text: tx.ui.downloadWord }), icon("download")]
    });
    word.addEventListener("click", () => {
      createWordDraft();
      status.textContent = tx.ui.wordStatus;
      markGenerated(status);
    });

    const controls = createElement("aside", {
      className: "tx-export-panel",
      children: [
        createElement("h3", { text: tx.ui.reportMetadata }),
        ...tx.finalReport.metadata.map((item) => renderKeyValue(item.label, item.value)),
        createElement("h3", { text: tx.ui.outputType }),
        renderList([tx.ui.pdf, tx.ui.word], "tx-token-list"),
        createElement("div", { className: "form-actions", children: [print, word] }),
        status
      ]
    });
    layout.append(report, controls);
    container.append(layout);
  };

  const renderFinal = (panel) => {
    clear(panel);
    renderPanelHeader(panel, {
      kicker: tx.finalReport.kicker,
      heading: tx.finalReport.heading,
      lede: tx.finalReport.lede
    });
    renderFinalInner(panel);
  };

  renderStepNav();
  renderRouting(panels.get("routing"));
  renderSetup(panels.get("setup"));
  renderAgents(panels.get("agents"));
  renderDashboard(panels.get("dashboard"));
  renderGraph(panels.get("graph"));
  renderScoring(panels.get("scoring"));
  renderFinal(panels.get("final"));
  setStep("routing");

  document.querySelectorAll("[data-tx-step-target]").forEach((button) => {
    button.addEventListener("click", () => setStep(button.dataset.txStepTarget, true));
  });
};

const canvas = document.getElementById("signal-canvas");

setupTxArchaiWorkspace();
setupScrollReveal();

if (canvas instanceof HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  const particles = [];
  const particleCount = 72;
  let animationFrame = 0;

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const createParticle = () => ({
    x: Math.random() * canvas.clientWidth,
    y: Math.random() * canvas.clientHeight,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    size: 1.4 + Math.random() * 2.3
  });

  const seedParticles = () => {
    particles.length = 0;
    for (let index = 0; index < particleCount; index += 1) {
      particles.push(createParticle());
    }
  };

  const draw = () => {
    if (!context) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];

      if (!prefersReducedMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
      }

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      for (let j = i + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 145) {
          const opacity = 0.14 * (1 - distance / 145);
          context.strokeStyle = `rgba(0, 245, 255, ${opacity})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }

      context.fillStyle = "rgba(0, 245, 255, 0.62)";
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }

    if (!prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(draw);
    }
  };

  window.addEventListener("resize", () => {
    resizeCanvas();
    seedParticles();
    if (prefersReducedMotion) {
      draw();
    }
  });

  resizeCanvas();
  seedParticles();
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }
  draw();
}

const demoForm = document.querySelector("[data-demo-form]");
const formStatus = document.querySelector("[data-form-status]");

if (demoForm instanceof HTMLFormElement) {
  demoForm.addEventListener("submit", (event) => {
    if (!demoForm.checkValidity()) return;

    event.preventDefault();
    const data = new FormData(demoForm);
    const emailCopy = getCopy("demo.email");
    const fields = emailCopy.fields;
    const lines = [
      `${fields.name}: ${data.get("name") || ""}`,
      `${fields.company}: ${data.get("company") || ""}`,
      `${fields.title}: ${data.get("title") || ""}`,
      `${fields.email}: ${data.get("email") || ""}`,
      `${fields.interest}: ${data.get("interest") || ""}`,
      `${fields.disease}: ${data.get("disease") || ""}`,
      "",
      `${fields.message}:`,
      String(data.get("message") || "")
    ];

    const subject = encodeURIComponent(emailCopy.subject);
    const body = encodeURIComponent(lines.join("\n"));

    if (formStatus) {
      formStatus.textContent = emailCopy.status;
    }

    window.location.href = `mailto:${emailCopy.recipient}?subject=${subject}&body=${body}`;
  });
}

validateCopyCoverage();
