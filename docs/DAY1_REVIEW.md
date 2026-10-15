# Day 1 Review

## ทำแล้ว
- HTML ครบทุก section และ navbar anchor ตรง id
- ข้อมูล 9 แห่ง ID ไม่ซ้ำ หมวดละ 3 และรูป local มีครบ
- แยก HTML/CSS/Data/JavaScript และใช้ defer ตามลำดับ
- baseline filter และ random พร้อม ARIA status
- CSS responsive 3/2/1 คอลัมน์ และ parallax Hero/Scenic พร้อม mobile/reduced-motion fallback
- แผนแบ่งงาน, workflow และ PR template พร้อมใช้

## ผลตรวจจริง
- node --check data.js และ main.js: ผ่าน
- ทดสอบด้วย DOM stub: initial render 9, filter 9/3/3/3, aria-pressed และ Random 20 ครั้ง: ผ่าน
- unique ID และ path ภาพทุก record: ผ่าน
- ยังไม่ได้ตรวจ layout/scroll/focus บน browser จริง: Playwright มีไลบรารี แต่ไม่มี Chromium executable
- DOM stub ไม่ยืนยันการ render/overflow/parallax จริง ต้องเปิดตรวจ 320/375/768/1440px ใน Day 2

## ยังไม่ใช่ชุดส่งสุดท้าย
ภาพเป็นภาพประกอบหมวด; ต้องเปลี่ยนภาพจริงพร้อมตรวจสิทธิ์
Wireframe เดิมยังค้นไม่พบ จึงอิงเฉพาะลำดับ section ที่ผู้ใช้ยืนยัน
ต้องใส่ 42 login จริงใน auteur; auteur.example เป็นตัวอย่างเท่านั้น
ยังไม่มี remote commit/branch/PR เพราะ connector ไม่มี push permission และ repository ว่าง
