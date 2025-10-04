(() => {
  const $ = id => document.getElementById(id);

  const STORAGE_KEY = 'serverless-shop-items-final';
  let items = [];

  // DOM refs
  const grid = $('grid');
  const emptyState = $('emptyState');
  const openAddPanel = $('openAddPanel');
  const panel = $('panel');
  const panelTitle = $('panelTitle');
  const closePanel = $('closePanel');

  const itemForm = $('itemForm');
  const itemImage = $('itemImage');
  const itemTitle = $('itemTitle');
  const itemDesc = $('itemDesc');
  const itemPrice = $('itemPrice');
  const itemTag = $('itemTag');
  const saveItemBtn = $('saveItemBtn');
  const cancelItemBtn = $('cancelItemBtn');

  const searchInput = $('searchInput');
  const sortSelect = $('sortSelect');
  const submitBtn = $('submitBtn');
  const userInput = $('userInput');
  const output = $('output');

  const fetchDataBtn = $('fetchDataBtn');
  const awsOutput = $('awsOutput');
  const clearStorageBtn = $('clearStorageBtn');

  let editingId = null;

  // default items: the four AWS services with local asset image names and one-line descriptions
  function defaultItems() {
    const now = Date.now();
    return [
      {
        id: 'svc-lambda',
        title: 'AWS Lambda',
        description: 'Serverless compute that runs your functions on demand.',
        price: 0.00,
        tag: 'compute',
        image: 'assets/lambda.svg',
        createdAt: now - 40000
      },
      {
        id: 'svc-apigw',
        title: 'API Gateway',
        description: 'Managed API front door for your serverless endpoints.',
        price: 0.00,
        tag: 'api',
        image: 'assets/api-gateway.svg',
        createdAt: now - 30000
      },
      {
        id: 'svc-dynamodb',
        title: 'DynamoDB',
        description: 'Serverless NoSQL database for high-scale workloads.',
        price: 0.00,
        tag: 'database',
        image: 'assets/dynamodb.svg',
        createdAt: now - 20000
      },
      {
        id: 'svc-s3',
        title: 'Amazon S3',
        description: 'Object storage for assets, logs, and static hosting.',
        price: 0.00,
        tag: 'storage',
        image: 'assets/s3.svg',
        createdAt: now - 10000
      }
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
    openAddPanel && openAddPanel.addEventListener('click', () => openPanel());
    closePanel && closePanel.addEventListener('click', closePanelFn);
    cancelItemBtn && cancelItemBtn.addEventListener('click', (e) => { e.preventDefault(); closePanelFn(); });
    itemForm && itemForm.addEventListener('submit', handleFormSubmit);

    searchInput && searchInput.addEventListener('input', debounce(180, render));
    sortSelect && sortSelect.addEventListener('change', render);

    submitBtn && submitBtn.addEventListener('click', handleUserSubmit);
    fetchDataBtn && fetchDataBtn.addEventListener('click', handleAwsFetch);
    clearStorageBtn && clearStorageBtn.addEventListener('click', handleClearStorage);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel && panel.getAttribute('aria-hidden') === 'false') {
        closePanelFn();
      }
    });
  }

  function openPanel(item = null) {
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'false');
    panel.style.display = 'block';
    if (item) {
      panelTitle.textContent = 'Edit Item';
      itemImage.value = item.image || '';
      itemTitle.value = item.title;
      itemDesc.value = item.description || '';
      itemPrice.value = item.price != null ? item.price : '';
      itemTag.value = item.tag || '';
      editingId = item.id;
    } else {
      panelTitle.textContent = 'Add Item';
      itemForm.reset();
      editingId = null;
    }
    setTimeout(() => itemImage.focus(), 120);
  }
  function closePanelFn() {
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'true');
    panel.style.display = 'none';
    editingId = null;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const title = itemTitle.value.trim();
    if (!title) { alert('Title required'); itemTitle.focus(); return; }
    const description = itemDesc.value.trim();
    const price = parseFloat(itemPrice.value) || 0;
    const tag = itemTag.value.trim();
    const image = itemImage.value.trim(); // can be external URL or left blank to use a local default

    if (editingId) {
      const idx = items.findIndex(it => it.id === editingId);
      if (idx >= 0) {
        items[idx] = {...items[idx], title, description, price, tag, image};
        saveToStorage();
        render();
      }
    } else {
      const newItem = { id: 'i-' + Date.now(), title, description, price, tag, image, createdAt: Date.now() };
      items.unshift(newItem);
      saveToStorage();
      render();
    }
    closePanelFn();
  }

  function deleteItem(id) {
    items = items.filter(it => it.id !== id);
    saveToStorage();
    render();
  }
  function editItem(id) {
    const it = items.find(x => x.id === id);
    if (it) openPanel(it);
  }

  function render() {
    if (!grid) return;
    const filtered = applySearch(items);
    const sorted = applySort(filtered);

    grid.innerHTML = '';
    if (!sorted.length) {
      emptyState.style.display = 'block';
      return;
    } else {
      emptyState.style.display = 'none';
    }

    sorted.forEach(it => {
      const card = buildCard(it);
      grid.appendChild(card);
    });
  }

  function applySearch(list) {
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (!q) return list.slice();
    return list.filter(it => (
      it.title.toLowerCase().includes(q) ||
      (it.description && it.description.toLowerCase().includes(q)) ||
      (it.tag && it.tag.toLowerCase().includes(q))
    ));
  }

  function applySort(list) {
    const sel = sortSelect ? sortSelect.value : 'newest';
    const copy = list.slice();
    if (sel === 'newest') copy.sort((a,b) => b.createdAt - a.createdAt);
    else if (sel === 'oldest') copy.sort((a,b) => a.createdAt - b.createdAt);
    else if (sel === 'title-asc') copy.sort((a,b) => a.title.localeCompare(b.title));
    else if (sel === 'title-desc') copy.sort((a,b) => b.title.localeCompare(a.title));
    return copy;
  }

  function buildCard(item) {
    const el = document.createElement('article');
    el.className = 'card';
    el.setAttribute('role','listitem');

    // logo
    if (item.image) {
      const img = document.createElement('img');
      img.className = 'logo';
      img.src = item.image;
      img.alt = item.title + ' logo';
      // on error (missing file), show placeholder background
      img.onerror = () => {
        img.style.display = 'none';
        const p = document.createElement('div');
        p.className = 'logo-placeholder';
        p.textContent = item.title;
        el.insertBefore(p, el.firstChild);
      };
      el.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'logo-placeholder';
      ph.textContent = item.title;
      el.appendChild(ph);
    }

    // content
    const content = document.createElement('div');
    content.className = 'card-content';
    const h3 = document.createElement('h3'); h3.textContent = item.title;
    const p = document.createElement('p'); p.textContent = item.description || '';
    const meta = document.createElement('div'); meta.className = 'card-meta';
    meta.textContent = `${item.tag ? item.tag + ' • ' : ''}${formatPrice(item.price)}`;

    content.appendChild(h3);
    content.appendChild(p);
    content.appendChild(meta);
    el.appendChild(content);

    // actions
    const actions = document.createElement('div'); actions.className = 'card-actions';
    const btnView = document.createElement('button'); btnView.className='btn btn-ghost'; btnView.textContent='View';
    btnView.addEventListener('click', () => {
      alert(`Title: ${item.title}\n\n${item.description || '—'}\n\nPrice: ${formatPrice(item.price)}`);
    });

    const btnEdit = document.createElement('button'); btnEdit.className='btn'; btnEdit.textContent='Edit';
    btnEdit.addEventListener('click', () => editItem(item.id));

    const btnRemove = document.createElement('button'); btnRemove.className='btn btn-danger'; btnRemove.textContent='Remove';
    btnRemove.addEventListener('click', () => {
      if (confirm(`Delete "${item.title}"?`)) deleteItem(item.id);
    });

    actions.appendChild(btnView);
    actions.appendChild(btnEdit);
    actions.appendChild(btnRemove);

    el.appendChild(actions);
    return el;
  }

  function formatPrice(n) {
    if (n == null) return '—';
    return `$${Number(n).toFixed(2)}`;
  }

  function debounce(ms, fn) {
    let t = null;
    return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this,args), ms); };
  }

  function handleUserSubmit() {
    const v = userInput ? userInput.value.trim() : '';
    if (!v) output.innerHTML = '⚠️ Please type something.';
    else { output.innerHTML = `✅ You typed: <strong>${escapeHtml(v)}</strong>`; userInput.value=''; }
  }

  function handleAwsFetch() {
    awsOutput.innerHTML = '⏳ Simulating AWS fetch…';
    setTimeout(() => { awsOutput.innerHTML = '✅ (Simulated) AWS fetch completed.'; }, 900);
  }

  function handleClearStorage() {
    if (!confirm('Reset demo data? This removes local data.')) return;
    localStorage.removeItem(STORAGE_KEY);
    items = defaultItems();
    render();
    awsOutput.innerHTML = 'Local demo data reset.';
  }

  function escapeHtml(s) { return (s+'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  init();
})();
