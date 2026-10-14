// Member B: อ่านข้อมูล -> สร้างการ์ด -> แสดงในหน้าเว็บ
const destinationList = document.getElementById('destination-list');
const destinationCount = document.getElementById('destination-count');
const filterButtons = document.querySelectorAll('[data-category]');
const randomButton = document.getElementById('random-button');
const randomResult = document.getElementById('random-result');

function createCard(destination) {
  const card = document.createElement('article');
  card.className = 'destination-card';
  const image = document.createElement('img');
  image.src = destination.image;
  image.alt = destination.imageAlt;
  image.loading = 'lazy';
  const content = document.createElement('div');
  content.className = 'card-content';
  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = destination.category;
  const name = document.createElement('h3');
  name.textContent = destination.name;
  const province = document.createElement('p');
  province.textContent = destination.province;
  const description = document.createElement('p');
  description.textContent = destination.description;
  content.append(category, name, province, description);
  card.append(image, content);
  return card;
}

function renderDestinations(category) {
  // All ใช้ทั้ง array; หมวดอื่นคัดเฉพาะ category ที่ตรงกัน
  const visibleDestinations = category === 'all'
    ? destinations
    : destinations.filter(destination => destination.category === category);
  destinationList.replaceChildren();
  visibleDestinations.forEach(destination => {
    destinationList.append(createCard(destination));
  });
  destinationCount.textContent = `แสดง ${visibleDestinations.length} สถานที่`;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(filter => {
      filter.setAttribute('aria-pressed', String(filter === button));
    });
    renderDestinations(button.dataset.category);
  });
});

randomButton.addEventListener('click', () => {
  // เลือก index ตั้งแต่ 0 ถึง length - 1 จากข้อมูลทั้งหมด ไม่ผูกกับ filter
  const index = Math.floor(Math.random() * destinations.length);
  randomResult.replaceChildren(createCard(destinations[index]));
});

renderDestinations('all');
