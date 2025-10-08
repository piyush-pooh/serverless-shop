(() => {
  const $ = id => document.getElementById(id);

  const STORAGE_KEY = 'serverless-shop-items-final';
  let items = [];
  let products = [];
  let orders = [];

  // DOM refs
  const grid = $('grid');               // demo items
  const emptyState = $('emptyState');
  const productGrid = $('productGrid'); // AWS Products
  const productEmpty = $('productEmpty');
  const orderGrid = $('orderGrid');     // AWS Orders
  const orderEmpty = $('orderEmpty');
  const fetchDataBtn = $('fetchDataBtn');
  const awsOutput = $('awsOutput');
  const submitBtn = $('submitBtn');
  const userInput = $('userInput');
  const output = $('output');

  const API_BASE = 'https://2j2cydoqi9.execute-api.us-east-1.amazonaws.com/prod';

  function init() {
    loadFromStorage();
    bindUI();
    render();
    renderProducts();
    renderOrders();
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      items = [];
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function bindUI() {
    fetchDataBtn && fetchDataBtn.addEventListener('click', fetchAwsData);
    submitBtn && submitBtn.addEventListener('click', handleUserSubmit);
  }

  async function fetchAwsData() {
    awsOutput.innerHTML = '⏳ Fetching Products and Orders from AWS…';
    try {
      const prodResp = await fetch(`${API_BASE}/Products`);
      products = await prodResp.json();

      const orderResp = await fetch(`${API_BASE}/Order`);
      orders = await orderResp.json();

      renderProducts();
      renderOrders();

      awsOutput.innerHTML = '✅ Fetched Products and Orders from AWS!';
    } catch (err) {
      console.error(err);
      awsOutput.innerHTML = '❌ Error fetching from AWS.';
    }
  }

  // ---------------- DEMO ITEMS ----------------
  function render() {
    if (!grid) return;
    grid.innerHTML = '';
    if (!items.length) {
      emptyState.style.display = 'block';
      return;
    } else {
      emptyState.style.display = 'none';
    }

    items.forEach(it => {
      const el = document.createElement('div');
      el.textContent = it.title || it.id;
      grid.appendChild(el);
    });
  }

  function handleUserSubmit() {
    const v = userInput ? userInput.value.trim() : '';
    if (!v) output.innerHTML = '⚠️ Please type something.';
    else { output.innerHTML = `✅ You typed: <strong>${escapeHtml(v)}</strong>`; userInput.value=''; }
  }

  function escapeHtml(s) {
    return (s+'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // ---------------- AWS PRODUCTS ----------------
  function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    if (!products.length) {
      productEmpty.style.display = 'block';
      return;
    } else {
      productEmpty.style.display = 'none';
    }

    products.forEach(p => {
      const card = buildCard(p, 'product');
      productGrid.appendChild(card);
    });
  }

  function renderOrders() {
    if (!orderGrid) return;
    orderGrid.innerHTML = '';
    if (!orders.length) {
      orderEmpty.style.display = 'block';
      return;
    } else {
      orderEmpty.style.display = 'none';
    }

    orders.forEach(o => {
      const card = buildCard(o, 'order');
      orderGrid.appendChild(card);
    });
  }

  function buildCard(item, type) {
    const el = document.createElement('article');
    el.className = 'card';

    const content = document.createElement('div');
    content.className = 'card-content';

    const h3 = document.createElement('h3');
    h3.textContent = type === 'product' ? item.name : item.order_id;

    const p = document.createElement('p');
    p.textContent = type === 'product'
      ? item.description || ''
      : `Product ID: ${item.product_id}, Quantity: ${item.quantity}, Status: ${item.status || 'pending'}`;

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = type === 'product'
      ? `$${Number(item.price || 0).toFixed(2)}`
      : `User: ${item.user_id || '-'}`;

    content.appendChild(h3);
    content.appendChild(p);
    content.appendChild(meta);
    el.appendChild(content);

    return el;
  }

  init();
})();
