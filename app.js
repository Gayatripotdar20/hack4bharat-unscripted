
const content = document.getElementById('pageContent');
const crumb = document.getElementById('crumb');
const toastEl = document.getElementById('toast');

let toastTimer;
let cart = [];

let products = [
  {name:'Parle-G Gold',category:'Biscuits · 100g',price:10,stock:12,status:'Low stock',emoji:'🍪'},
  {name:'Fortune Sunflower Oil',category:'Edible oil · 1L',price:145,stock:8,status:'Critical',emoji:'🫗'},
  {name:'Nandini Toned Milk',category:'Dairy · 500ml',price:24,stock:34,status:'Healthy',emoji:'🥛'},
  {name:'Mysore Sandal Soap',category:'Personal care · 75g',price:42,stock:26,status:'Healthy',emoji:'🧼'},
  {name:'Tata Salt',category:'Grocery · 1kg',price:28,stock:41,status:'Healthy',emoji:'🧂'},
  {name:'Aashirvaad Atta',category:'Flour · 5kg',price:265,stock:6,status:'Low stock',emoji:'🌾'}
];

const pages = {
  home: 'Overview',
  pos:'Sales / POS',
  inventory:'Inventory',
  movement:'Stock movement',
  procurement:'AI procurement',
  khata:'Khata ledger',
  assistant:'Talk to Saathi',
  settings:'Settings'
};

function toast(message){
  toastEl.textContent=message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2600);
}

function money(n){
  return '₹'+Number(n).toLocaleString('en-IN');
}

function go(page){
  if(!pages[page]) return;

  document.querySelectorAll('.nav-item[data-page]').forEach(b=>
    b.classList.toggle('active',b.dataset.page===page)
  );

  crumb.textContent=pages[page];
  document.getElementById('sidebar').classList.remove('open');

  if(page==='home') renderHome();
  else if(page==='pos') renderPOS();
  else if(page==='inventory') renderInventory();
  else if(page==='movement') renderMovement();
  else if(page==='procurement') renderProcurement();
  else if(page==='khata') renderKhata();
  else if(page==='assistant') renderAssistant();
  else renderSettings();
}

function title(kicker,title,desc,action=''){
  return `
    <div class="page-title">
      <div>
        <div class="eyebrow">${kicker}</div>
        <h1>${title}</h1>
        <p>${desc}</p>
      </div>
      ${action}
    </div>`;
}

function renderHome(){
  location.reload();
}

/* INVENTORY */

function renderInventory(){

  content.innerHTML=title(
    'STORE RECORDS',
    'Inventory',
    'All your products in one place. Keep quantities and expiry dates up to date.',
    '<button class="btn btn-primary" id="addProduct">＋ Add product</button>'
  )+

  `<div class="screen-card">
    <div class="panel-heading">
      <div>
        <h3>Product catalogue</h3>
        <p>Sample store inventory · ${products.length} products shown</p>
      </div>
      <input id="inventorySearch" placeholder="Search products..."
        style="border:1px solid #e5ebe5;border-radius:7px;padding:8px;font-size:10px;max-width:180px">
    </div>

    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>SELLING PRICE</th>
            <th>AVAILABLE</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody id="inventoryRows">${inventoryRows(products)}</tbody>
      </table>
    </div>
  </div>`;

  document.getElementById('inventorySearch').addEventListener('input',e=>{
    document.getElementById('inventoryRows').innerHTML=
      inventoryRows(products.filter(p=>
        p.name.toLowerCase().includes(e.target.value.toLowerCase())
      ));
  });

  document.getElementById('addProduct').onclick=()=>{
    const name=prompt('Product name?');
    if(!name)return;

    const price=Number(prompt('Selling price (₹)?','20'));
    if(!price)return;

    products.push({
      name,
      category:'New item',
      price,
      stock:0,
      status:'Low stock',
      emoji:'📦'
    });

    renderInventory();
    toast('Product added to demo inventory');
  };
}

function inventoryRows(items){

  return items.map((p,i)=>`
    <tr>
      <td>
        <strong>${p.emoji} ${p.name}</strong><br>
        <small>${p.category}</small>
      </td>
      <td>${money(p.price)}</td>
      <td>${p.stock} units</td>
      <td>
        <span class="pill ${
          p.stock<10?'pill-red':
          p.stock<20?'pill-yellow':'pill-green'
        }">
          ${p.stock<10?'Critical':
            p.stock<20?'Low stock':'Healthy'}
        </span>
      </td>
      <td>
        <button class="small-btn" onclick="adjustStock(${products.indexOf(p)})">
          Adjust
        </button>
      </td>
    </tr>
  `).join('') ||
  '<tr><td colspan="5" class="empty-note">No products found.</td></tr>';
}

function adjustStock(i){

  const amount=Number(prompt('Enter stock quantity to add:', '10'));

  if(!amount||amount<0)return;

  products[i].stock+=amount;

  products[i].status=
    products[i].stock<10?'Critical':
    products[i].stock<20?'Low stock':'Healthy';

  renderInventory();
  toast('Stock quantity updated');
}

/* SALES / POS */

function renderPOS(){

  cart=[];

  content.innerHTML=title(
    'QUICK BILLING',
    'Sales / POS',
    'Tap a product to add it to the current bill. This demo uses sample prices.'
  )+

  `<div class="screen-grid">

    <section class="screen-card">
      <h3>Quick products</h3>
      <p>Frequently sold items · Tap to add</p>

      <div class="product-grid">
        ${products.map((p,i)=>`
          <button class="product-tile" onclick="addCart(${i})">
            <span class="tile-emoji">${p.emoji}</span>
            <strong>${p.name}</strong>
            <small>${money(p.price)} · ${p.stock} in stock</small>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="screen-card">
      <h3>Current bill</h3>
      <p>New sale · Walk-in customer</p>

      <div class="field">
        <label>CUSTOMER</label>
        <input id="customer" placeholder="Walk-in customer">
      </div>

      <div id="cartLines">
        <div class="empty-note">
          No items added yet. Choose products to start a bill.
        </div>
      </div>

      <div class="cart-total">
        <span>Total</span>
        <span id="cartTotal">₹0</span>
      </div>

      <button class="btn btn-primary" style="width:100%" onclick="completeSale()">
        Complete sale →
      </button>

      <p class="muted-note" style="margin-top:10px">
        Demo only: no payment is collected.
      </p>
    </section>

  </div>`;
}

function addCart(i){

  const p=products[i];
  const found=cart.find(x=>x.i===i);

  if(found)found.qty++;
  else cart.push({i,qty:1});

  drawCart();
  toast(p.name+' added');
}

function drawCart(){

  const el=document.getElementById('cartLines');
  if(!el)return;

  el.innerHTML=cart.length?
    cart.map(x=>`
      <div class="cart-line">
        <div>
          <strong>${products[x.i].name}</strong>
          <small>${money(products[x.i].price)} × ${x.qty}</small>
        </div>
        <div>
          <strong>${money(products[x.i].price*x.qty)}</strong>
          <button class="small-btn" onclick="removeCart(${x.i})">−</button>
        </div>
      </div>
    `).join(''):
    '<div class="empty-note">No items added yet.</div>';

  document.getElementById('cartTotal').textContent=
    money(cart.reduce((s,x)=>
      s+products[x.i].price*x.qty,0
    ));
}

function removeCart(i){

  const x=cart.find(x=>x.i===i);

  if(x){
    x.qty--;
    if(!x.qty)cart=cart.filter(y=>y.i!==i);
  }

  drawCart();
}

function completeSale(){

  if(!cart.length){
    toast('Add at least one product first');
    return;
  }

  cart.forEach(x=>
    products[x.i].stock=Math.max(0,products[x.i].stock-x.qty)
  );

  cart=[];

  renderPOS();
  toast('Sale recorded in this demo session');
}

/* STOCK MOVEMENT */

function renderMovement(){

  content.innerHTML=title(
    'INVENTORY INTELLIGENCE',
    'Stock movement',
    'Understand what is moving, what is sitting and what may expire.'
  )+

  `<div class="stats-grid">

    <article class="stat-card">
      <div class="stat-top">Fast movers <span class="stat-icon green">↗</span></div>
      <div class="stat-value">18</div>
      <div class="stat-foot">Selling faster than usual</div>
    </article>

    <article class="stat-card">
      <div class="stat-top">Slow movers <span class="stat-icon amber">→</span></div>
      <div class="stat-value">12</div>
      <div class="stat-foot">Review next purchase quantity</div>
    </article>

    <article class="stat-card">
      <div class="stat-top">Dead stock <span class="stat-icon red">!</span></div>
      <div class="stat-value">04</div>
      <div class="stat-foot">No sale recorded in 30 days</div>
    </article>

    <article class="stat-card">
      <div class="stat-top">Near expiry <span class="stat-icon blue">◷</span></div>
      <div class="stat-value">05</div>
      <div class="stat-foot">Within next 7 days</div>
    </article>

  </div>

  <div class="screen-card">
    <h3>Items that need a closer look</h3>
    <p>Illustrative classifications based on sample sales and batch data.</p>

    <table class="data-table">
      <thead>
        <tr>
          <th>ITEM</th>
          <th>DAILY MOVEMENT</th>
          <th>DAYS OF COVER</th>
          <th>INSIGHT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Parle-G Gold</strong></td>
          <td>12 packs/day</td>
          <td>1 day</td>
          <td><span class="pill pill-red">Restock soon</span></td>
        </tr>
        <tr>
          <td><strong>Fortune Sunflower Oil</strong></td>
          <td>5 bottles/day</td>
          <td>2 days</td>
          <td><span class="pill pill-red">Stockout risk</span></td>
        </tr>
        <tr>
          <td><strong>Mysore Sandal Soap</strong></td>
          <td>2 bars/day</td>
          <td>13 days</td>
          <td><span class="pill pill-green">Healthy</span></td>
        </tr>
        <tr>
          <td><strong>Old snack batch</strong></td>
          <td>0 packs/day</td>
          <td>—</td>
          <td><span class="pill pill-yellow">Expiry in 5 days</span></td>
        </tr>
      </tbody>
    </table>
  </div>`;
}

/* AI PROCUREMENT */

function renderProcurement(){

  content.innerHTML=title(
    'SMART PURCHASING',
    'AI procurement assistant',
    'A prioritised purchase list with the reason behind every recommendation.'
  )+

  `<div class="screen-grid">

    <section class="screen-card">
      <div class="panel-heading">
        <div>
          <h3>Today's suggested order</h3>
          <p>Generated from sample sales, stock and demand signals</p>
        </div>
        <span class="pill pill-green">3 suggestions</span>
      </div>

      <div class="recommendation">
        <div>
          <strong>Parle-G Gold <span class="pill pill-red">High priority</span></strong>
          <div class="reason">
            Current stock: 12 packs · Estimated demand: 40 packs for the next 7 days.
            Stock may run out in about 2 days.
          </div>
          <div class="recommendation-actions">
            <button class="small-btn approve" onclick="decision('Parle-G Gold','approved')">✓ Approve</button>
            <button class="small-btn" onclick="editQty('Parle-G Gold',40)">Edit quantity</button>
            <button class="small-btn" onclick="decision('Parle-G Gold','rejected')">Reject</button>
          </div>
        </div>
        <div><strong>40 packs</strong><small>₹400</small></div>
      </div>

      <div class="recommendation">
        <div>
          <strong>Fortune Sunflower Oil <span class="pill pill-yellow">Medium</span></strong>
          <div class="reason">
            Current stock: 8 bottles · Demand is steady.
            Suggested quantity covers the next 7 days.
          </div>
          <div class="recommendation-actions">
            <button class="small-btn approve" onclick="decision('Fortune Sunflower Oil','approved')">✓ Approve</button>
            <button class="small-btn" onclick="editQty('Fortune Sunflower Oil',15)">Edit quantity</button>
            <button class="small-btn" onclick="decision('Fortune Sunflower Oil','rejected')">Reject</button>
          </div>
        </div>
        <div><strong>15 bottles</strong><small>₹2,175</small></div>
      </div>

      <div class="recommendation">
        <div>
          <strong>Nandini Toned Milk <span class="pill pill-yellow">Review</span></strong>
          <div class="reason">
            Current stock is healthy. Consider a smaller top-up due to short shelf life.
          </div>
          <div class="recommendation-actions">
            <button class="small-btn approve" onclick="decision('Nandini Toned Milk','approved')">✓ Approve</button>
            <button class="small-btn" onclick="editQty('Nandini Toned Milk',10)">Edit quantity</button>
            <button class="small-btn" onclick="decision('Nandini Toned Milk','rejected')">Reject</button>
          </div>
        </div>
        <div><strong>10 packs</strong><small>₹240</small></div>
      </div>

      <p class="muted-note">
        Recommendations are illustrative. No order is sent from this demo.
      </p>
    </section>

    <aside>
      <div class="budget-box">
        <div class="budget-row">
          <strong>Purchase budget</strong>
          <strong>₹3,000</strong>
        </div>
        <div class="budget-bar"><span style="width:94%"></span></div>
        <div class="budget-row">
          <span class="muted-note">Suggested total: ₹2,815</span>
          <span class="pill pill-green">Within budget</span>
        </div>
      </div>

      <div class="screen-card">
        <h3>Why this recommendation?</h3>
        <p>Saathi combines multiple signals before suggesting a purchase.</p>

        <div class="recommendation">
          <div><strong>Sales history</strong><small>Recent product movement</small></div>
          <span>✓</span>
        </div>

        <div class="recommendation">
          <div><strong>Current inventory</strong><small>Available stock and batches</small></div>
          <span>✓</span>
        </div>

        <div class="recommendation">
          <div><strong>Budget check</strong><small>Owner-set spending limit</small></div>
          <span>✓</span>
        </div>

        <div class="recommendation">
          <div><strong>Owner approval</strong><small>Required before any order</small></div>
          <span>🔒</span>
        </div>
      </div>
    </aside>

  </div>

  <div class="screen-card">
    <h3>Decision history</h3>
    <p>Owner actions are logged for accountability.</p>
    <div id="decisionLog" class="empty-note">
      No decisions made in this demo session yet.
    </div>
  </div>`;
}

function decision(item,status){

  const log=document.getElementById('decisionLog');

  if(log){
    if(log.classList.contains('empty-note')){
      log.classList.remove('empty-note');
    }

    log.innerHTML=`
      <div class="recommendation">
        <div>
          <strong>${item}</strong>
          <small>Owner decision recorded just now</small>
        </div>
        <span class="pill ${status==='approved'?'pill-green':'pill-red'}">
          ${status.toUpperCase()}
        </span>
      </div>`;
  }

  toast(item+' '+status+'. Demo decision logged.');
}

function editQty(item,qty){

  const n=prompt('Edit suggested quantity for '+item,qty);

  if(n!==null&&Number(n)>0){
    toast('Updated '+item+' quantity to '+n+' (demo only)');
  }
}

/* KHATA LEDGER */

function renderKhata(){

  content.innerHTML=title(
    'CUSTOMER RECORDS',
    'Khata ledger',
    'Keep track of credit sales and customer payments.'
  )+

  `<div class="stats-grid">

    <article class="stat-card">
      <div class="stat-top">Total credit outstanding</div>
      <div class="stat-value">₹12,450</div>
      <div class="stat-foot">Across 18 customers</div>
    </article>

    <article class="stat-card">
      <div class="stat-top">Collected this month</div>
      <div class="stat-value">₹8,200</div>
      <div class="stat-foot"><span class="positive">↗ 6.2%</span> vs last month</div>
    </article>

    <article class="stat-card">
      <div class="stat-top">Overdue balances</div>
      <div class="stat-value">₹2,100</div>
      <div class="stat-foot">Needs a friendly reminder</div>
    </article>

    <article class="stat-card">
      <div class="stat-top">Active customers</div>
      <div class="stat-value">18</div>
      <div class="stat-foot">With a credit balance</div>
    </article>

  </div>

  <div class="screen-card">
    <div class="panel-heading">
      <div>
        <h3>Customer balances</h3>
        <p>Sample customer records</p>
      </div>
      <button class="btn btn-primary" onclick="toast('Add customer form is a future enhancement')">
        ＋ Add customer
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>CUSTOMER</th>
          <th>PHONE</th>
          <th>OUTSTANDING</th>
          <th>LAST PAYMENT</th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Ramesh Kumar</strong></td>
          <td>••••• 2481</td>
          <td>₹1,250</td>
          <td>18 Nov</td>
          <td><span class="pill pill-yellow">Due soon</span></td>
        </tr>
        <tr>
          <td><strong>Shabana Begum</strong></td>
          <td>••••• 1092</td>
          <td>₹650</td>
          <td>16 Nov</td>
          <td><span class="pill pill-green">On track</span></td>
        </tr>
        <tr>
          <td><strong>Arun Kumar</strong></td>
          <td>••••• 7720</td>
          <td>₹2,100</td>
          <td>02 Nov</td>
          <td><span class="pill pill-red">Overdue</span></td>
        </tr>
      </tbody>
    </table>
  </div>`;
}

/* SAATHI ASSISTANT */

function renderAssistant(){

  content.innerHTML=title(
    'YOUR STORE COMPANION',
    'Talk to Saathi',
    'Ask everyday shop questions in simple language. This is a scripted demo assistant.'
  )+

  `<div class="screen-card" style="max-width:760px">

    <div class="chat-box" id="chatBox">
      <div class="chat-bubble">
        <strong>Namaste, Mustafa! 👋</strong><br>
        I'm Saathi. I can help you understand stock, spot items that need attention
        and review purchase suggestions. Try asking me one of these:
      </div>

      <div class="chat-bubble">
        Which items should I restock today?
      </div>

      <div class="chat-bubble">
        How much stock is near expiry?
      </div>
    </div>

    <div class="chat-input">
      <input id="chatInput" placeholder="Ask Saathi about your store...">
      <button class="btn btn-primary" id="sendChat">Send</button>
    </div>

    <p class="muted-note">
      Demo assistant: responses are predefined and are not generated by a live AI model.
    </p>

  </div>`;

  document.getElementById('sendChat').onclick=sendChat;

  document.getElementById('chatInput').addEventListener('keydown',e=>{
    if(e.key==='Enter')sendChat();
  });
}

function sendChat(){

  const input=document.getElementById('chatInput');
  const q=input.value.trim();

  if(!q)return;

  const box=document.getElementById('chatBox');

  box.innerHTML+=`
    <div class="chat-bubble" style="margin-left:auto;background:#eaf5ed;border-color:#dcecdf">
      ${escapeHtml(q)}
    </div>`;

  let answer='I can help you review your stock. Open the Inventory or AI procurement page to explore the sample records.';

  if(/restock|buy|purchase/i.test(q)){
    answer='Parle-G Gold and Fortune Sunflower Oil need attention first. Your sample purchase suggestions total ₹2,815, within the illustrative ₹3,000 budget. Please review and approve each item yourself.';
  }

  if(/expir|waste/i.test(q)){
    answer='There are 5 sample batches nearing expiry within 7 days, with an illustrative value of ₹1,240. Check the Stock movement page to review them.';
  }

  box.innerHTML+=`
    <div class="chat-bubble">
      <strong>Saathi ✦</strong><br>${answer}
    </div>`;

  input.value='';
  box.scrollTop=box.scrollHeight;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[c]));
}

/* SETTINGS */

function renderSettings(){

  content.innerHTML=title(
    'PREFERENCES',
    'Store settings',
    'Set the rules Saathi should follow when helping your store.'
  )+

  `<div class="screen-card" style="max-width:720px">

    <h3>Store profile</h3>

    <div class="field">
      <label>STORE NAME</label>
      <input value="Sri Krishna Stores">
    </div>

    <div class="field">
      <label>OWNER NAME</label>
      <input value="Mustafa Shaik">
    </div>

    <div class="field">
      <label>DAILY PURCHASE BUDGET (₹)</label>
      <input type="number" value="3000">
    </div>

    <div class="field">
      <label>LOW STOCK ALERT THRESHOLD</label>
      <input type="number" value="10">
    </div>

    <button class="btn btn-primary" onclick="toast('Settings saved for this demo view')">
      Save preferences
    </button>

    <p class="muted-note" style="margin-top:12px">
      These settings are not persisted to a server in this prototype.
    </p>

  </div>`;
}

/* GLOBAL EVENT LISTENERS */

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-page]');
  if(b)go(b.dataset.page);
});

document.getElementById('mobileMenu').addEventListener('click',()=>{
  document.getElementById('sidebar').classList.toggle('open');
});

document.getElementById('notifyBtn').addEventListener('click',()=>{
  toast('You have 3 stock alerts to review.');
});

document.getElementById('salesRange').addEventListener('change',e=>{
  toast('Showing sample sales for '+e.target.value.toLowerCase()+'.');
});
