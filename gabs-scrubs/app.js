const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const state = {
  cart: JSON.parse(localStorage.getItem('gabs_cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('gabs_favorites') || '[]')
};

function saveState(){
  localStorage.setItem('gabs_cart', JSON.stringify(state.cart));
  localStorage.setItem('gabs_favorites', JSON.stringify(state.favorites));
  updateBadges();
}

function updateBadges(){
  const cartQty = state.cart.reduce((n,i)=>n+i.qty,0);
  $$('.cart-badge').forEach(el => el.textContent = cartQty);
  $$('.wish-badge').forEach(el => el.textContent = state.favorites.length);
}

function icon(name){
  const paths={
    search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4.2-4.2"></path>',
    user:'<circle cx="12" cy="8" r="4"></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>',
    bag:'<path d="M5 8h14l-1 13H6L5 8z"></path><path d="M9 10V6a3 3 0 0 1 6 0v4"></path>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"></path>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function productCard(p){
  const fav=state.favorites.includes(p.slug);
  return `<article class="product-card" data-slug="${p.slug}">
    <div class="product-media">
      <a href="produto.html?slug=${p.slug}" aria-label="Ver ${p.name}">
        <img class="primary" src="${p.image}" alt="${p.name}" loading="lazy">
        <img class="secondary" src="${p.image2}" alt="${p.name} em outro ângulo" loading="lazy">
      </a>
      <button class="wish ${fav?'active':''}" type="button" data-favorite="${p.slug}" aria-label="Favoritar ${p.name}">${icon('heart')}</button>
    </div>
    <div class="product-info">
      <div class="product-row">
        <div><a href="produto.html?slug=${p.slug}"><h3 class="product-name">${p.name}</h3></a><div class="fit">${p.fit}</div></div>
        <div><div class="price">${money(p.price)}</div><div class="installments">ou 6x de ${money(p.price/6)}</div></div>
      </div>
      <div class="swatches" aria-label="Cores disponíveis">${p.colors.slice(0,5).map((c,i)=>`<button class="swatch ${i===0?'active':''}" style="--swatch:${c[1]}" title="${c[0]}"></button>`).join('')}</div>
    </div>
  </article>`;
}

function renderBestSellers(){
  const el=$('#best-sellers'); if(!el) return;
  el.innerHTML=window.GABS_PRODUCTS.slice(0,6).map(productCard).join('');
}

function toggleFavorite(slug){
  const i=state.favorites.indexOf(slug);
  if(i>=0) state.favorites.splice(i,1); else state.favorites.push(slug);
  saveState();
  $$(`[data-favorite="${slug}"]`).forEach(b=>b.classList.toggle('active', state.favorites.includes(slug)));
}

function addToCart(slug,size,color){
  if(!size){ alert('Selecione um tamanho.'); return false; }
  const p=window.GABS_PRODUCTS.find(x=>x.slug===slug); if(!p) return false;
  const key=`${slug}-${size}-${color}`;
  const item=state.cart.find(i=>i.key===key);
  if(item) item.qty+=1; else state.cart.push({key,slug,size,color,qty:1});
  saveState(); renderCart(); openCart(); return true;
}

function renderCart(){
  const items=$('#cart-items'); const foot=$('#cart-foot'); if(!items) return;
  if(!state.cart.length){ items.innerHTML='<div class="empty-cart"><div><p class="serif" style="font-size:34px;margin:0 0 8px">Sua sacola está vazia.</p><p>Descubra os scrubs e volte quando encontrar o seu.</p></div></div>'; if(foot) foot.style.display='none'; return; }
  if(foot) foot.style.display='block';
  items.innerHTML=state.cart.map(i=>{ const p=window.GABS_PRODUCTS.find(x=>x.slug===i.slug); return `<div class="cart-item">
    <div class="cart-thumb"><img src="${p.image}" alt="${p.name}"></div>
    <div class="cart-meta"><strong>${p.name}</strong><span>${i.color} • ${i.size}</span><span>${money(p.price)}</span>
      <div class="qty"><button data-qty="-1" data-key="${i.key}">−</button><span>${i.qty}</span><button data-qty="1" data-key="${i.key}">+</button></div>
      <button class="remove" data-remove="${i.key}">Remover</button>
    </div><div>${money(p.price*i.qty)}</div></div>`; }).join('');
  const total=state.cart.reduce((sum,i)=>{const p=window.GABS_PRODUCTS.find(x=>x.slug===i.slug); return sum+p.price*i.qty;},0);
  const subtotal=$('#cart-subtotal'); if(subtotal) subtotal.textContent=money(total);
  const prog=Math.min(100,(total/399)*100); const bar=$('#freight-progress'); if(bar) bar.style.width=`${prog}%`;
  const copy=$('#freight-copy'); if(copy) copy.textContent= total>=399 ? 'Faixa de frete grátis atingida na configuração de staging.' : `Faltam ${money(399-total)} para a faixa configurada de frete grátis.`;
}

function openCart(){ $('#cart-overlay')?.classList.add('open'); document.body.style.overflow='hidden'; }
function closeCart(){ $('#cart-overlay')?.classList.remove('open'); document.body.style.overflow=''; }
function openSearch(){ $('#search-panel')?.classList.add('open'); document.body.style.overflow='hidden'; setTimeout(()=>$('#search-input')?.focus(),80); renderSearch(''); }
function closeSearch(){ $('#search-panel')?.classList.remove('open'); document.body.style.overflow=''; }

function renderSearch(q=''){
  const el=$('#search-results'); if(!el) return;
  const query=q.trim().toLowerCase();
  let ps=window.GABS_PRODUCTS;
  if(query) ps=ps.filter(p=>[p.name,p.fit,p.gender,p.category,...p.colors.map(c=>c[0])].join(' ').toLowerCase().includes(query));
  ps=ps.slice(0,6);
  el.innerHTML=ps.length?ps.map(p=>`<a class="search-result" href="produto.html?slug=${p.slug}"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><span>${p.fit}</span></div><span>${money(p.price)}</span></a>`).join(''):'<p style="color:var(--muted)">Nenhum produto encontrado.</p>';
}

function renderCollection(){
  const grid=$('#collection-grid'); if(!grid) return;
  const pageGender=document.body.dataset.gender || 'all';
  const checkedCats=$$('input[name="category"]:checked').map(i=>i.value);
  const checkedFits=$$('input[name="fit"]:checked').map(i=>i.value);
  const selectedColor=$('.filter-colors .swatch.active')?.dataset.color || '';
  let ps=window.GABS_PRODUCTS.filter(p=>pageGender==='all'||p.gender===pageGender||p.gender==='unissex');
  if(checkedCats.length) ps=ps.filter(p=>checkedCats.includes(p.category));
  if(checkedFits.length) ps=ps.filter(p=>checkedFits.includes(p.fit));
  if(selectedColor) ps=ps.filter(p=>p.colors.some(c=>c[0]===selectedColor));
  const sort=$('#sort')?.value;
  if(sort==='price-asc') ps.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') ps.sort((a,b)=>b.price-a.price);
  if(sort==='new') ps=ps.reverse();
  grid.innerHTML=ps.map(productCard).join('');
  $('#result-count').textContent=`${ps.length} produtos`;
}

function renderPDP(){
  const root=$('#pdp-root'); if(!root) return;
  const slug=new URLSearchParams(location.search).get('slug') || window.GABS_PRODUCTS[0].slug;
  const p=window.GABS_PRODUCTS.find(x=>x.slug===slug) || window.GABS_PRODUCTS[0];
  document.title=`${p.name} | Gabs Scrubs`;
  const gallery=[p.image,p.image2,p.image,p.image2];
  root.innerHTML=`<div class="container"><div class="breadcrumb"><a href="index.html">Início</a> / <a href="${p.gender==='masculino'?'masculino.html':'feminino.html'}">${p.gender==='masculino'?'Masculino':'Feminino'}</a> / ${p.name}</div>
  <div class="pdp"><div class="gallery">${gallery.map((img,i)=>`<figure><img src="${img}" alt="${p.name}${i?` — detalhe ${i+1}`:''}"></figure>`).join('')}</div>
  <aside class="purchase-panel" data-pdp="${p.slug}">
    <h1 class="pdp-title">${p.name}</h1><div class="pdp-fit">${p.fit}</div>
    <div class="rating"><span>☆☆☆☆☆</span><span>Sem avaliações verificadas ainda</span></div>
    <div class="pdp-price">${money(p.price)}</div><div class="pdp-installments">ou 6x de ${money(p.price/6)}</div>
    <div class="option-block"><div class="option-head"><strong id="selected-color-label">Cor: ${p.colors[0][0]}</strong></div><div class="pdp-swatches">${p.colors.map((c,i)=>`<button style="--swatch:${c[1]}" data-pdp-color="${c[0]}" class="${i===0?'active':''}" title="${c[0]}"></button>`).join('')}</div></div>
    <div class="option-block"><div class="option-head"><strong>Tamanho</strong><button type="button" id="size-guide-open">Qual é o meu tamanho?</button></div><div class="sizes">${p.sizes.map(s=>`<button class="size-btn" data-size="${s}">${s}</button>`).join('')}</div></div>
    <div style="margin-top:22px"><button class="btn full" id="pdp-add">Adicionar à sacola</button></div>
    <div class="option-block"><div class="option-head"><strong>Calcular entrega</strong></div><div class="shipping-box"><input id="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" aria-label="CEP"><button id="cep-btn" type="button">Calcular</button></div><div class="shipping-note" id="shipping-note"></div></div>
    <div class="accordion"><details open><summary>Descrição <span>+</span></summary><p>${p.description}</p></details><details><summary>Tecido <span>+</span></summary><p>${p.fabric}</p></details><details><summary>Detalhes e modelagem <span>+</span></summary><p>${p.details}</p></details><details><summary>Cuidados <span>+</span></summary><p>Lavar do avesso em ciclo delicado, com cores semelhantes. Evitar alvejantes. Secagem natural recomendada.</p></details><details><summary>Entrega e devoluções <span>+</span></summary><p>Regras finais de frete, prazo e devolução serão conectadas ao backend de produção.</p></details></div>
  </aside></div></div>`;

  let size=''; let color=p.colors[0][0];
  $$('.size-btn',root).forEach(b=>b.addEventListener('click',()=>{$$('.size-btn',root).forEach(x=>x.classList.remove('active')); b.classList.add('active'); size=b.dataset.size;}));
  $$('[data-pdp-color]',root).forEach(b=>b.addEventListener('click',()=>{$$('[data-pdp-color]',root).forEach(x=>x.classList.remove('active')); b.classList.add('active'); color=b.dataset.pdpColor; $('#selected-color-label').textContent=`Cor: ${color}`;}));
  $('#pdp-add')?.addEventListener('click',()=>addToCart(p.slug,size,color));
  $('#mobile-pdp-add')?.addEventListener('click',()=>addToCart(p.slug,size,color));
  $('#size-guide-open')?.addEventListener('click',()=>$('#size-modal')?.classList.add('open'));
  $('#cep')?.addEventListener('input',e=>{let v=e.target.value.replace(/\D/g,'').slice(0,8); if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5);e.target.value=v;});
  $('#cep-btn')?.addEventListener('click',async()=>{
    const cep=$('#cep').value.replace(/\D/g,''); const note=$('#shipping-note');
    if(cep.length!==8){note.textContent='Digite um CEP válido com 8 números.'; return;}
    note.textContent='Validando CEP…';
    try{ const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`); const data=await r.json(); if(data.erro) throw new Error(); note.textContent=`${data.localidade}/${data.uf}. Tarifas de frete serão exibidas quando a integração de produção estiver ativa.`; }
    catch{ note.textContent='Não foi possível validar o CEP agora.'; }
  });
}

function renderCheckout(){
  const list=$('#checkout-items'); if(!list) return;
  if(!state.cart.length){ list.innerHTML='<p>Sua sacola está vazia.</p>'; return; }
  let total=0;
  list.innerHTML=state.cart.map(i=>{const p=window.GABS_PRODUCTS.find(x=>x.slug===i.slug); total+=p.price*i.qty; return `<div class="cart-item"><div class="cart-thumb"><img src="${p.image}" alt=""></div><div class="cart-meta"><strong>${p.name}</strong><span>${i.color} • ${i.size} • Qtd. ${i.qty}</span></div><div>${money(p.price*i.qty)}</div></div>`}).join('');
  $('#checkout-total').textContent=money(total);
}

function bindGlobal(){
  document.addEventListener('click',e=>{
    const fav=e.target.closest('[data-favorite]'); if(fav){e.preventDefault(); toggleFavorite(fav.dataset.favorite);}
    const qty=e.target.closest('[data-qty]'); if(qty){const it=state.cart.find(i=>i.key===qty.dataset.key); if(it){it.qty=Math.max(1,it.qty+Number(qty.dataset.qty)); saveState(); renderCart();}}
    const rm=e.target.closest('[data-remove]'); if(rm){state.cart=state.cart.filter(i=>i.key!==rm.dataset.remove); saveState(); renderCart();}
  });
  $$('.cart-open').forEach(b=>b.addEventListener('click',openCart));
  $('#cart-close')?.addEventListener('click',closeCart); $('#cart-overlay')?.addEventListener('click',e=>{if(e.target.id==='cart-overlay') closeCart();});
  $$('.search-open').forEach(b=>b.addEventListener('click',openSearch)); $('#search-close')?.addEventListener('click',closeSearch); $('#search-input')?.addEventListener('input',e=>renderSearch(e.target.value));
  $('#mobile-menu-open')?.addEventListener('click',()=>$('#mobile-menu')?.classList.add('open')); $('#mobile-menu-close')?.addEventListener('click',()=>$('#mobile-menu')?.classList.remove('open'));
  $('#newsletter-form')?.addEventListener('submit',e=>{e.preventDefault(); const email=$('#newsletter-email').value.trim(); if(!email) return; localStorage.setItem('gabs_newsletter_preview',email); $('#newsletter-note').textContent='E-mail salvo nesta prévia. A integração de CRM será conectada na publicação.'; e.target.reset();});
  $('#size-modal-close')?.addEventListener('click',()=>$('#size-modal')?.classList.remove('open'));
  $('#size-modal')?.addEventListener('click',e=>{if(e.target.id==='size-modal') e.currentTarget.classList.remove('open');});
  $('#checkout-btn')?.addEventListener('click',()=>location.href='checkout.html');
  $$('input[name="category"], input[name="fit"]').forEach(i=>i.addEventListener('change',renderCollection)); $('#sort')?.addEventListener('change',renderCollection);
  $$('.filter-colors .swatch').forEach(b=>b.addEventListener('click',()=>{const active=b.classList.contains('active'); $$('.filter-colors .swatch').forEach(x=>x.classList.remove('active')); if(!active)b.classList.add('active'); renderCollection();}));
  $$('[data-color-family]').forEach(b=>b.addEventListener('click',()=>{location.href=`feminino.html?color=${encodeURIComponent(b.dataset.colorFamily)}`;}));
}

function applyCollectionQuery(){
  const q=new URLSearchParams(location.search); const c=q.get('color'); if(!c) return; const b=$(`.filter-colors .swatch[data-color="${c}"]`); if(b) b.classList.add('active');
}

window.addEventListener('DOMContentLoaded',()=>{
  renderBestSellers(); applyCollectionQuery(); renderCollection(); renderPDP(); renderCart(); renderCheckout(); updateBadges(); bindGlobal();
});
