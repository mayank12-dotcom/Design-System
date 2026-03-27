const pageButtons = [...document.querySelectorAll("[data-page-target]")];
const pages = [...document.querySelectorAll(".page")];
const outlineRoot = document.getElementById("outlineLinks");
const searchInput = document.getElementById("searchInput");
const pageJumpButtons = [...document.querySelectorAll("[data-page-jump]")];
const demoTabs = [...document.querySelectorAll("[data-demo-tab]")];
const demoPanels = [...document.querySelectorAll("[data-demo-panel]")];
const tokenData = window.EDEN_TOKEN_DATA || { collections: [] };
const activeTokenCard = document.getElementById("activeTokenCard");
const copyToast = document.getElementById("copyToast");

const state = {
  page: "intro",
  filters: {
    colors: "all",
    typography: "all",
  },
  queries: {
    colors: "",
    typography: "",
  },
  collapsedGroups: new Set(),
  activeToken: null,
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return value.replace(/[-_]/g, " ");
}

function formatValue(value, type) {
  if (type === "FLOAT") return `${value}`;
  return String(value);
}

function sortByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function parseHashState() {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return {
    page: params.get("page") || "intro",
    token: params.get("token"),
  };
}

function syncHash() {
  const params = new URLSearchParams();
  params.set("page", state.page);
  if (state.activeToken && state.activeToken.page === state.page) {
    params.set("token", state.activeToken.id);
  }
  history.replaceState(null, "", `#${params.toString()}`);
}

function ensureSectionIds() {
  pages.forEach((page) => {
    const sections = page.querySelectorAll(".doc-section");
    sections.forEach((section) => {
      const heading = section.querySelector("h2");
      if (!heading) return;
      section.id = `${page.dataset.page}-${slugify(heading.textContent)}`;
    });
  });
}

function renderOutline(page) {
  if (!page || !outlineRoot) return;
  const sections = [...page.querySelectorAll(".doc-section h2")];
  outlineRoot.innerHTML = "";

  sections.forEach((heading, index) => {
    const button = document.createElement("button");
    button.textContent = heading.textContent.trim();
    button.dataset.sectionTarget = heading.parentElement.id;
    if (index === 0) {
      button.classList.add("is-active");
    }
    outlineRoot.appendChild(button);
  });
}

function setActivePage(pageName, options = {}) {
  state.page = pageName;

  pages.forEach((page) => {
    page.classList.toggle("is-active", page.dataset.page === pageName);
  });

  pageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.pageTarget === pageName);
  });

  const activePage = document.querySelector(`.page[data-page="${pageName}"]`);
  renderOutline(activePage);

  if (options.syncHash !== false) {
    syncHash();
  }
}

function showToast(message) {
  if (!copyToast) return;
  copyToast.textContent = message;
  copyToast.hidden = false;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    copyToast.hidden = true;
  }, 1800);
}

function copyToken(item) {
  const payload = `${item.name}: ${item.value}`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(payload).then(() => showToast(`Copied ${item.name}`));
    return;
  }
  showToast(payload);
}

function setActiveToken(item) {
  state.activeToken = item;
  syncHash();

  document.querySelectorAll(".token-row.is-active").forEach((row) => {
    row.classList.remove("is-active");
  });

  const row = document.getElementById(item.id);
  if (row) {
    row.classList.add("is-active");
  }

  if (activeTokenCard) {
    activeTokenCard.hidden = false;
    activeTokenCard.innerHTML = `
      <p class="outline-title">Selected Token</p>
      <strong>${item.name}</strong>
      <p>${item.collection}</p>
      <p>${item.group}</p>
      <code>${item.value}</code>
    `;
  }
}

function getColorCollections() {
  return tokenData.collections
    .map((collection) => ({
      ...collection,
      items: collection.items.filter((item) => item.type === "COLOR"),
    }))
    .filter((collection) => collection.items.length);
}

function getTypographyGroups() {
  const responsive = tokenData.collections.find((collection) => collection.name === "Responsive");
  if (!responsive) return [];

  return [...new Set(responsive.items.map((item) => item.group))];
}

function createToolbar(scope) {
  const mountId = scope === "colors" ? "colorTokenControls" : "typographyTokenControls";
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const chipItems =
    scope === "colors"
      ? getColorCollections().map((collection) => ({
          id: collection.name,
          label: collection.name,
        }))
      : getTypographyGroups().map((group) => ({
          id: group,
          label: group,
        }));

  mount.innerHTML = `
    <div class="token-toolbar-bar">
      <input
        class="token-toolbar-input"
        type="search"
        data-token-query="${scope}"
        value="${state.queries[scope]}"
        placeholder="Filter ${scope === "colors" ? "tokens" : "typography tokens"}..."
      />
      <button class="token-action" data-token-action="expand" data-scope="${scope}">Expand all</button>
      <button class="token-action" data-token-action="collapse" data-scope="${scope}">Collapse all</button>
      <button class="token-action" data-token-action="clear" data-scope="${scope}">Clear</button>
    </div>
    <div class="token-filter-row">
      <button class="token-chip ${state.filters[scope] === "all" ? "is-active" : ""}" data-token-filter="${scope}" data-filter-value="all">All</button>
      ${chipItems
        .map(
          (chip) => `
            <button
              class="token-chip ${state.filters[scope] === chip.id ? "is-active" : ""}"
              data-token-filter="${scope}"
              data-filter-value="${chip.id}"
            >
              ${chip.label}
            </button>
          `,
        )
        .join("")}
    </div>
    <div class="token-toolbar-meta">
      ${
        scope === "colors"
          ? "Browse by exported collection. Click a group header to collapse, or click a token to copy and deep-link it."
          : "Responsive typography tokens are grouped by family, weight, size, line-height, and letter-spacing."
      }
    </div>
  `;
}

function groupTokens(items) {
  const grouped = new Map();
  sortByName(items).forEach((item) => {
    const groupName = item.group || "Base";
    if (!grouped.has(groupName)) {
      grouped.set(groupName, []);
    }
    grouped.get(groupName).push(item);
  });
  return [...grouped.entries()];
}

function createTokenRow(item, compact = false) {
  return `
    <button
      class="token-row ${compact ? "token-row-compact" : ""}"
      id="${item.id}"
      data-token-id="${item.id}"
      type="button"
    >
      ${
        compact
          ? ""
          : `<div class="token-swatch-chip"><span style="background:${item.value}"></span></div>`
      }
      <div class="token-name">
        <strong>${item.name.split("/").slice(-1)[0]}</strong>
        <span>${item.name}</span>
      </div>
      <div class="token-value"><code>${item.value}</code></div>
      <div class="token-type">${item.type}</div>
    </button>
  `;
}

function renderTokenGroup(scope, collectionName, groupName, items, compact = false) {
  const groupKey = `${scope}:${collectionName}:${groupName}`;
  const isCollapsed = state.collapsedGroups.has(groupKey);
  const filteredItems = items.filter((item) => {
    const query = state.queries[scope].trim().toLowerCase();
    if (!query) return true;
    return `${item.name} ${item.value} ${item.type}`.toLowerCase().includes(query);
  });

  if (!filteredItems.length) return "";

  return `
    <section class="token-group ${isCollapsed ? "is-collapsed" : ""}">
      <button class="token-group-toggle" type="button" data-group-key="${groupKey}">
        <div class="token-group-head">
          <h4>${groupName}</h4>
          <span>${filteredItems.length} tokens</span>
        </div>
      </button>
      <div class="token-group-body">
        <div class="token-group-body-inner">
          ${filteredItems.map((item) => createTokenRow(item, compact)).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderSummary() {
  const mount = document.getElementById("tokenSummary");
  if (!mount) return;

  const colorCollections = getColorCollections();
  const sizeCollections = tokenData.collections.filter((collection) =>
    ["Radius", "Spacing"].includes(collection.name),
  );
  const typographyCollection = tokenData.collections.find((collection) => collection.name === "Responsive");

  mount.innerHTML = [
    ["Color", colorCollections.reduce((count, collection) => count + collection.items.length, 0), "Primitive, semantic, and brand collections from the export."],
    ["Sizing", sizeCollections.reduce((count, collection) => count + collection.items.length, 0), "Radius and spacing scales linked to the same source file."],
    ["Typography", typographyCollection ? typographyCollection.items.length : 0, "Responsive font families, sizes, weights, and spacing tokens."],
  ]
    .map(
      ([title, count, detail]) => `
        <article class="summary-card">
          <strong>${title}</strong>
          <span>${count} tokens</span>
          <p>${detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderColorCollections() {
  const mount = document.getElementById("colorTokenMount");
  if (!mount) return;

  const selectedCollection = state.filters.colors;
  const collections = getColorCollections().filter(
    (collection) => selectedCollection === "all" || collection.name === selectedCollection,
  );

  mount.innerHTML = collections
    .map((collection) => {
      const groups = groupTokens(
        collection.items.map((item) => ({
          ...item,
          id: `token-${slugify(collection.name)}-${slugify(item.name)}`,
          page: "colors",
          collection: collection.name,
        })),
      )
        .map(([groupName, items]) => renderTokenGroup("colors", collection.name, groupName, items))
        .join("");

      if (!groups) return "";

      return `
        <section class="token-collection" id="colors-collection-${slugify(collection.name)}">
          <div class="token-collection-head">
            <h3>${collection.name}</h3>
            <span>${collection.items.length} color tokens</span>
          </div>
          <div class="token-group-grid">${groups}</div>
        </section>
      `;
    })
    .join("");
}

function renderSizeCollections() {
  const mount = document.getElementById("sizeTokenMount");
  if (!mount) return;

  const query = state.queries.colors.trim().toLowerCase();
  const collections = tokenData.collections.filter((collection) =>
    ["Radius", "Spacing"].includes(collection.name),
  );

  mount.innerHTML = collections
    .map((collection) => {
      const items = sortByName(collection.items)
        .filter((item) => {
          if (!query) return true;
          return `${item.name} ${item.value}`.toLowerCase().includes(query);
        })
        .map((item) => ({
          ...item,
          id: `token-${slugify(collection.name)}-${slugify(item.name)}`,
          page: "colors",
          collection: collection.name,
          group: collection.name,
          value: `${formatValue(item.value, item.type)}px`,
        }));

      if (!items.length) return "";

      return `
        <section class="token-collection" id="colors-collection-${slugify(collection.name)}">
          <div class="token-collection-head">
            <h3>${collection.name}</h3>
            <span>${items.length} tokens</span>
          </div>
          <div class="token-group-grid">
            ${renderTokenGroup("colors", collection.name, `${collection.name} Scale`, items, true)}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderTypographyCollections() {
  const mount = document.getElementById("typographyTokenMount");
  if (!mount) return;

  const collection = tokenData.collections.find((item) => item.name === "Responsive");
  if (!collection) return;

  const selectedGroup = state.filters.typography;
  const grouped = groupTokens(
    collection.items.map((item) => ({
      ...item,
      id: `token-responsive-${slugify(item.name)}`,
      page: "typography",
      collection: "Responsive",
    })),
  ).filter(([groupName]) => selectedGroup === "all" || groupName === selectedGroup);

  mount.innerHTML = grouped
    .map(([groupName, items]) => {
      const renderedGroup = renderTokenGroup("typography", "Responsive", groupName, items, true);
      if (!renderedGroup) return "";

      return `
        <section class="token-collection" id="typography-group-${slugify(groupName)}">
          <div class="token-collection-head">
            <h3>${titleCase(groupName)}</h3>
            <span>${items.length} tokens</span>
          </div>
          <div class="token-group-grid">${renderedGroup}</div>
        </section>
      `;
    })
    .join("");
}

function renderInteractiveTokens() {
  renderSummary();
  createToolbar("colors");
  createToolbar("typography");
  renderColorCollections();
  renderSizeCollections();
  renderTypographyCollections();

  if (state.activeToken) {
    const row = document.getElementById(state.activeToken.id);
    if (row) {
      row.classList.add("is-active");
    }
  }
}

function restoreActiveTokenFromHash() {
  const { token } = parseHashState();
  if (!token) return;

  const row = document.getElementById(token);
  if (!row) return;

  const item = findTokenById(token);
  if (item) {
    setActiveToken(item);
  }
}

function findTokenById(id) {
  for (const collection of tokenData.collections) {
    for (const item of collection.items) {
      const colorsId = `token-${slugify(collection.name)}-${slugify(item.name)}`;
      const typographyId = `token-responsive-${slugify(item.name)}`;
      if (colorsId === id || typographyId === id) {
        return {
          ...item,
          id,
          collection: collection.name,
          page: id.startsWith("token-responsive-") ? "typography" : "colors",
        };
      }
    }
  }
  return null;
}

function handleGlobalSearch(query) {
  const normalized = query.trim().toLowerCase();
  pageButtons.forEach((button) => {
    const matches = button.textContent.toLowerCase().includes(normalized);
    button.classList.toggle("is-hidden-by-search", Boolean(normalized) && !matches);
  });
}

document.addEventListener("click", (event) => {
  const sectionButton = event.target.closest("[data-section-target]");
  if (sectionButton) {
    const section = document.getElementById(sectionButton.dataset.sectionTarget);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const filterButton = event.target.closest("[data-token-filter]");
  if (filterButton) {
    const scope = filterButton.dataset.tokenFilter;
    state.filters[scope] = filterButton.dataset.filterValue;
    renderInteractiveTokens();
    return;
  }

  const actionButton = event.target.closest("[data-token-action]");
  if (actionButton) {
    const scope = actionButton.dataset.scope;
    const action = actionButton.dataset.tokenAction;
    if (action === "clear") {
      state.filters[scope] = "all";
      state.queries[scope] = "";
    } else {
      const collectionNames =
        scope === "colors"
          ? [
              ...getColorCollections().map((collection) => collection.name),
              "Radius",
              "Spacing",
            ]
          : ["Responsive"];

      if (action === "collapse") {
        document.querySelectorAll("[data-group-key]").forEach((button) => {
          if (collectionNames.some((name) => button.dataset.groupKey.includes(`:${name}:`))) {
            state.collapsedGroups.add(button.dataset.groupKey);
          }
        });
      }
      if (action === "expand") {
        document.querySelectorAll("[data-group-key]").forEach((button) => {
          if (collectionNames.some((name) => button.dataset.groupKey.includes(`:${name}:`))) {
            state.collapsedGroups.delete(button.dataset.groupKey);
          }
        });
      }
    }
    renderInteractiveTokens();
    return;
  }

  const groupToggle = event.target.closest("[data-group-key]");
  if (groupToggle) {
    const key = groupToggle.dataset.groupKey;
    if (state.collapsedGroups.has(key)) {
      state.collapsedGroups.delete(key);
    } else {
      state.collapsedGroups.add(key);
    }
    renderInteractiveTokens();
    return;
  }

  const tokenRow = event.target.closest("[data-token-id]");
  if (tokenRow) {
    const item = findTokenById(tokenRow.dataset.tokenId);
    if (!item) return;
    setActiveToken(item);
    copyToken(item);
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches("[data-token-query]")) {
    state.queries[target.dataset.tokenQuery] = target.value;
    renderInteractiveTokens();
  }
});

pageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActivePage(button.dataset.pageTarget);
  });
});

pageJumpButtons.forEach((button) => {
  button.addEventListener("click", () => setActivePage(button.dataset.pageJump));
});

demoTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    demoTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    demoPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.demoPanel === tab.dataset.demoTab);
    });
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    handleGlobalSearch(event.target.value);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "/") {
      event.preventDefault();
      searchInput.focus();
    }
  });
}

ensureSectionIds();
renderInteractiveTokens();

const hashState = parseHashState();
setActivePage(hashState.page, { syncHash: false });
restoreActiveTokenFromHash();
