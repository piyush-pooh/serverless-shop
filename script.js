(() => {
  const $ = id => document.getElementById(id);

  const STORAGE_KEY = 'serverless-shop-items-final';
  let items = [];

  // DOM refs
  const grid = $('grid');
  const emptyState = $('emptyState');
  const fetchDataBtn = $('fetchDataBtn');
  const awsOutput = $('awsOutput');
  const clearStorageBtn = $('clearStorageBtn');

  const API_BASE = 'https://2j2cydoqi9.execute-api.us-east-1.amazonaws.com/prod';

  function defaultItems() {
    const now = Date.now();
    return [
      { id: 'svc-lambda', title: 'AWS Lambda', description: 'Serverless compute that runs your functions on demand.', price: 0.00, tag: 'compute', image: 'assets/lambda.svg', createdAt: now - 40000 },
      { id: 'svc-apigw', title: 'API Gateway', description: 'Managed API front door for your serverless endpoints.', price: 0.00, tag: 'api', image: 'assets/api-gateway.svg', createdAt: now - 30000 },
      { id: 'svc-dynamodb', title: 'DynamoDB', description: 'Serverless NoSQL database for high-scale workloads.', price: 0.00, tag: 'database', image: 'assets/dynamodb.svg', createdAt: now - 20000 },
      { id: 'svc-s3', title: 'Amazon S3', description: 'Object storage for assets, logs, and static hosting.', price: 0.00, tag: 'storage', image: 'assets/s3.svg', createdAt: now - 10000 }
    ];
  }

  function init() {
    loadFromStorage();
    bindUI();
    render();
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      items = raw ? JSON.parse(raw) : defaultItems();
    } catch (e) {
      items = defaultItems();
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function bindUI() {
    fetchDataBtn && fetchDataBtn.addEventListener('click', handleAwsFetch);
    clearStorageBtn && clearStorageBtn.addEventListener('click', handleClearStorage);
  }

  function handleAwsFetch() {
    awsOutput.innerHTML = '⏳ Fetching Products and Orders from AWS...';

    Promise.all([
      fetch(`${API_BASE}/Products`).then(res => res.ok ? res.json() : Promise.reject(`Products HTTP ${res.status}`)),
      fetch(`${API_BASE}/Order`).then(res => res.ok ? res.json() : Promise.reject(`Order HTTP ${res.status}`))
    ])
    .then(([products, orders]) => {
      console.log('Products:', products);
      console.log('Orders:', orders);
      awsOutput.innerHTML = '✅ Fetched Products and Orders from AWS!';

      // Merge orders into products if needed, or just render products
      renderProducts(products);
    })
    .catch(err => {
      console.error(err);
      awsOutput.innerHTML = '❌ Error fetching from AWS.';
    });
  }

  function renderProducts(list) {
    if (!grid) return;
    grid.innerHTML = '';
    if (!list.length) {
      emptyState.style.display = 'block';
      return;
    } else {
      emptyState.style.display = 'none';
    }

    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <h3>${item.name || item.title}</h3>
        <p>Price: $${item.price != null ? item.price : '0.00'}</p>
        <p>Product ID: ${item.product_id || item.id}</p>
      `;
      grid.appendChild(el);
    });
  }

  function handleClearStorage() {
    if (!confirm('Reset demo data? This removes local data.')) return;
    localStorage.removeItem(STORAGE_KEY);
    items = defaultItems();
    render();
    awsOutput.innerHTML = 'Local demo data reset.';
  }

  function render() {
    renderProducts(items);
  }

  init();
})();
