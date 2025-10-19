// Prosty skrypt do zarządzania ofertami (lokalnie w localStorage)
const form = document.getElementById('offer-form');
const grid = document.getElementById('grid');
const emptyMsg = document.getElementById('empty-msg');
const clearBtn = document.getElementById('clear-offers');
const yearEl = document.getElementById('year');

// Modal i przyciski
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

document.getElementById('btn-faq').addEventListener('click', ()=> openModal(faqHTML(), 'FAQ'));
document.getElementById('btn-terms').addEventListener('click', ()=> openModal(termsHTML(), 'Regulamin'));
document.getElementById('btn-offers').addEventListener('click', ()=> { window.scrollTo({top: document.getElementById('offers-grid').offsetTop-20, behavior:'smooth'}) });

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=> { if(e.target===modal) closeModal(); });

function openModal(html, title){
  modalBody.innerHTML = `<h2>${title}</h2>` + html;
  modal.classList.remove('hidden');
}
function closeModal(){ modal.classList.add('hidden'); }

// przykładowe FAQ / regulamin (możesz edytować)
function faqHTML(){
  return `
  <h3>Jak to działa?</h3>
  <p>Tworzę plan na podstawie Twoich preferencji — wyślij mi opis w formularzu kontaktowym.</p>
  <h3>Cena?</h3>
  <p>Ceny zależą od długości i skomplikowania planu — przykładowe ceny znajdziesz w ofercie.</p>
  `;
}
function termsHTML(){
  return `
  <p><strong>Regulamin (przykład):</strong> Niniejszy regulamin jest przykładem. Przed sprzedażą spersonalizowanego planu dodaj realne zapisy o płatności, realizacji zlecenia i prawach konsumenta.</p>
  `;
}

// Local storage
const STORAGE_KEY = 'my_travel_offers_v1';
let offers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function saveOffers(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(offers)); renderOffers(); }
function renderOffers(){
  grid.innerHTML = '';
  if (offers.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';
  offers.forEach((o, idx) => {
    const card = document.createElement('div');
    card.className = 'card-offer';
    card.innerHTML = `
      ${o.image ? `<img src="${o.image}" alt="${escapeHtml(o.title)}" onerror="this.style.display='none'">`:''}
      <h4 class="offer-title">${escapeHtml(o.title)}</h4>
      <div class="offer-short">${escapeHtml(o.short)}</div>
      <div class="muted">${escapeHtml(o.price || '')}</div>
      <p>${escapeHtml(o.desc || '')}</p>
      <div class="offer-actions">
        <button class="small view" data-i="${idx}">Pokaż</button>
        <button class="small del" data-i="${idx}">Usuń</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // eventy przycisków
  grid.querySelectorAll('.small.del').forEach(b => b.addEventListener('click', e=>{
    const i = +e.currentTarget.dataset.i;
    if (confirm('Usunąć tę ofertę?')) {
      offers.splice(i,1); saveOffers();
    }
  }));
  grid.querySelectorAll('.small.view').forEach(b => b.addEventListener('click', e=>{
    const i = +e.currentTarget.dataset.i;
    openModal(renderOfferModal(offers[i]), 'Szczegóły oferty');
  }));
}

function renderOfferModal(o){
  return `<h3>${escapeHtml(o.title)}</h3>
          ${o.image?`<img src="${o.image}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin-bottom:8px">`:''}
          <p><strong>${escapeHtml(o.short)}</strong></p>
          <p>${escapeHtml(o.desc||'')}</p>
          <p class="muted">${escapeHtml(o.price||'')}</p>`;
}

form.addEventListener('submit', e=>{
  e.preventDefault();
  const fd = new FormData(form);
  const newOffer = {
    title: fd.get('title').trim(),
    short: fd.get('short').trim(),
    image: fd.get('image').trim(),
    price: fd.get('price').trim(),
    desc: fd.get('desc').trim()
  };
  offers.unshift(newOffer); // najpierw najnowsze
  saveOffers();
  form.reset();
});

clearBtn.addEventListener('click', ()=>{
  if(confirm('Usunąć wszystkie oferty?')) { offers = []; saveOffers(); }
});

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

// inicjalizacja
yearEl.textContent = new Date().getFullYear();
renderOffers();


