// ==========================================
// 0. รีเฟรชแล้วกลับหน้าแรกเสมอ (Scroll Reset)
// ==========================================
// ไม่จำตำแหน่งเลื่อนหรือ anchor (#...) เดิม
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
history.replaceState(history.state, '', location.pathname + location.search);
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
window.addEventListener('pageshow', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}, { once: true });

// ==========================================
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
const menuLabel = menuToggle.querySelector('.menu-label');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ไอคอน SVG ใช้ซ้ำในการ์ดและหน้ารายละเอียด
const ICONS = {
  heart: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M7 17L17 7M9 7h8v8"/>'
};
function icon(name, size = 22) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.innerHTML = ICONS[name];
  return svg;
}

// ==========================================
// 2. จัดการเมนูบนมือถือ (Mobile Menu & Accessibility)
// ==========================================
// เปิด (true) หรือปิด (false) เมนูมือถือ
function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'ปิด' : 'เมนู';
  document.body.classList.toggle('menu-open', open);
  // ระหว่างเมนูเปิด ไม่ให้กด Tab เข้าไปในเนื้อหาที่อยู่ด้านหลังเมนู
  document.querySelector('main').inert = open;
  document.querySelector('.footer').inert = open;
}
function closeMenu() {
  setMenu(false);
}

// กดปุ่ม Toggle เพื่อเปิด/ปิดเมนู
menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

// กดลิงก์ใดๆ ในแถบบน (รวมโลโก้) ให้ปิดเมนูอัตโนมัติ
document.querySelectorAll('.navbar a').forEach(link => link.addEventListener('click', closeMenu));

// ถ้าจอกว้างขึ้นจนไม่ใช่มือถือแล้ว (เช่น หมุนมือถือเป็นแนวนอน) ให้ปิดเมนู ไม่ให้หน้าเว็บค้าง
window.matchMedia('(min-width: 768px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// กดปุ่ม Escape บนคีย์บอร์ดเพื่อปิดเมนู และคืนโฟกัสไปที่ปุ่มเปิดเมนู
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

// ไฮไลต์ลิงก์ของ section ที่กำลังดูอยู่
const navLinks = [...mainNav.querySelectorAll('a')];
let observedId = 'home'; // section ล่าสุดที่ผ่านกลางจอ
function highlight(id) {
  navLinks.forEach(link => {
    if (link.hash === '#' + id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}
// section สุดท้าย (เกี่ยวกับเรา) สั้น บนจอสูงอาจไม่ถึงกลางจอ -> ถ้าเลื่อนถึงล่างสุดให้ไฮไลต์ about
function updateNav() {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  highlight(atBottom ? 'about' : observedId);
}
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) observedId = entry.target.id; });
  updateNav();
}, { rootMargin: '-45% 0px -50% 0px' });
['home', 'categories', 'explore', 'discover', 'about'].forEach(id => sectionObserver.observe(document.getElementById(id)));
window.addEventListener('scroll', updateNav, { passive: true });

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
 * อัปเดตหัวใจทุกปุ่มของสถานที่นี้ (การ์ดในรายการ + การ์ดสุ่ม) ให้ตรงกับรายการโปรด
 */
function syncFavButtons(id) {
  document.querySelectorAll(`.fav[data-id="${id}"]`).forEach(button => {
    button.setAttribute('aria-pressed', String(favorites.has(id)));
  });
}

/**
 * สร้างปุ่มกดบันทึกรายการโปรด (รูปหัวใจ) — aria-pressed บอกว่ากดอยู่หรือไม่
 */
function createFavButton(destination) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fav';
  button.dataset.id = destination.id;
  button.setAttribute('aria-label', `บันทึกเป็นรายการโปรด: ${destination.name}`);
  button.setAttribute('aria-pressed', String(favorites.has(destination.id)));
  button.append(icon('heart', 24));

  // จัดการเมื่อกดปุ่มถูกใจ
  button.addEventListener('click', () => {
    favorites.has(destination.id) ? favorites.delete(destination.id) : favorites.add(destination.id);
    saveFavorites();
    syncFavButtons(destination.id);
    if (currentCategory !== 'favorites') return;

    // อยู่ในแท็บ "ที่ชอบ": วาดรายการใหม่ แล้วย้ายโฟกัสไปหัวใจใบถัดไป (โฟกัสจะได้ไม่หลุด)
    const hearts = [...destinationList.querySelectorAll('.fav')];
    const index = hearts.indexOf(button);
    renderDestinations('favorites');
    if (index === -1) return; // กดจากการ์ดสุ่ม ไม่ต้องย้ายโฟกัส
    const newHearts = destinationList.querySelectorAll('.fav');
    const next = newHearts[index] || newHearts[newHearts.length - 1] || document.querySelector('[data-category="favorites"]');
    next.focus();
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
  province.textContent = `${destination.province} · ${CATEGORY_LABEL[destination.category]}`;

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
  more.append('ดูรายละเอียด', icon('arrow', 18));
  more.setAttribute('aria-label', `ดูรายละเอียด ${destination.name}`);
  more.addEventListener('click', () => openDetail(destination));

  // ภาพอยู่ในกรอบ .card-photo เพื่อคุมสัดส่วน 4:3 และตัดส่วนที่เกินออก
  const photo = document.createElement('div');
  photo.className = 'card-photo';
  photo.append(createImage(destination));

  content.append(name, province, description, tags, more);
  card.append(photo, createFavButton(destination), content);
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

  // อัปเดตข้อความแสดงจำนวนสถานที่ (ถ้ายังไม่มีที่ชอบ แสดงกล่องบอกวิธีใช้แทน)
  destinationCount.textContent = `แสดง ${visible.length} สถานที่`;
  if (category === 'favorites' && visible.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'ยังไม่มีสถานที่ที่ชอบ กดรูปหัวใจที่การ์ดเพื่อเก็บไว้';
    destinationList.append(empty);
  }
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

// กดหมวดในส่วน "เลือกแบบที่ใช่": ตั้งตัวกรองแล้วเลื่อนไปที่รายการสถานที่
document.querySelectorAll('[data-jump]').forEach(tile => tile.addEventListener('click', () => {
  setFilter(tile.dataset.jump);
  document.getElementById('explore').scrollIntoView();
  // ย้ายโฟกัสไปที่ปุ่มตัวกรองที่ตรงกัน เพื่อให้คนใช้คีย์บอร์ดกด Tab ต่อจากรายการได้เลย
  document.querySelector(`.filters [data-category="${tile.dataset.jump}"]`).focus({ preventScroll: true });
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
  // ปุ่มปิดหน้าต่าง (อยู่ลำดับแรก จึงติดมุมบนขวาเสมอแม้เลื่อนอ่านลงไป)
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'detail-close'; close.append(icon('close')); close.setAttribute('aria-label', 'ปิดหน้ารายละเอียด');
  close.addEventListener('click', () => dialog.close());

  const body = document.createElement('div');
  body.className = 'detail-body';

  const title = document.createElement('h2'); title.id = 'detail-title'; title.textContent = destination.name;
  const place = document.createElement('p'); place.className = 'province'; place.textContent = `${destination.province} · ${CATEGORY_LABEL[destination.category]}`;
  const description = document.createElement('p'); description.textContent = destination.description;

  // ข้อมูลช่วงเวลาท่องเที่ยวและการเดินทาง
  const facts = document.createElement('div'); facts.className = 'facts';
  facts.append(createFact('ช่วงเวลาที่เหมาะสม', destination.season), createFact('การเดินทาง', destination.trip));

  const tip = document.createElement('p'); tip.className = 'tip'; tip.textContent = `เคล็ดลับ: ${destination.tip}`;

  // ลิงก์สำหรับเปิดดูพิกัดใน Google Maps ในแท็บใหม่
  const map = document.createElement('a');
  map.className = 'button map-link'; map.target = '_blank'; map.rel = 'noopener noreferrer';
  map.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${destination.name} ${destination.province}`);
  map.append('เปิดใน Google Maps', icon('arrow', 18));
  map.setAttribute('aria-label', 'เปิดใน Google Maps (เปิดแท็บใหม่)');

  body.append(title, place, description, facts, tip, map);

  // ประกอบชิ้นส่วนเข้าใน dialog แล้วสั่งเปิด Modal
  dialog.replaceChildren(close, createImage(destination, 'detail-img'), body);
  dialog.showModal();
}

// ปิด Dialog อัตโนมัติเมื่อคลิกพื้นที่ด้านนอกกล่อง (Backdrop)
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});

// ==========================================
// 7. ระบบสุ่มสถานที่ (Randomizer)
// ==========================================
// สลับชื่อสถานที่เร็วๆ เหมือนกำลังหมุนวงล้อ แล้วค่อยแสดงการ์ดที่สุ่มได้
let shuffleTimer = null;
randomButton.addEventListener('click', () => {
  // สุ่มจากสถานที่ทั้งหมด ไม่ผูกกับ filter
  const index = Math.floor(Math.random() * destinations.length);
  const show = () => randomResult.replaceChildren(createCard(destinations[index]));
  clearInterval(shuffleTimer);
  if (reduceMotion.matches) return show();

  const ticker = document.createElement('p');
  ticker.className = 'shuffle';
  ticker.setAttribute('aria-hidden', 'true'); // ชื่อที่กำลังหมุน ไม่ต้องให้ screen reader อ่าน (อ่านเฉพาะผลจริง)
  randomResult.replaceChildren(ticker);
  let step = 0;
  shuffleTimer = setInterval(() => {
    ticker.textContent = destinations[step % destinations.length].name;
    step++;
    if (step > 10) { clearInterval(shuffleTimer); show(); }
  }, 70);
});

// ==========================================
// 8. Parallax ภูเขาซ้อนชั้น (เฉพาะหน้าแรก)
// ==========================================
// ทุกชั้นในหน้าแรกที่มี data-depth จะเลื่อนลงตาม scroll x depth (ตามจอไปบางส่วน)
// depth มาก = ตามจอไปมาก = ดูอยู่ไกล (ฟ้า 0.6), depth น้อย = เลื่อนเกือบปกติ = ดูอยู่ใกล้ (ป่าหน้าสุด 0.1)
const hero = document.getElementById('home');
const heroLayers = [...hero.querySelectorAll('[data-depth]')].map(el => ({ el, depth: parseFloat(el.dataset.depth) }));
const heroCopy = hero.querySelector('.hero-copy');
let parallaxQueued = false;

function updateParallax() {
  parallaxQueued = false;
  const scrolled = window.scrollY;
  if (scrolled > hero.offsetTop + hero.offsetHeight) return; // เลื่อนพ้นหน้าแรกแล้ว ไม่ต้องคำนวณ
  heroLayers.forEach(({ el, depth }) => {
    el.style.transform = reduceMotion.matches ? '' : `translate3d(0, ${(scrolled * depth).toFixed(1)}px, 0)`;
  });
  // ข้อความหน้าแรกค่อยๆ จางหายเมื่อเลื่อนลง (หายหมดตอนเลื่อนไปครึ่งหน้าแรก)
  heroCopy.style.opacity = reduceMotion.matches ? '' : Math.max(0, 1 - scrolled / (hero.offsetHeight * 0.5)).toFixed(2);
}
function queueParallax() {
  if (!parallaxQueued) { parallaxQueued = true; requestAnimationFrame(updateParallax); }
}
window.addEventListener('scroll', queueParallax, { passive: true });
window.addEventListener('resize', queueParallax);
reduceMotion.addEventListener('change', queueParallax);
updateParallax();

// ==========================================
// 9. เริ่มต้นการทำงาน (Initial Run)
// ==========================================
// แสดงสถานที่ท่องเที่ยวทั้งหมดเมื่อโหลดหน้าเว็บครั้งแรก
renderDestinations('all');
