// script.js (module)
const RECIPES_PATH = 'recipes.json';

let recipes = [];
let activeTag = null;

const $search = document.getElementById('search');
const $tags = document.getElementById('tags');
const $recipes = document.getElementById('recipes');
const $noResults = document.getElementById('no-results');
const $modal = document.getElementById('modal');
const $closeModal = document.getElementById('close-modal');
const $recipeDetail = document.getElementById('recipe-detail');

async function loadRecipes(){
  try {
    const res = await fetch(RECIPES_PATH);
    if(!res.ok) throw new Error('Impossible de charger recipes.json');
    const data = await res.json();
    recipes = data.recipes || [];
    renderTags();
    renderList();
  } catch (e) {
    console.error(e);
    $recipes.innerHTML = '<p style="color:#c00">Erreur de chargement des recettes.</p>';
  }
}

function getAllTags(){
  const set = new Set();
  recipes.forEach(r => (r.tags || []).forEach(t => set.add(t)));
  return [...set].sort();
}

function renderTags(){
  const tags = getAllTags();
  $tags.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'tag' + (activeTag === null ? ' active' : '');
  allBtn.textContent = 'Tous';
  allBtn.onclick = () => { activeTag = null; updateActiveTag(); renderList(); };
  $tags.appendChild(allBtn);

  tags.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tag' + (activeTag === t ? ' active' : '');
    btn.textContent = t;
    btn.onclick = () => {
      activeTag = activeTag === t ? null : t;
      updateActiveTag();
      renderList();
    };
    $tags.appendChild(btn);
  });
}

function updateActiveTag(){
  [...$tags.children].forEach(btn => btn.classList.remove('active'));
  const btns = [...$tags.children];
  const match = activeTag === null ? btns[0] : btns.find(b => b.textContent === activeTag);
  if(match) match.classList.add('active');
}

function renderList(){
  const q = $search.value.trim().toLowerCase();
  let filtered = recipes.filter(r => {
    const text = (r.title + ' ' + (r.description || '') + ' ' + (r.ingredients||[]).join(' ')).toLowerCase();
    const matchesQuery = !q || text.includes(q);
    const matchesTag = !activeTag || (r.tags || []).includes(activeTag);
    return matchesQuery && matchesTag;
  });

  $recipes.innerHTML = '';
  if(filtered.length === 0){
    $noResults.hidden = false;
    return;
  }
  $noResults.hidden = true;

  filtered.forEach(r => {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${r.image || 'images/placeholder.jpg'}" alt="${r.title}" loading="lazy" />
      <div class="card-body">
        <h3 class="card-title">${r.title}</h3>
        <div class="card-meta">${r.category || ''} • ${r.servings || ''} pers • ${r.prepTimeMinutes || 0} min</div>
        <p class="card-desc" style="color:var(--muted);margin:6px 0 10px">${r.description || ''}</p>
        <div class="card-tags">${(r.tags||[]).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    `;
    card.addEventListener('click', () => openDetail(r));
    card.addEventListener('keypress', (e) => { if(e.key === 'Enter') openDetail(r); });
    $recipes.appendChild(card);
  });
}

function openDetail(r){
  $recipeDetail.innerHTML = `
    <h2>${r.title}</h2>
    <img class="recipe-image" src="${r.image || 'images/placeholder.jpg'}" alt="${r.title}" />
    <div class="recipe-info">
      <div><strong>Catégorie:</strong> ${r.category || '-'}</div>
      <div><strong>Portions:</strong> ${r.servings || '-'}</div>
      <div><strong>Préparation:</strong> ${r.prepTimeMinutes || 0} min</div>
      <div><strong>Cuisson:</strong> ${r.cookTimeMinutes || 0} min</div>
    </div>
    <div class="recipe-section">
      <h3>Ingrédients</h3>
      <ul>${(r.ingredients || []).map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
    <div class="recipe-section">
      <h3>Étapes</h3>
      <ol>${(r.steps || []).map(s => `<li>${s}</li>`).join('')}</ol>
    </div>
  `;
  $modal.hidden = false;
}

$closeModal.addEventListener('click', () => $modal.hidden = true);
$modal.addEventListener('click', (e) => { if(e.target === $modal) $modal.hidden = true; });
$search.addEventListener('input', () => renderList());

loadRecipes();
