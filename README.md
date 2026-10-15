# Thailand Explorer — Day 1

HTML / CSS / JavaScript แบบ Single Page ไม่มี dependency, backend หรือ database
เปิด `index.html` โดยตรง หรือใช้ `python3 -m http.server 8000` แล้วเปิด http://localhost:8000

## โครงสร้าง
- index.html — Navbar, Hero, Explore, Scenic, Discover, About, Footer
- css/style.css — layout, สี, responsive, CSS parallax
- js/data.js — ข้อมูล 9 แห่ง หมวดละ 3
- js/main.js — createCard, renderDestinations, filter และ random
- assets/images/ — SVG ภาพประกอบหมวด ยังไม่ใช่ภาพถ่ายสถานที่จริง
- docs/TEAM_PLAN.md — แบ่งงาน 3 วัน
- docs/GITHUB_WORKFLOW.md — Branch และ PR
- docs/DAY1_REVIEW.md — ผลตรวจและข้อจำกัด
- .github/pull_request_template.md — เช็กลิสต์ก่อนรวมงาน
- auteur.example — ต้องเปลี่ยนเป็น auteur และใส่ 42 login จริงสองคนก่อนส่ง

## ลำดับอ่านโค้ด
1. index.html กำหนดพื้นที่และ id ที่ JavaScript ใช้
2. data.js เก็บ array ของ object แต่ละ object คือสถานที่หนึ่งแห่ง
3. main.js เรียก renderDestinations('all') แล้วสร้างการ์ดผ่าน createCard
4. กด Filter จะคัด array ด้วย filter แล้ววาดใหม่; กด Random จะสุ่ม index
5. style.css ใช้ Grid สำหรับการ์ด และ media query เปลี่ยน 3 → 2 → 1 คอลัมน์
6. .parallax ใช้ background-attachment: fixed สองจุด; มือถือ/reduced motion ใช้ scroll

รายละเอียดข้อมูลใช้ textContent เพื่อลดความเสี่ยงจากการแทรก HTML และไม่ต้องใช้ framework
Random อาจได้สถานที่ซ้ำได้ตามปกติ และสุ่มจากทั้งหมดแม้กำลังเลือกหมวดอยู่

## ก่อนส่ง
ภาพสถานที่จริงพร้อมแหล่งที่มา, ตรวจ Wireframe ต้นฉบับ, ใส่ auteur จริง และทดสอบ Desktop/Mobile ด้วยสายตา
