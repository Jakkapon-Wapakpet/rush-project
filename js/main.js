// อ่านข้อมูล -> สร้างการ์ด -> แสดงในหน้าเว็บ (ใช้ textContent ทุกจุดที่เป็นข้อความจากข้อมูล)
const destinationList = document.getElementById('destination-list');
const destinationCount = document.getElementById('destination-count');
const filterButtons = document.querySelectorAll('[data-category]');
const randomButton = document.getElementById('random-button');
const randomResult = document.getElementById('random-result');
const dialog = document.getElementById('detail-dialog');

const CATEGORY_LABEL = { beach: 'ทะเล', mountain: 'ภูเขา', culture: 'วัฒนธรรม' };
let currentCategory = 'all';

// รายการโปรดเก็บใน localStorage; ถ้าใช้ไม่ได้ (private mode) จะเก็บในหน่วยความจำแทน
let favorites = new Set();
try { favorites = new Set(JSON.parse(localStorage.getItem('te-favorites') || '[]')); } catch (e) { /* ไม่เป็นไร */ }
function saveFavorites() {
  try { localStorage.setItem('te-favorites', JSON.stringify([...favorites])); } catch (e) { /* ไม่เป็นไร */ }
}

function createImage(destination, className) {
  const image = document.createElement('img');
  if (className) image.className = className;
  image.alt = destination.imageAlt;
  image.loading = 'lazy';
  // ถ้ามีภาพถ่ายจริงใช้ก่อน ถ้าโหลดไม่ได้ให้ถอยกลับไปใช้ภาพประกอบหมวด
  image.addEventListener('error', () => { image.src = destination.image; }, { once: true });
  image.src = destination.photo || destination.image;
  if (destination.photo) image.alt = `ภาพ${destination.name}`;
  return image;
}

function createCategoryBadge(destination) {
  const badge = document.createElement('span');
  badge.className = 'category';
  badge.dataset.cat = destination.category;
  badge.textContent = CATEGORY_LABEL[destination.category];
  return badge;
}

function createFavButton(destination) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fav';
  const sync = () => {
    const on = favorites.has(destination.id);
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', `${on ? 'เอาออกจาก' : 'เพิ่มใน'}รายการโปรด: ${destination.name}`);
    button.textContent = on ? '♥' : '♡';
  };
  sync();
  button.addEventListener('click', () => {
    favorites.has(destination.id) ? favorites.delete(destination.id) : favorites.add(destination.id);
    saveFavorites();
    if (currentCategory === 'favorites') renderDestinations('favorites'); else sync();
  });
  return button;
}

function createCard(destination) {
  const card = document.createElement('article');
  card.className = 'destination-card';
  const content = document.createElement('div');
  content.className = 'card-content';
  const name = document.createElement('h3');
  name.textContent = destination.name;
  const province = document.createElement('p');
  province.className = 'province';
  province.textContent = `${destination.province}`;
  const description = document.createElement('p');
  description.textContent = destination.description;
  const tags = document.createElement('ul');
  tags.className = 'tags';
  destination.tags.forEach(tag => { const li = document.createElement('li'); li.textContent = `#${tag}`; tags.append(li); });
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'open-detail';
  more.textContent = 'ดูรายละเอียด';
  more.setAttribute('aria-label', `ดูรายละเอียด ${destination.name}`);
  more.addEventListener('click', () => openDetail(destination));
  content.append(createCategoryBadge(destination), name, province, description, tags, more);
  card.append(createImage(destination), createFavButton(destination), content);
  return card;
}

function renderDestinations(category) {
  currentCategory = category;
  let visible;
  if (category === 'all') visible = destinations;
  else if (category === 'favorites') visible = destinations.filter(d => favorites.has(d.id));
  else visible = destinations.filter(d => d.category === category);
  destinationList.replaceChildren();
  visible.forEach(d => destinationList.append(createCard(d)));
  destinationCount.textContent = category === 'favorites' && visible.length === 0
    ? 'ยังไม่มีสถานที่ที่ชอบ กดรูปหัวใจที่การ์ดเพื่อเก็บไว้'
    : `แสดง ${visible.length} สถานที่`;
}

function setFilter(category) {
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  renderDestinations(category);
}

filterButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.category)));

// ปุ่มหมวดในหน้า Home: ตั้ง filter แล้วเลื่อนไป Explore
document.querySelectorAll('[data-jump]').forEach(tile => tile.addEventListener('click', () => {
  setFilter(tile.dataset.jump);
  document.getElementById('explore').scrollIntoView();
}));

function createFact(label, value) {
  const box = document.createElement('div');
  box.className = 'fact';
  const title = document.createElement('b'); title.textContent = label;
  const text = document.createElement('span'); text.textContent = value;
  box.append(title, text);
  return box;
}

function openDetail(destination) {
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'detail-close'; close.textContent = '✕'; close.setAttribute('aria-label', 'ปิดหน้ารายละเอียด');
  close.addEventListener('click', () => dialog.close());
  const body = document.createElement('div');
  body.className = 'detail-body';
  const title = document.createElement('h2'); title.id = 'detail-title'; title.textContent = destination.name;
  const place = document.createElement('p'); place.className = 'province'; place.textContent = destination.province;
  const description = document.createElement('p'); description.textContent = destination.description;
  const facts = document.createElement('div'); facts.className = 'facts';
  facts.append(createFact('ช่วงเวลาที่เหมาะสม', destination.season), createFact('การเดินทาง', destination.trip));
  const tip = document.createElement('p'); tip.className = 'tip'; tip.textContent = `เคล็ดลับ: ${destination.tip}`;
  const map = document.createElement('a');
  map.className = 'button map-link'; map.target = '_blank'; map.rel = 'noopener noreferrer';
  map.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${destination.name} ${destination.province}`);
  map.textContent = 'เปิดใน Google Maps ↗';
  body.append(createCategoryBadge(destination), title, place, description, facts, tip, map);
  dialog.replaceChildren(createImage(destination, 'detail-img'), close, body);
  dialog.showModal();
}
// คลิกพื้นหลังนอกกล่องเพื่อปิด
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

randomButton.addEventListener('click', () => {
  // สุ่มจากสถานที่ทั้งหมด ไม่ผูกกับ filter
  const index = Math.floor(Math.random() * destinations.length);
  randomResult.replaceChildren(createCard(destinations[index]));
});

renderDestinations('all');
