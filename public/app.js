const createForm = document.getElementById('createForm');
const dateInput = document.getElementById('dateInput');
const cpuSelect = document.getElementById('cpuSelect');
const priceInput = document.getElementById('priceInput');
const fetchPriceBtn = document.getElementById('fetchPriceBtn');
const formMessage = document.getElementById('formMessage');
const sourceLink = document.getElementById('sourceLink');

const chartCpuSelect = document.getElementById('chartCpuSelect');
const chartCanvas = document.getElementById('priceChart');
const chartMessage = document.getElementById('chartMessage');

let lastItems = [];
let priceChart = null;

const searchInput = document.getElementById('searchInput');
const rowsEl = document.getElementById('rows');
const countEl = document.getElementById('count');

function setMessage(text, type) {
  formMessage.textContent = text;
  formMessage.dataset.type = type || '';
}

function setSourceLink(url, text) {
  if (!url) {
    sourceLink.hidden = true;
    sourceLink.href = '#';
    sourceLink.textContent = '';
    return;
  }

  sourceLink.hidden = false;
  sourceLink.href = url;
  sourceLink.textContent = text || url;
}

function setChartMessage(text, type) {
  chartMessage.textContent = text;
  chartMessage.dataset.type = type || '';
}

function escapeText(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function fetchPrices() {
  const q = searchInput.value.trim();
  const url = q ? `/api/prices?q=${encodeURIComponent(q)}` : '/api/prices';

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`讀取失敗 (${res.status})`);
  }

  return res.json();
}

async function fetchPchomePrice(query) {
  const url = `/api/pchome-price?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = data && data.error ? data.error : `抓價失敗 (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

function renderRows(items) {
  rowsEl.innerHTML = '';

  const fragment = document.createDocumentFragment();

  for (const item of items) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeText(item.date)}</td>
      <td>${escapeText(item.name)}</td>
      <td class="num">${escapeText(item.price)}</td>
    `;
    fragment.appendChild(tr);
  }

  rowsEl.appendChild(fragment);
  countEl.textContent = `共 ${items.length} 筆`;
}

function ensureChartCpuOptions() {
  if (!chartCpuSelect) {
    return;
  }

  if (chartCpuSelect.options && chartCpuSelect.options.length > 0) {
    return;
  }

  chartCpuSelect.innerHTML = cpuSelect.innerHTML;
  chartCpuSelect.value = cpuSelect.value;
}

function getSelectedChartCpu() {
  ensureChartCpuOptions();
  const value = chartCpuSelect && chartCpuSelect.value ? chartCpuSelect.value : cpuSelect.value;
  return String(value);
}

function buildSeries(items, cpuName) {
  const points = items
    .filter((item) => item.name === cpuName)
    .slice()
    .sort((a, b) => {
      const dateCmp = String(a.date).localeCompare(String(b.date));
      if (dateCmp !== 0) {
        return dateCmp;
      }
      return Number(a.id) - Number(b.id);
    });

  return {
    labels: points.map((p) => p.date),
    data: points.map((p) => p.price),
  };
}

function destroyChart() {
  if (priceChart) {
    priceChart.destroy();
    priceChart = null;
  }
}

function renderChart(items) {
  if (!chartCanvas) {
    return;
  }

  if (typeof Chart !== 'function') {
    setChartMessage('折線圖套件載入失敗（請確認網路或重整頁面）。', 'error');
    destroyChart();
    return;
  }

  const cpuName = getSelectedChartCpu();
  const series = buildSeries(items, cpuName);

  if (!series.labels.length) {
    setChartMessage('目前沒有可分析的資料，請先新增紀錄。', 'error');
    destroyChart();
    return;
  }

  setChartMessage('', '');

  const baseColor = getComputedStyle(document.body).color;

  if (priceChart) {
    priceChart.data.labels = series.labels;
    priceChart.data.datasets[0].label = cpuName;
    priceChart.data.datasets[0].data = series.data;
    priceChart.data.datasets[0].borderColor = baseColor;
    priceChart.data.datasets[0].pointBackgroundColor = baseColor;
    priceChart.update();
    return;
  }

  priceChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [
        {
          label: cpuName,
          data: series.data,
          borderColor: baseColor,
          pointBackgroundColor: baseColor,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
      },
      scales: {
        x: {
          ticks: { maxRotation: 0, autoSkip: true },
        },
      },
    },
  });
}

async function reload() {
  const items = await fetchPrices();
  lastItems = items;
  renderRows(items);
  renderChart(items);
}

function todayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  setMessage('', '');
  setSourceLink('', '');

  const date = dateInput.value;
  const name = cpuSelect.value;
  const price = Number(priceInput.value);

  try {
    const res = await fetch('/api/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, name, price }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const message = data && data.error ? data.error : `新增失敗 (${res.status})`;
      setMessage(message, 'error');
      return;
    }

    priceInput.value = '';
    setMessage('已新增一筆資料。', 'ok');

    await reload();
  } catch (error) {
    setMessage(error.message || '新增失敗', 'error');
  }
});

fetchPriceBtn.addEventListener('click', async () => {
  const query = cpuSelect.value;

  setMessage('抓取中...', '');
  setSourceLink('', '');

  fetchPriceBtn.disabled = true;
  try {
    const data = await fetchPchomePrice(query);
    priceInput.value = Number(data.price);
    setMessage(`已抓到價格：NT$ ${data.price}`, 'ok');
    setSourceLink(data.url, '查看 PChome 商品頁');
  } catch (error) {
    setMessage(error.message || '抓價失敗', 'error');
  } finally {
    fetchPriceBtn.disabled = false;
  }
});

let searchTimer = null;
searchInput.addEventListener('input', () => {
  if (searchTimer) {
    window.clearTimeout(searchTimer);
  }

  searchTimer = window.setTimeout(() => {
    reload().catch(() => {
      // ignore
    });
  }, 200);
});

if (chartCpuSelect) {
  chartCpuSelect.addEventListener('change', () => {
    renderChart(lastItems);
  });
}

(function init() {
  if (!dateInput.value) {
    dateInput.value = todayISO();
  }

  ensureChartCpuOptions();

  reload().catch(() => {
    setMessage('無法載入清單，請確認後端已啟動。', 'error');
  });
})();
