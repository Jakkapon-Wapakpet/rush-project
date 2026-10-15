// ==========================================
// รีเฟรชแล้วกลับหน้าแรก แทนตำแหน่งเลื่อนหรือ anchor เดิม
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
{
  history.replaceState(history.state, '', location.pathname + location.search);
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.addEventListener('pageshow', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, { once: true });
}

// 1. ดึง Element ต่างๆ จาก DOM
// ==========================================
// อ่านข้อมูล -> สร้างการ์ด -> แสดงในหน้าเว็บ (ใช้ textContent ทุกจุดที่เป็นข้อความจากข้อมูลเพื่อความปลอดภัย)
const destinationList = document.getElementById('destination-list');
const destinationCount = document.getElementById('destination-count');
const filterButtons = document.querySelectorAll('[data-category]');
const randomButton = document.getElementById('random-button');
const randomResult = document.getElementById('random-result');
const dialog = document.getElementById('detail-dialog');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');
const navbar = document.querySelector('.navbar');
function syncNavbar() {
  navbar.classList.toggle('is-scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', syncNavbar, { passive: true });
window.addEventListener('pageshow', syncNavbar);
syncNavbar();

// ==========================================
// 2. จัดการเมนูบนมือถือ (Mobile Menu & Accessibility)
// ==========================================
// ฟังก์ชันปิดเมนูมือถือ
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
}

// กดปุ่ม Toggle เพื่อเปิด/ปิดเมนู
menuToggle.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', String(menuToggle.getAttribute('aria-expanded') !== 'true'));
});

// เมื่อคลิกลิงก์ใดๆ ในเมนู ให้ปิดเมนูอัตโนมัติ
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

// กดปุ่ม Escape บนคีย์บอร์ดเพื่อปิดเมนู และคืนโฟกัสไปที่ปุ่มเปิดเมนู
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

// ==========================================
// 3. สถานะและระบบรายการโปรด (State & Favorites)
// ==========================================
// แมปชื่อหมวดหมู่ภาษาอังกฤษเป็นภาษาไทย
const CATEGORY_LABEL = { beach: 'ทะเล', mountain: 'ภูเขา', culture: 'วัฒนธรรม' };
let currentCategory = 'all'; // หมวดหมู่ที่กำลังแสดงอยู่ปัจจุบัน

// รายการโปรดเก็บใน localStorage; ถ้าใช้ไม่ได้ (เช่น private mode) จะเก็บในหน่วยความจำแทน
let favorites = new Set();
try { 
  favorites = new Set(JSON.parse(localStorage.getItem('te-favorites') || '[]')); 
} catch (e) { 
  /* ไม่เป็นไร กรณีเปิดใน incognito หรือถูกบล็อก storage */ 
}

// บันทึกรายการโปรดลง localStorage
function saveFavorites() {
  try { 
    localStorage.setItem('te-favorites', JSON.stringify([...favorites])); 
  } catch (e) { 
    /* ไม่เป็นไร */ 
  }
}

// ==========================================
// 4. ฟังก์ชันสร้างองค์ประกอบ UI (Component Builders)
// ==========================================

/**
 * สร้างแท็ก <img> พร้อมระบบ Lazy Loading และ Fallback หากโหลดรูปภาพไม่สำเร็จ
 */
function createImage(destination, className) {
  const image = document.createElement('img');
  if (className) image.className = className;
  image.alt = destination.imageAlt;
  image.loading = 'lazy';

  // ถ้ามีภาพถ่ายจริงใช้ก่อน ถ้าโหลดไม่ได้ให้ถอยกลับไปใช้ภาพประกอบหมวด
  image.addEventListener('error', () => {
    image.src = `assets/images/generated/category-${destination.category}.jpg`;
    image.alt = `ภาพสร้างด้วย AI ประกอบหมวด${CATEGORY_LABEL[destination.category]}`;
  }, { once: true });

  image.src = destination.photo || destination.image;
  if (destination.photo) image.alt = `ภาพ${destination.name}`;
  return image;
}

/**
 * สร้างป้ายกำกับหมวดหมู่ (Badge) เช่น ทะเล, ภูเขา, วัฒนธรรม
 */
function createCategoryBadge(destination) {
  const badge = document.createElement('span');
  badge.className = 'category';
  badge.dataset.cat = destination.category;
  badge.textContent = CATEGORY_LABEL[destination.category];
  return badge;
}

/**
 * สร้างปุ่มกดบันทึกรายการโปรด (รูปหัวใจ ♥ / ♡)
 */
function createFavButton(destination) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fav';

  // อัปเดตไอคอนและสถานะ accessibility ตามการมีอยู่ของ ID ใน favorites
  const sync = () => {
    const on = favorites.has(destination.id);
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', `${on ? 'เอาออกจาก' : 'เพิ่มใน'}รายการโปรด: ${destination.name}`);
    button.textContent = on ? '♥' : '♡';
  };
  sync();

  // จัดการเมื่อกดปุ่มถูกใจ
  button.addEventListener('click', () => {
    favorites.has(destination.id) ? favorites.delete(destination.id) : favorites.add(destination.id);
    saveFavorites();
    // ถ้ากำลังดูแท็บรายการโปรดอยู่ ให้รีเรนเดอร์หน้าจอใหม่ทันที
    if (currentCategory === 'favorites') renderDestinations('favorites'); else sync();
  });
  return button;
}

/**
 * สร้างการ์ดแสดงสถานที่ท่องเที่ยว 1 ใบ
 */
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

  // รายการแฮชแท็ก (#tag)
  const tags = document.createElement('ul');
  tags.className = 'tags';
  destination.tags.forEach(tag => { 
    const li = document.createElement('li'); 
    li.textContent = `#${tag}`; 
    tags.append(li); 
  });

  // ปุ่มกดดูรายละเอียดเพิ่มเติม (เปิด Modal)
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

// ==========================================
// 5. ระบบกรองข้อมูลและการแสดงผล (Filter & Render)
// ==========================================

/**
 * กรองและแสดงรายการสถานที่ตามหมวดหมู่ที่ระบุ ('all', 'favorites', หรือหมวดหมู่อื่นๆ)
 */
function renderDestinations(category) {
  currentCategory = category;
  let visible;
  
  if (category === 'all') visible = destinations;
  else if (category === 'favorites') visible = destinations.filter(d => favorites.has(d.id));
  else visible = destinations.filter(d => d.category === category);

  // ล้างการ์ดเดิมแล้วใส่การ์ดใหม่
  destinationList.replaceChildren();
  visible.forEach(d => destinationList.append(createCard(d)));

  // อัปเดตข้อความแสดงจำนวนสถานที่
  destinationCount.textContent = category === 'favorites' && visible.length === 0
    ? 'ยังไม่มีสถานที่ที่ชอบ กดรูปหัวใจที่การ์ดเพื่อเก็บไว้'
    : `แสดง ${visible.length} สถานที่`;
}

/**
 * ตั้งค่าตัวกรอง อัปเดตสถานะปุ่ม และเรียกเรนเดอร์ข้อมูลใหม่
 */
function setFilter(category) {
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  renderDestinations(category);
}

// ผูก event ให้กับปุ่มตัวกรองแต่ละปุ่ม
filterButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.category)));

// ปุ่มหมวดในหน้า Home: ตั้ง filter แล้วเลื่อนจอไปที่ส่วน Explore
document.querySelectorAll('[data-jump]').forEach(tile => tile.addEventListener('click', () => {
  setFilter(tile.dataset.jump);
  document.getElementById('explore').scrollIntoView();
}));

// ==========================================
// 6. ป๊อปอัปดูรายละเอียดและแผนที่ (Detail Modal & Maps)
// ==========================================

/**
 * สร้างกล่องข้อมูลย่อย (หัวข้อ + ข้อความ) สำหรับแสดงในหน้าต่างรายละเอียด
 */
function createFact(label, value) {
  const box = document.createElement('div');
  box.className = 'fact';
  const title = document.createElement('b'); title.textContent = label;
  const text = document.createElement('span'); text.textContent = value;
  box.append(title, text);
  return box;
}

/**
 * เปิดหน้าต่าง Modal (<dialog>) แสดงข้อมูลเชิงลึกของสถานที่
 */
function openDetail(destination) {
  // ปุ่มปิดหน้าต่าง
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'detail-close'; close.textContent = '✕'; close.setAttribute('aria-label', 'ปิดหน้ารายละเอียด');
  close.addEventListener('click', () => dialog.close());

  const body = document.createElement('div');
  body.className = 'detail-body';

  const title = document.createElement('h2'); title.id = 'detail-title'; title.textContent = destination.name;
  const place = document.createElement('p'); place.className = 'province'; place.textContent = destination.province;
  const description = document.createElement('p'); description.textContent = destination.description;

  // ข้อมูลช่วงเวลาท่องเที่ยวและการเดินทาง
  const facts = document.createElement('div'); facts.className = 'facts';
  facts.append(createFact('ช่วงเวลาที่เหมาะสม', destination.season), createFact('การเดินทาง', destination.trip));

  const tip = document.createElement('p'); tip.className = 'tip'; tip.textContent = `เคล็ดลับ: ${destination.tip}`;

  // ลิงก์สำหรับเปิดดูพิกัดใน Google Maps ในแท็บใหม่
  const map = document.createElement('a');
  map.className = 'button map-link'; map.target = '_blank'; map.rel = 'noopener noreferrer';
  map.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${destination.name} ${destination.province}`);
  map.textContent = 'เปิดใน Google Maps ↗';

  body.append(createCategoryBadge(destination), title, place, description, facts, tip, map);

  // ประกอบชิ้นส่วนเข้าใน dialog แล้วสั่งเปิด Modal
  dialog.replaceChildren(createImage(destination, 'detail-img'), close, body);
  dialog.showModal();
}

// ปิด Dialog อัตโนมัติเมื่อคลิกพื้นที่ด้านนอกกล่อง (Backdrop)
dialog.addEventListener('click', event => { 
  if (event.target === dialog) dialog.close(); 
});

// ==========================================
// 7. ระบบสุ่มสถานที่ (Randomizer)
// ==========================================
randomButton.addEventListener('click', () => {
  // สุ่มจากสถานที่ทั้งหมด ไม่ผูกกับ filter
  const index = Math.floor(Math.random() * destinations.length);
  randomResult.replaceChildren(createCard(destinations[index]));
});

// ==========================================
// 8. เริ่มต้นการทำงาน (Initial Run)
// ==========================================
// แสดงสถานที่ท่องเที่ยวทั้งหมดเมื่อโหลดหน้าเว็บครั้งแรก
renderDestinations('all');

