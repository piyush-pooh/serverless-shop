(() => {
  const $ = id => document.getElementById(id);

  const STORAGE_KEY = 'serverless-shop-items-final';
  let products = [];
  let orders = [];

  // DOM refs
  const productGrid = $('productGrid');
  const productEmpty = $('productEmpty');
  const orderGrid = $('orderGrid');
  const orderEmpty = $('orderEmpty');
  const fetchDataBtn = $('fetchDataBtn');
  const awsOutput = $('awsOutput');

  const API_BASE = 'https://2j2cydoqi9.execute-api.us-east-1.amazonaws.com/prod';

  function init() {
    bindUI();
    renderProducts();
    renderOrders();
  }

  function bindUI() {
    fetchDataBtn && fetchDataBtn.addEventListener('click', fetchAwsData);
  }

  async function fetchAwsData() {
    awsOutput.innerHTML = '⏳ Fetching Products and Orders from AWS…';
    try {
      // Fetch Products
      const prodResp = await fetch(`${API_BASE}/Products`);
      products = await prodResp.json();

      // Fetch Orders
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

  // ---------- PRODUCTS ----------
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

  // ---------- ORDERS ----------
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
    el.setAttribute('role', 'listitem');

    const content = document.createElement('div');
    content.className = 'card-content';

    // Title
    const h3 = document.createElement('h3');
    h3.textContent = type === 'product' ? item.name : item.order_id;

    // Description
    const p = document.createElement('p');
    p.textContent = type === 'product'
      ? item.description || ''
      : `Product ID: ${item.product_id}, Quantity: ${item.quantity}, Status: ${item.status || 'pending'}`;

    // Meta
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
