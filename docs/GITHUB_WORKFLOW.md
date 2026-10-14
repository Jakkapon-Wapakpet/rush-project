# GitHub Workflow

## ผลตรวจ 14 ต.ค. 2026
Repository: https://github.com/Jakkapon-Wapakpet/rush-project
Repository ID: 1418666782; public; default branch main; ยังว่าง ไม่มี commit
บัญชี connector: Jakkapon-Dev; permissions pull=true, push=false
จึงยังไม่ได้สร้าง remote branch, push, issue หรือ PR
ให้เจ้าของเพิ่ม Jakkapon-Dev เป็น collaborator แบบ Write และให้บัญชียอมรับ invitation
หลังเชื่อมสิทธิ์ต้องตรวจ repository และ push permission ซ้ำก่อนเขียน

## เริ่มต้นสำหรับเจ้าของ / ผู้มี Write
Repository ว่างต้องสร้าง main ที่มี commit แรกก่อน จึงสร้าง PR ที่มีฐานได้
1. Clone URL ที่ตรวจแล้วไปโฟลเดอร์ใหม่
2. เพิ่ม README เริ่มต้นบน main และ commit/push เพื่อสร้างฐาน
3. สร้าง feat/day1-foundation จาก main
4. คัดลอกไฟล์ชุด Day 1 นี้เข้า clone โดยไม่คัดลอก .git
5. ตรวจ git remote -v, git status และ diff ก่อน commit/push
6. Push branch และเปิด Draft PR เข้า main ตาม PR body ด้านล่าง
7. ให้เพื่อนตรวจ เปิดหน้าเว็บจริง และ merge หลังตรวจผ่าน

```bash
git clone https://github.com/Jakkapon-Wapakpet/rush-project.git
cd rush-project
git switch -c main
# สร้าง README เริ่มต้นก่อน แล้ว:
git add README.md
git commit -m "docs: initialize Thailand Explorer repository"
git push -u origin main
git switch -c feat/day1-foundation
# คัดลอกชุดไฟล์ Day 1 เข้ามาก่อนคำสั่งต่อไป
git remote -v
git status
git diff --check
git add .
git commit -m "feat: add Thailand Explorer day one foundation"
git push -u origin feat/day1-foundation
```

อย่าใช้ force push หรือ push งาน feature เข้า main โดยตรง

## ทำงานต่อหลัง foundation merge
- A: feat/member-a-layout → main (HTML/CSS/parallax)
- B: feat/member-b-destinations → main (JS/data/images)
- ไม่ต้องมี develop สำหรับทีม 2 คน / 3 วัน
- เริ่มทุกงานจาก main ล่าสุด: git switch main แล้ว git pull --ff-only
- PR หนึ่งงานหนึ่งเป้าหมาย; ระบุสิ่งเปลี่ยนและวิธีทดสอบ
- หลังเพื่อน merge ให้ fetch/merge origin/main เข้า branch ตัวเองและตรวจซ้ำ
- หาก conflict ให้แก้ร่วมกันในไฟล์ที่ชน ไม่ลบโค้ดอีกฝ่ายโดยไม่ตรวจ

## Draft PR ที่เตรียมไว้
Title: feat: add Thailand Explorer Day 1 structure and destination data

Body:
เพิ่ม Single Page ด้วย HTML/CSS/JavaScript พร้อม Navbar, Hero, Explore, Scenic, Discover และ About ข้อมูลสถานที่ 9 แห่ง หมวดละ 3 และ baseline Filter/Random ใช้ได้โดยไม่ต้องติดตั้ง dependency

แยก data.js ออกจาก main.js เพื่อให้สมาชิก B ดูแลข้อมูลและ logic ส่วนสมาชิก A ดูแล HTML/CSS ใช้ CSS parallax สองจุดพร้อม fallback มือถือและ reduced motion

ยังต้องเปลี่ยนภาพประกอบหมวดเป็นภาพสถานที่จริง ตรวจ Wireframe เดิม และกรอก auteur จริงก่อนส่ง
ผลตรวจที่ทำแล้วและข้อจำกัดอยู่ docs/DAY1_REVIEW.md
