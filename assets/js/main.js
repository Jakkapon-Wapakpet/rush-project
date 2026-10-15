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
// ฟังก์ชันปิดเมนูมือถือ
function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'ปิด' : 'เมนู';
  document.body.classList.toggle('menu-open', open);
}
function closeMenu() {
  setMenu(false);
}

// กดปุ่ม Toggle เพื่อเปิด/ปิดเมนู
menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

// ไฮไลต์ลิงก์ของ section ที่กำลังดูอยู่
const navLinks = [...mainNav.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['home', 'journey', 'explore', 'discover', 'about'].forEach(id => sectionObserver.observe(document.getElementById(id)));

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
  };
  button.append(icon('heart', 24));
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
  card.dataset.cat = destination.category;

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

  // ภาพอยู่ในกรอบ เพื่อซูมตอน hover ได้โดยไม่ล้นการ์ด
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

  body.append(title, place, description, facts, tip, map);

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
// สลับชื่อสถานที่เร็วๆ เหมือนแท่นพิมพ์กำลังหมุน แล้วค่อยแสดงการ์ดที่สุ่มได้
let shuffleTimer = null;
randomButton.addEventListener('click', () => {
  // สุ่มจากสถานที่ทั้งหมด ไม่ผูกกับ filter
  const index = Math.floor(Math.random() * destinations.length);
  const show = () => randomResult.replaceChildren(createCard(destinations[index]));
  clearInterval(shuffleTimer);
  if (reduceMotion.matches) return show();

  const ticker = document.createElement('p');
  ticker.className = 'shuffle';
  randomResult.replaceChildren(ticker);
  let step = 0;
  shuffleTimer = setInterval(() => {
    ticker.textContent = destinations[step % destinations.length].name;
    step++;
    if (step > 10) { clearInterval(shuffleTimer); show(); }
  }, 70);
});

// ==========================================
// 8. ฉากเต็มจอ 9 สถานที่ + Parallax
// ==========================================
// สร้างฉากละ 1 สถานที่จาก data.js: ภาพพื้นหลัง, ชื่อหมวดตัวใหญ่จางๆ, และข้อความ
const journey = document.getElementById('journey');
destinations.forEach(destination => {
  const sameCategory = destinations.filter(d => d.category === destination.category);
  const order = sameCategory.indexOf(destination) + 1;

  const scene = document.createElement('section');
  scene.className = 'scene place';
  scene.dataset.scene = '';
  scene.setAttribute('aria-label', destination.name);

  const bg = createImage(destination, 'scene-bg');
  bg.dataset.speed = '0.35';
  bg.alt = '';

  const shade = document.createElement('div');
  shade.className = 'scene-shade';

  // ชื่อหมวดตัวใหญ่ เลื่อนเร็วสุด ให้รู้สึกว่าอยู่ใกล้ตา
  const ghost = document.createElement('p');
  ghost.className = 'ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.textContent = CATEGORY_LABEL[destination.category];
  ghost.dataset.speed = '-0.45';

  const content = document.createElement('div');
  content.className = 'scene-content';
  content.dataset.speed = '-0.2';
  content.dataset.fade = '';

  const meta = document.createElement('p');
  meta.className = 'place-meta';
  meta.textContent = `${CATEGORY_LABEL[destination.category]} · ${order} จาก ${sameCategory.length}`;

  const title = document.createElement('h2');
  title.textContent = destination.name;

  const province = document.createElement('p');
  province.className = 'province';
  province.textContent = `จังหวัด${destination.province}`;

  const description = document.createElement('p');
  description.className = 'desc';
  description.textContent = destination.description;

  const season = document.createElement('p');
  season.className = 'place-season';
  const seasonLabel = document.createElement('b');
  seasonLabel.textContent = 'ช่วงที่เหมาะ ';
  season.append(seasonLabel, destination.season);

  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'button';
  more.textContent = 'ดูรายละเอียด';
  more.addEventListener('click', () => openDetail(destination));

  const actions = document.createElement('div');
  actions.className = 'place-actions';
  actions.append(more, createFavButton(destination));

  content.append(meta, title, province, description, season, actions);
  scene.append(bg, shade, ghost, content);
  journey.append(scene);
});

// ทุกฉาก [data-scene]: ลูกที่มี data-speed เลื่อนตามระยะห่างจากกลางจอ x speed
// speed บวก = ตามจอช้ากว่า (ดูไกล), speed ลบ = วิ่งสวน (ดูใกล้), data-fade = จางเมื่อออกจากกลางจอ
const scenes = [...document.querySelectorAll('[data-scene]')].map(scene => ({
  scene,
  layers: [...scene.querySelectorAll('[data-speed]')].map(el => ({
    el, speed: parseFloat(el.dataset.speed), fade: el.hasAttribute('data-fade')
  }))
}));
let parallaxQueued = false;
function updateParallax() {
  parallaxQueued = false;
  const vh = window.innerHeight;
  scenes.forEach(({ scene, layers }) => {
    const rect = scene.getBoundingClientRect();
    if (rect.bottom < -50 || rect.top > vh + 50) return; // อยู่นอกจอ ไม่ต้องคำนวณ
    // 0 = ฉากอยู่กลางจอพอดี, บวก = ฉากเลื่อนขึ้นไปแล้ว
    const distance = vh / 2 - (rect.top + rect.height / 2);
    layers.forEach(({ el, speed, fade }) => {
      if (reduceMotion.matches) { el.style.transform = ''; el.style.opacity = ''; return; }
      el.style.transform = `translate3d(0, ${(distance * speed).toFixed(1)}px, 0)`;
      if (fade) el.style.opacity = Math.max(0, 1 - Math.abs(distance) / (vh * 0.75)).toFixed(3);
    });
  });
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

