// GLOBAL PAGE NAV
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
  scrollToTop();
}

// NAVBAR & HERO 3D EFFECT
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    if (window.scrollY > 60) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }

  const heroInner = document.querySelector(".hero-inner");
  if (!heroInner) return;
  const rect = heroInner.getBoundingClientRect();
  const center = window.innerHeight / 2;
  const offset = (rect.top + rect.height / 2 - center) / window.innerHeight;
  const copy = document.querySelector(".hero-copy");
  const vis = document.querySelector(".hero-visual");
  const tilt = offset * 18;
  if (copy) copy.style.transform = `rotateY(${tilt * 0.5}deg)`;
  if (vis) vis.style.transform = `rotateY(${tilt * -0.5}deg)`;
});

// THREE.JS BACKGROUND
function initThreeBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.set(0, 0, 6);

  const geo = new THREE.IcosahedronGeometry(2.3, 1);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x2d6a4f,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const ico = new THREE.Mesh(geo, mat);
  scene.add(ico);

  const pGeo = new THREE.BufferGeometry();
  const pCount = 1200;
  const pos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) {
    pos[i] = (Math.random() - 0.5) * 60;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xd4af37,
    transparent: true,
    opacity: 0.6,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  function animate() {
    requestAnimationFrame(animate);
    const scrollFactor = window.scrollY / (window.innerHeight * 2);
    ico.rotation.x += 0.002 + scrollFactor * 0.004;
    ico.rotation.y += 0.003 + scrollFactor * 0.004;
    points.rotation.y += 0.0007;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// PORTFOLIO DATA & SLIDERS
const allocations = {
  stocks: 40,
  reits: 20,
  bonds: 30,
  crypto: 10,
};

const expectedReturns = {
  stocks: 10.5,
  reits: 8.0,
  bonds: 3.5,
  crypto: 45.0,
};

const volatilities = {
  stocks: 15,
  reits: 12,
  bonds: 5,
  crypto: 75,
};

const STOCK_LIST = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Class A)" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc. (Class B)" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "UNH", name: "UnitedHealth Group Inc." },
  { symbol: "XOM", name: "Exxon Mobil Corporation" },
  { symbol: "PG", name: "Procter & Gamble Co." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "HD", name: "Home Depot Inc." },
  { symbol: "BAC", name: "Bank of America Corporation" },
  { symbol: "KO", name: "Coca-Cola Company" },
  { symbol: "PEP", name: "PepsiCo Inc." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "DIS", name: "Walt Disney Company" },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "CSCO", name: "Cisco Systems Inc." },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "NKE", name: "Nike Inc." },
  { symbol: "MCD", name: "McDonald's Corporation" },
  { symbol: "PFE", name: "Pfizer Inc." },
  { symbol: "T", name: "AT&T Inc." },
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "CRM", name: "Salesforce Inc." },
  { symbol: "BABA", name: "Alibaba Group Holding Ltd." },
  { symbol: "TSM", name: "Taiwan Semiconductor Mfg." },
  { symbol: "SHOP", name: "Shopify Inc." },
  { symbol: "SQ", name: "Block Inc." },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust" },
  { symbol: "QQQ", name: "Invesco QQQ Trust" },
];

let allocationChart,
  growthChart,
  correlationChart,
  volatilityChart,
  riskReturnChart,
  monteCarloChart,
  strategyChart;

const chartColors = {
  stocks: "#52b788",
  reits: "#40916c",
  bonds: "#74c69d",
  crypto: "#d4af37",
};

function ensureChart(ctx, type, config) {
  if (!ctx || typeof Chart === "undefined") return null;
  if (ctx._chartInstance) {
    ctx._chartInstance.config.type = type;
    ctx._chartInstance.config.data = config.data;
    ctx._chartInstance.config.options = config.options;
    ctx._chartInstance.update();
    return ctx._chartInstance;
  } else {
    const chart = new Chart(ctx, { type, data: config.data, options: config.options });
    ctx._chartInstance = chart;
    return chart;
  }
}

function updateAllocationDisplays() {
  const total =
    allocations.stocks + allocations.reits + allocations.bonds + allocations.crypto;
  const totalEl = document.getElementById("total-allocation");
  if (totalEl) {
    totalEl.textContent = `${total}%`;
    totalEl.style.color = total === 100 ? "var(--gold)" : "var(--warning)";
  }

  const ids = ["stocks", "reits", "bonds", "crypto"];
  ids.forEach((k) => {
    const el = document.getElementById(`${k}-value`);
    if (el) el.textContent = allocations[k];
  });

  calculatePortfolioMetrics();
}

function calculatePortfolioMetrics() {
  let exp = 0;
  let variance = 0;

  const stockSelect = document.getElementById("stock-select");
  const cryptoSelect = document.getElementById("crypto-select");
  const stockSelections = stockSelect
    ? Array.from(stockSelect.selectedOptions)
    : [];
  const cryptoSelections = cryptoSelect
    ? Array.from(cryptoSelect.selectedOptions)
    : [];

  Object.keys(allocations).forEach((asset) => {
    const w = allocations[asset] / 100;
    let selections = [];

    if (asset === "stocks") selections = stockSelections;
    if (asset === "crypto") selections = cryptoSelections;

    if (selections.length > 0) {
      const eachWeight = w / selections.length;
      selections.forEach(() => {
        exp += eachWeight * expectedReturns[asset];
        variance += Math.pow(eachWeight * volatilities[asset], 2);
      });
    } else {
      exp += w * expectedReturns[asset];
      variance += Math.pow(w * volatilities[asset], 2);
    }
  });

  const sigma = Math.sqrt(variance);
  const rf = 2.5;
  const sharpe = sigma > 0 ? (exp - rf) / sigma : 0;

  const expEl = document.getElementById("expected-return");
  const volEl = document.getElementById("volatility");
  const shEl = document.getElementById("sharpe-ratio");
  if (expEl) expEl.textContent = exp.toFixed(1) + "%";
  if (volEl) volEl.textContent = sigma.toFixed(1) + "%";
  if (shEl) shEl.textContent = sharpe.toFixed(2);

  const heroVal = document.getElementById("hero-equity");
  if (heroVal && !isNaN(exp)) {
    const factor = 1 + exp / 100;
    heroVal.textContent = "$" + (10000 * Math.pow(factor, 10)).toFixed(0);
  }
}

function buildPortfolioCharts() {
  const labels = ["Equities", "REITs", "Bonds", "Crypto"];
  const assetKeys = ["stocks", "reits", "bonds", "crypto"];
  const weights = assetKeys.map((k) => allocations[k]);

  // Allocation doughnut
  const allocCtx = document.getElementById("allocation-chart");
  allocationChart = ensureChart(allocCtx, "doughnut", {
    data: {
      labels,
      datasets: [
        {
          data: weights,
          backgroundColor: assetKeys.map((k) => chartColors[k]),
          borderColor: "#02040a",
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom", labels: { color: "#e8f5e9" } },
        title: {
          display: true,
          text: "Current Allocation (%)",
          color: "#e8f5e9",
        },
      },
    },
  });

  // Growth
  const growthCtx = document.getElementById("growth-chart");
  const expVal = parseFloat(
    (document.getElementById("expected-return") || { textContent: "8.2%" })
      .textContent
  );
  const years = [...Array(11).keys()];
  const initial = 10000;
  const series = years.map((y) => initial * Math.pow(1 + expVal / 100, y));

  growthChart = ensureChart(growthCtx, "line", {
    data: {
      labels: years.map((y) => y + "y"),
      datasets: [
        {
          label: "Projected value",
          data: series,
          tension: 0.25,
        },
      ],
    },
    options: {
      plugins: {
        legend: { labels: { color: "#e8f5e9" } },
        title: {
          display: true,
          text: "Deterministic growth using expected return",
          color: "#e8f5e9",
        },
      },
      scales: {
        x: { ticks: { color: "#b7c9c3" }, grid: { color: "#122018" } },
        y: {
          ticks: { color: "#b7c9c3" },
          grid: { color: "#122018" },
          beginAtZero: false,
        },
      },
    },
  });

  // Correlation radar (approx)
  const corrCtx = document.getElementById("correlation-chart");
  const corrMatrix = [
    [1.0, 0.7, 0.3, 0.4],
    [0.7, 1.0, 0.4, 0.5],
    [0.3, 0.4, 1.0, 0.1],
    [0.4, 0.5, 0.1, 1.0],
  ];
  correlationChart = ensureChart(corrCtx, "radar", {
    data: {
      labels,
      datasets: corrMatrix.map((row, i) => ({
        label: labels[i],
        data: row,
      })),
    },
    options: {
      plugins: {
        legend: { labels: { color: "#e8f5e9" } },
        title: {
          display: true,
          text: "Approximate correlations (0 to 1)",
          color: "#e8f5e9",
        },
      },
      scales: {
        r: {
          min: 0,
          max: 1,
          ticks: { color: "#b7c9c3" },
          grid: { color: "#122018" },
          pointLabels: { color: "#e8f5e9" },
        },
      },
    },
  });

  // Volatility bar
  const volCtx = document.getElementById("volatility-chart");
  volatilityChart = ensureChart(volCtx, "bar", {
    data: {
      labels,
      datasets: [
        {
          label: "σ (annualised, %)",
          data: assetKeys.map((k) => volatilities[k]),
        },
      ],
    },
    options: {
      plugins: {
        legend: { labels: { color: "#e8f5e9" } },
        title: {
          display: true,
          text: "Asset-level Volatility",
          color: "#e8f5e9",
        },
      },
      scales: {
        x: { ticks: { color: "#b7c9c3" }, grid: { color: "#122018" } },
        y: {
          ticks: { color: "#b7c9c3" },
          grid: { color: "#122018" },
          beginAtZero: true,
        },
      },
    },
  });

  // Risk-return scatter
  const riskCtx = document.getElementById("risk-return-chart");
  riskReturnChart = ensureChart(riskCtx, "scatter", {
    data: {
      datasets: assetKeys.map((k, i) => ({
        label: labels[i],
        data: [{ x: volatilities[k], y: expectedReturns[k] }],
        pointRadius: 4,
      })),
    },
    options: {
      plugins: {
        legend: { labels: { color: "#e8f5e9" } },
        title: {
          display: true,
          text: "Expected Return vs Volatility",
          color: "#e8f5e9",
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Volatility (%)", color: "#e8f5e9" },
          ticks: { color: "#b7c9c3" },
          grid: { color: "#122018" },
        },
        y: {
          title: { display: true, text: "Expected Return (%)", color: "#e8f5e9" },
          ticks: { color: "#b7c9c3" },
          grid: { color: "#122018" },
        },
      },
    },
  });

  // Monte-Carlo fan (simplified)
  const mcCtx = document.getElementById("monte-carlo-chart");
  const nYears = 10;
  const expR = expVal / 100;
  const sigma = parseFloat(
    (document.getElementById("volatility") || { textContent: "12.5%" }).textContent
  ) / 100;
  const paths = [];
  for (let p = 0; p < 30; p++) {
    let value = 10000;
    const path = [value];
    for (let t = 1; t <= nYears; t++) {
      const shock = sigma * 0.6 * (Math.random() * 2 - 1);
      value *= 1 + expR + shock;
      path.push(value);
    }
    paths.push(path);
  }

  monteCarloChart = ensureChart(mcCtx, "line", {
    data: {
      labels: [...Array(nYears + 1).keys()].map((y) => y + "y"),
      datasets: paths.map((path) => ({
        data: path,
        tension: 0.25,
        borderWidth: 1,
        pointRadius: 0,
      })),
    },
    options: {
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Sample Monte-Carlo Paths",
          color: "#e8f5e9",
        },
      },
      scales: {
        x: { ticks: { color: "#b7c9c3" }, grid: { color: "#122018" } },
        y: {
          ticks: { color: "#b7c9c3" },
          grid: { color: "#122018" },
          beginAtZero: false,
        },
      },
    },
  });
}

// RUN SIM + VISIBILITY
let simulationRun = false;
const chartCards = {};

function updateChartVisibilityFromChecks() {
  const mapping = [
    ["chk-allocation", "allocation-card"],
    ["chk-growth", "growth-card"],
    ["chk-correlation", "correlation-card"],
    ["chk-volatility", "volatility-card"],
    ["chk-risk-return", "risk-return-card"],
    ["chk-monte-carlo", "monte-carlo-card"],
  ];
  mapping.forEach(([chkId, cardId]) => {
    const chk = document.getElementById(chkId);
    const card = document.getElementById(cardId);
    if (!chk || !card) return;
    if (simulationRun && chk.checked) card.classList.remove("hidden");
    else card.classList.add("hidden");
  });
}

// STRATEGY BUILDER
function riskLabelForScore(s) {
  if (s <= 3) return "Conservative";
  if (s <= 7) return "Moderate";
  return "Aggressive";
}

function recomputeStrategy() {
  const horizonSlider = document.getElementById("horizon-slider");
  const riskSlider = document.getElementById("risk-slider");
  const initialSlider = document.getElementById("initial-slider");
  const monthlySlider = document.getElementById("monthly-slider");
  if (!horizonSlider || !riskSlider || !initialSlider || !monthlySlider) return;

  const years = parseInt(horizonSlider.value, 10);
  const risk = parseInt(riskSlider.value, 10);
  const initial = parseInt(initialSlider.value, 10);
  const monthly = parseInt(monthlySlider.value, 10);

  const horizonValue = document.getElementById("horizon-value");
  const riskLabelEl = document.getElementById("risk-label");
  const initialValue = document.getElementById("initial-value");
  const monthlyValue = document.getElementById("monthly-value");

  if (horizonValue) horizonValue.textContent = years;
  if (riskLabelEl) riskLabelEl.textContent = riskLabelForScore(risk);
  if (initialValue) initialValue.textContent = initial.toLocaleString();
  if (monthlyValue) monthlyValue.textContent = monthly.toLocaleString();

  const baseReturn = 6 + risk; // 7–16% depending on risk
  const r = baseReturn / 100 / 12;
  const n = years * 12;

  let future = initial * Math.pow(1 + r, n);
  if (monthly > 0) {
    future += (monthly * (Math.pow(1 + r, n) - 1)) / r;
  }

  const contribTotal = initial + monthly * n;
  const gain = future - contribTotal;

  const stratFinal = document.getElementById("strategy-final");
  const stratContrib = document.getElementById("strategy-contrib");
  const stratGain = document.getElementById("strategy-gain");
  const stratText = document.getElementById("strategy-text");

  if (stratFinal) stratFinal.textContent = "$" + future.toFixed(0).toLocaleString();
  if (stratContrib)
    stratContrib.textContent = "$" + contribTotal.toFixed(0).toLocaleString();
  if (stratGain) stratGain.textContent = "$" + gain.toFixed(0).toLocaleString();

  if (stratText) {
    stratText.innerHTML =
      `With a <strong>${years}-year</strong> horizon, ` +
      `<strong>${riskLabelForScore(risk).toLowerCase()}</strong> risk tolerance, ` +
      `a <strong>$${initial.toLocaleString()}</strong> lump sum and ` +
      `<strong>$${monthly.toLocaleString()}/month</strong> contributions, ` +
      `you’re effectively targeting around <strong>${baseReturn.toFixed(
        1
      )}% annualised</strong>. ` +
      `Most of the growth comes from time in the market plus disciplined contributions – the curve is what this chart shows.`;
  }

  const labels = [...Array(years + 1).keys()].map((y) => y + "y");
  let value = initial;
  const values = [value];
  for (let yr = 1; yr <= years; yr++) {
    for (let m = 0; m < 12; m++) {
      value *= 1 + r;
      value += monthly;
    }
    values.push(value);
  }

  const ctx = document.getElementById("strategy-chart");
  strategyChart = ensureChart(ctx, "line", {
    data: {
      labels,
      datasets: [
        {
          label: "Strategy balance",
          data: values,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: { labels: { color: "#e8f5e9" } },
        title: {
          display: true,
          text: "Projected balance with monthly investing",
          color: "#e8f5e9",
        },
      },
      scales: {
        x: { ticks: { color: "#b7c9c3" }, grid: { color: "#122018" } },
        y: {
          ticks: { color: "#b7c9c3" },
          grid: { color: "#122018" },
          beginAtZero: false,
        },
      },
    },
  });
}

// MARKET DATA (CoinGecko)
async function fetchCryptoData() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd&include_24hr_change=true"
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    console.warn("Crypto simple price error", err);
    return null;
  }
}

async function fetchCryptoList() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false"
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    console.warn("Crypto list error", err);
    return [];
  }
}

async function buildMarketStats() {
  const data = await fetchCryptoData();

  // BTC
  if (data && data.bitcoin) {
    const btc = data.bitcoin;
    const priceEl = document.getElementById("btc-value");
    const changeEl = document.getElementById("btc-change");
    const price = btc.usd;
    const change = btc.usd_24h_change ?? 0;
    if (priceEl)
      priceEl.textContent = "$" + (price != null ? price.toLocaleString() : "-");
    if (changeEl) {
      changeEl.textContent =
        (change >= 0 ? "+" : "") + change.toFixed(2) + "% (24h)";
      changeEl.style.color = change >= 0 ? "var(--success)" : "var(--danger)";
    }
    if (priceEl) {
      priceEl.classList.toggle("negative", change < 0);
    }
  } else {
    const priceEl = document.getElementById("btc-value");
    if (priceEl) priceEl.textContent = "API error";
  }

  // Gold via PAXG proxy
  if (data && data["pax-gold"]) {
    const gold = data["pax-gold"];
    const goldValue = document.getElementById("gold-value");
    const goldChange = document.getElementById("gold-change");
    const gChange = gold.usd_24h_change ?? 0;

    if (goldValue)
      goldValue.textContent =
        "$" + (gold.usd != null ? gold.usd.toLocaleString() : "-");
    if (goldChange) {
      goldChange.textContent =
        (gChange >= 0 ? "+" : "") + gChange.toFixed(2) + "% (24h)";
      goldChange.style.color = gChange >= 0 ? "var(--success)" : "var(--danger)";
    }
    if (goldValue) goldValue.classList.toggle("negative", gChange < 0);
  } else {
    const goldVal = document.getElementById("gold-value");
    const goldCh = document.getElementById("gold-change");
    if (goldVal) goldVal.textContent = "$–";
    if (goldCh) {
      goldCh.textContent = "Unavailable";
      goldCh.style.color = "var(--gray)";
    }
  }

  // Simple fixed sentiment (could wire to a real API)
  const sentimentVal = document.getElementById("sentiment-value");
  const sentimentDesc = document.getElementById("sentiment-desc");
  if (sentimentVal) sentimentVal.textContent = "Greed 63 / 100";
  if (sentimentDesc)
    sentimentDesc.textContent = "Risk-on: flows favour equities & crypto.";
}

async function buildCryptoTicker() {
  const el = document.getElementById("crypto-ticker");
  if (!el) return;
  el.innerHTML = "";
  try {
    const list = await fetchCryptoList();
    list.forEach((c) => {
      const item = document.createElement("div");
      item.className = "ticker-item";
      const change = c.price_change_percentage_24h;
      item.innerHTML = `
        <span class="ticker-symbol">${c.symbol.toUpperCase()}</span>
        <span class="ticker-price">$${c.current_price.toLocaleString()}</span>
        <span style="color:${change >= 0 ? "var(--success)" : "var(--danger)"}">
          ${(change >= 0 ? "+" : "") + change.toFixed(2)}%
        </span>
      `;
      el.appendChild(item);
    });
    el.innerHTML += el.innerHTML; // duplicate for infinite scroll
  } catch (err) {
    console.warn("Ticker error", err);
    el.textContent = "Unable to load live ticker.";
  }
}

// ============ UPGRADED NEWS SECTION ============

// Use your existing key here:
const NEWS_API_KEY = "6fac2527aad64481bf4934d1ba1bfbf2";

const newsState = {
  category: "top",
  query: "",
  page: 1,
  pageSize: 6,
  loading: false,
  reachedEnd: false,
  lastBatch: [],
};

const NEWS_STORAGE_KEY = "investiq_saved_news";

function sentimentFromText(text = "") {
  const t = text.toLowerCase();
  let score = 0;
  const bullishWords = ["rally", "surge", "gain", "record high", "optimism", "beat", "growth", "bull"];
  const bearishWords = ["selloff", "plunge", "drop", "loss", "recession", "fear", "cut", "bear"];

  bullishWords.forEach((w) => {
    if (t.includes(w)) score += 1;
  });
  bearishWords.forEach((w) => {
    if (t.includes(w)) score -= 1;
  });

  if (score > 0) return { label: "Bullish", className: "sentiment-bullish" };
  if (score < 0) return { label: "Bearish", className: "sentiment-bearish" };
  return { label: "Neutral", className: "sentiment-neutral" };
}

function highlightKeywords(title = "") {
  const keywords = ["fed", "inflation", "rate", "rates", "gold", "bitcoin", "earnings", "recession", "ai"];
  let result = title;
  keywords.forEach((kw) => {
    const re = new RegExp(`(${kw})`, "ig");
    result = result.replace(re, `<mark style="background:none;color:var(--accent);">${"$1"}</mark>`);
  });
  return result;
}

function summarizeArticle(article) {
  const text = article.description || article.content || article.title || "";
  if (text.length <= 220) return text;
  const cutoff = text.indexOf(".", 140);
  if (cutoff !== -1 && cutoff < 260) return text.slice(0, cutoff + 1);
  return text.slice(0, 220) + "…";
}

function buildNewsUrl() {
  const { category, query, page, pageSize } = newsState;
  const baseEverything = "https://newsapi.org/v2/everything";
  const baseTop = "https://newsapi.org/v2/top-headlines";

  // Search overrides category (use /everything for better results)
  if (query && query.trim()) {
    const q = encodeURIComponent(query.trim());
    return `${baseEverything}?q=${q}&language=en&sortBy=publishedAt&pageSize=${pageSize}&page=${page}&apiKey=${NEWS_API_KEY}`;
  }

  // Category logic
  if (category === "top") {
    return `${baseTop}?category=business&language=en&pageSize=${pageSize}&page=${page}&apiKey=${NEWS_API_KEY}`;
  }

  let q = "";
  switch (category) {
    case "stocks":
      q = "stocks OR equity OR earnings OR \"stock market\"";
      break;
    case "crypto":
      q = "bitcoin OR crypto OR ethereum OR blockchain";
      break;
    case "macro":
      q = "inflation OR GDP OR recession OR \"central bank\" OR macroeconomic";
      break;
    case "fx":
      q = "forex OR FX OR currency OR \"exchange rate\"";
      break;
    case "commodities":
      q = "gold OR oil OR copper OR commodity OR commodities";
      break;
    default:
      q = "markets OR finance";
  }
  q = encodeURIComponent(q);
  return `${baseEverything}?q=${q}&language=en&sortBy=publishedAt&pageSize=${pageSize}&page=${page}&apiKey=${NEWS_API_KEY}`;
}

async function fetchNewsPage() {
  const url = buildNewsUrl();
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("News HTTP " + res.status);
    const json = await res.json();
    return json.articles || [];
  } catch (err) {
    console.warn("News API error:", err);
    return [];
  }
}

function renderBreakingTicker(articles) {
  const ticker = document.getElementById("breaking-news-ticker");
  if (!ticker) return;
  if (!articles.length) {
    ticker.textContent = "";
    return;
  }
  const top = articles.slice(0, 5);
  const inner = document.createElement("div");
  inner.className = "breaking-inner";

  const label = document.createElement("span");
  label.className = "breaking-label";
  label.textContent = "Breaking";
  inner.appendChild(label);

  top.forEach((a) => {
    const span = document.createElement("span");
    span.className = "breaking-headline";
    span.textContent = a.title;
    inner.appendChild(span);
  });

  ticker.innerHTML = "";
  ticker.appendChild(inner);
}

/* ---------- Watchlist (localStorage) ---------- */

function getSavedArticles() {
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSavedArticles(arr) {
  localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(arr));
}

function isSaved(url) {
  return getSavedArticles().some((a) => a.url === url);
}

function toggleSaved(article) {
  const current = getSavedArticles();
  const idx = current.findIndex((a) => a.url === article.url);
  if (idx === -1) {
    current.push({
      title: article.title,
      url: article.url,
      source: article.source?.name || "",
      publishedAt: article.publishedAt,
    });
  } else {
    current.splice(idx, 1);
  }
  setSavedArticles(current);
  renderSavedArticles();
}

function renderSavedArticles() {
  const container = document.getElementById("saved-news");
  if (!container) return;
  const saved = getSavedArticles();
  container.innerHTML = "";

  if (!saved.length) {
    container.innerHTML = `<p style="font-size:0.8rem;color:var(--gray-dark);">No saved articles yet. Click ★ on a headline to save it.</p>`;
    return;
  }

  saved.forEach((a) => {
    const div = document.createElement("div");
    div.className = "saved-news-item";
    div.innerHTML = `
      <div class="saved-news-item-title">${a.title}</div>
      <div class="saved-news-item-meta">${a.source || "Source"} • ${
      a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ""
    }</div>
    `;
    div.addEventListener("click", () => {
      window.open(a.url, "_blank", "noopener");
    });
    container.appendChild(div);
  });
}

/* ---------- Modal + TTS ---------- */

let currentModalArticle = null;

function openNewsModal(article) {
  currentModalArticle = article;

  const modal = document.getElementById("news-modal");
  if (!modal) return;

  const img = document.getElementById("news-modal-image");
  const srcEl = document.getElementById("news-modal-source");
  const dateEl = document.getElementById("news-modal-date");
  const sentEl = document.getElementById("news-modal-sentiment");
  const titleEl = document.getElementById("news-modal-title");
  const summaryEl = document.getElementById("news-modal-summary");
  const linkEl = document.getElementById("news-modal-link");

  const placeholder =
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80";

  if (img) img.src = article.urlToImage || placeholder;
  if (srcEl) srcEl.textContent = article.source?.name || "Unknown source";
  if (dateEl)
    dateEl.textContent = article.publishedAt
      ? new Date(article.publishedAt).toLocaleString()
      : "";
  const sentiment = sentimentFromText(article.title + " " + (article.description || ""));
  if (sentEl) {
    sentEl.textContent = sentiment.label;
    sentEl.className = `sentiment-pill ${sentiment.className}`;
  }
  if (titleEl) titleEl.textContent = article.title || "";
  const summary = summarizeArticle(article);
  if (summaryEl) summaryEl.textContent = summary;
  if (linkEl) linkEl.href = article.url;

  modal.classList.remove("hidden");
}

function closeNewsModal() {
  const modal = document.getElementById("news-modal");
  if (modal) modal.classList.add("hidden");
  currentModalArticle = null;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/* ---------- Render feed ---------- */

function renderArticles(articles, append = false) {
  const container = document.getElementById("news-feed");
  if (!container) return;

  if (!append) container.innerHTML = "";

  const placeholder =
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80";

  articles.forEach((a) => {
    const card = document.createElement("article");
    card.className = "news-item";

    const sentiment = sentimentFromText(a.title + " " + (a.description || ""));
    const summary = summarizeArticle(a);
    const saved = isSaved(a.url);

    card.innerHTML = `
      <div class="news-card-link">
        <img class="news-image" src="${a.urlToImage || placeholder}" alt="${a.title || "News"}">
        <div class="news-body">
          <h3 class="news-title">${highlightKeywords(a.title || "")}</h3>
          <p class="news-desc">${summary}</p>
          <div class="news-meta">
            <span>${a.source?.name || "Unknown source"}</span>
            <span>${a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ""}</span>
          </div>
          <div class="news-actions">
            <span class="sentiment-pill ${sentiment.className}">${sentiment.label}</span>
            <div>
              <button class="news-save-btn ${saved ? "saved" : ""}" title="Save article">★</button>
              <button class="news-open-btn">Open ↗</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Open modal on card click
    card.addEventListener("click", (e) => {
      // avoid double-handling when buttons clicked
      if (e.target.closest("button")) return;
      openNewsModal(a);
    });

    // Save toggle
    const saveBtn = card.querySelector(".news-save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSaved(a);
        saveBtn.classList.toggle("saved");
      });
    }

    // Open in new tab
    const openBtn = card.querySelector(".news-open-btn");
    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (a.url) window.open(a.url, "_blank", "noopener");
      });
    }

    container.appendChild(card);
  });
}

/* ---------- Load news with pagination & live updates ---------- */

async function loadNews({ reset = false } = {}) {
  if (newsState.loading) return;
  newsState.loading = true;

  if (reset) {
    newsState.page = 1;
    newsState.reachedEnd = false;
  }

  const articles = await fetchNewsPage();
  newsState.loading = false;

  if (!articles.length) {
    if (newsState.page === 1) {
      const container = document.getElementById("news-feed");
      if (container) container.innerHTML = "<p>Unable to load live news right now.</p>";
    }
    newsState.reachedEnd = true;
    return;
  }

  newsState.lastBatch = articles;

  const append = !reset && newsState.page > 1;
  renderArticles(articles, append);

  if (newsState.page === 1) {
    renderBreakingTicker(articles);
  }

  if (articles.length < newsState.pageSize) {
    newsState.reachedEnd = true;
  }
}

/* ---------- Init News UI ---------- */

function initNewsSection() {
  const tabs = document.querySelectorAll(".news-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      newsState.category = tab.getAttribute("data-news-category") || "top";
      newsState.query = "";
      const input = document.getElementById("news-search-input");
      if (input) input.value = "";
      loadNews({ reset: true });
    });
  });

  const searchInput = document.getElementById("news-search-input");
  const searchBtn = document.getElementById("news-search-btn");
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      newsState.query = searchInput.value.trim();
      newsState.page = 1;
      newsState.reachedEnd = false;
      loadNews({ reset: true });
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        newsState.query = searchInput.value.trim();
        newsState.page = 1;
        newsState.reachedEnd = false;
        loadNews({ reset: true });
      }
    });
  }

  // Infinite scroll
  window.addEventListener("scroll", () => {
    const newsPage = document.getElementById("news");
    if (!newsPage || !newsPage.classList.contains("active")) return;
    if (newsState.loading || newsState.reachedEnd) return;

    const nearBottom =
      window.innerHeight + window.scrollY > document.body.offsetHeight - 400;
    if (nearBottom) {
      newsState.page += 1;
      loadNews({ reset: false });
    }
  });

  // Modal controls
  const modal = document.getElementById("news-modal");
  const closeBtn = document.getElementById("news-modal-close");
  const backdrop = document.querySelector(".news-modal-backdrop");
  if (closeBtn) closeBtn.addEventListener("click", closeNewsModal);
  if (backdrop) backdrop.addEventListener("click", closeNewsModal);

  const ttsBtn = document.getElementById("news-modal-tts");
  if (ttsBtn && "speechSynthesis" in window) {
    ttsBtn.addEventListener("click", () => {
      if (!currentModalArticle) return;
      const summary = summarizeArticle(currentModalArticle);
      const utter = new SpeechSynthesisUtterance(summary);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    });
  }

  renderSavedArticles();
  loadNews({ reset: true });

  // Optional: periodically refresh top headlines ticker & first page (only when on Top & no search)
  setInterval(() => {
    if (newsState.category === "top" && !newsState.query) {
      newsState.page = 1;
      newsState.reachedEnd = false;
      loadNews({ reset: true });
    }
  }, 120000); // every 2 minutes
}


// STOCK & CRYPTO SELECT POPULATION
function populateStockSelect() {
  const select = document.getElementById("stock-select");
  if (!select) return;

  select.innerHTML = "";
  STOCK_LIST.forEach((stock) => {
    const option = document.createElement("option");
    option.value = stock.symbol;
    option.textContent = `${stock.symbol} — ${stock.name}`;
    select.appendChild(option);
  });

  ["AAPL", "MSFT", "GOOGL", "AMZN", "SPY"].forEach((symbol) => {
    const opt = Array.from(select.options).find((o) => o.value === symbol);
    if (opt) opt.selected = true;
  });
}

async function populateCryptoSelect() {
  const select = document.getElementById("crypto-select");
  if (!select) return;

  select.innerHTML = "<option>Loading top crypto assets…</option>";

  try {
    const list = await fetchCryptoList();
    select.innerHTML = "";
    list.forEach((coin) => {
      const opt = document.createElement("option");
      opt.value = coin.id;
      opt.textContent = `${coin.symbol.toUpperCase()} — ${coin.name}`;
      select.appendChild(opt);
    });

    ["bitcoin", "ethereum"].forEach((id) => {
      const opt = Array.from(select.options).find((o) => o.value === id);
      if (opt) opt.selected = true;
    });
  } catch (err) {
    console.error("Error populating crypto assets:", err);
    select.innerHTML = "<option>Unable to load crypto list right now.</option>";
  }
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  initThreeBackground();

  // Sliders
  const sliderIds = ["stocks", "reits", "bonds", "crypto"];
  sliderIds.forEach((k) => {
    const slider = document.getElementById(`${k}-slider`);
    if (!slider) return;
    slider.addEventListener("input", () => {
      allocations[k] = parseInt(slider.value, 10);
      updateAllocationDisplays();
    });
  });

  populateStockSelect();
  populateCryptoSelect();

  // Recalculate when selections change
  const stockSelect = document.getElementById("stock-select");
  const cryptoSelect = document.getElementById("crypto-select");
  if (stockSelect) stockSelect.addEventListener("change", calculatePortfolioMetrics);
  if (cryptoSelect) cryptoSelect.addEventListener("change", calculatePortfolioMetrics);

  // Run Simulation button
  const simStatus = document.getElementById("sim-status");
  const runSimBtn = document.getElementById("run-sim-btn");
  if (runSimBtn) {
    runSimBtn.addEventListener("click", () => {
      simulationRun = true;
      calculatePortfolioMetrics();
      buildPortfolioCharts();
      updateChartVisibilityFromChecks();
      if (simStatus) {
        simStatus.textContent = "Simulation up to date – charts refreshed.";
        simStatus.classList.add("active");
      }
    });
  }

  document
    .querySelectorAll(".graph-checkboxes input")
    .forEach((chk) => chk.addEventListener("change", updateChartVisibilityFromChecks));

  updateChartVisibilityFromChecks();
  updateAllocationDisplays();

  // Strategy
  const strategySliders = [
    "horizon-slider",
    "risk-slider",
    "initial-slider",
    "monthly-slider",
  ];
  strategySliders.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", recomputeStrategy);
  });
  recomputeStrategy();

  // Market & news
  buildMarketStats();
  buildCryptoTicker();
  buildNewsFeed();

  // Periodic refresh for market data
  setInterval(buildMarketStats, 60000);
  setInterval(buildCryptoTicker, 60000);
});

// ------------------
// INTERACTIVE QUIZ
// ------------------

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("quiz-submit");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", () => {
    let score = 0;
    let answered = true;

    for (let i = 1; i <= 5; i++) {
      const options = document.querySelector(`input[name="q${i}"]:checked`);
      if (!options) {
        answered = false;
        break;
      }
      score += parseInt(options.value);
    }

    if (!answered) {
      alert("Please answer all questions before submitting!");
      return;
    }

    const resultBox = document.getElementById("quiz-result");
    const resultTitle = document.querySelector(".quiz-result-title");
    const resultText = document.getElementById("quiz-result-text");

    let profile = "";
    let explanation = "";

    if (score <= 7) {
      profile = "Conservative Investor";
      explanation =
        "You prefer stability and capital preservation. A portfolio with higher allocations " +
        "to bonds, blue-chip equities, and minimal high-volatility assets would suit you well.";
    } 
    else if (score <= 11) {
      profile = "Moderate Investor";
      explanation =
        "You balance growth with stability. A diversified mix of equities, REITs, and bonds is ideal. " +
        "Moderate crypto exposure can enhance long-term upside.";
    } 
    else {
      profile = "Aggressive Investor";
      explanation =
        "You’re comfortable with volatility and think long-term. A portfolio tilted heavily toward " +
        "equities and growth assets — with some crypto optionality — aligns with your profile.";
    }

    resultTitle.textContent = profile;
    resultText.textContent = explanation;

    resultBox.style.display = "block";

  });
});

