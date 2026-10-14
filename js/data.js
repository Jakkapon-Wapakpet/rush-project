// Member B: ข้อมูลกลาง 9 แห่ง หมวดละ 3 แห่ง
const destinations = [
  {
    "id": "railay",
    "name": "หาดไร่เลย์",
    "province": "กระบี่",
    "category": "beach",
    "description": "ชายหาดที่มีหน้าผาหินปูนล้อมรอบ เหมาะกับการเดินชมทะเล",
    "image": "assets/images/beach.svg",
    "imageAlt": "ภาพประกอบหมวด beach ไม่ใช่ภาพถ่ายสถานที่"
  },
  {
    "id": "samed",
    "name": "เกาะเสม็ด",
    "province": "ระยอง",
    "category": "beach",
    "description": "เกาะที่มีชายหาดหลายแห่ง เหมาะกับวันพักผ่อนริมทะเล",
    "image": "assets/images/beach.svg",
    "imageAlt": "ภาพประกอบหมวด beach ไม่ใช่ภาพถ่ายสถานที่"
  },
  {
    "id": "larn",
    "name": "เกาะล้าน",
    "province": "ชลบุรี",
    "category": "beach",
    "description": "เกาะใกล้พัทยาที่มีชายหาดและจุดชมวิวทะเล",
    "image": "assets/images/beach.svg",
    "imageAlt": "ภาพประกอบหมวด beach ไม่ใช่ภาพถ่ายสถานที่"
  },
  {
    "id": "inthanon",
    "name": "ดอยอินทนนท์",
    "province": "เชียงใหม่",
    "category": "mountain",
    "description": "ภูเขาสูงที่มีเส้นทางศึกษาธรรมชาติและอากาศเย็น",
    "image": "assets/images/mountain.svg",
    "imageAlt": "ภาพประกอบหมวด mountain ไม่ใช่ภาพถ่ายสถานที่"
  },
  {
    "id": "phu-kradueng",
    "name": "ภูกระดึง",
    "province": "เลย",
    "category": "mountain",
    "description": "พื้นที่เดินป่าบนภูเขา มีป่าสนและจุดชมวิว",
    "image": "assets/images/mountain.svg",
    "imageAlt": "ภาพประกอบหมวด mountain ไม่ใช่ภาพถ่ายสถานที่"
  },
  {
    "id": "khao-yai",
    "name": "เขาใหญ่",
    "province": "นครราชสีมา",
    "category": "mountain",
    "description": "พื้นที่ธรรมชาติที่มีป่า น้ำตก และเส้นทางเดินชมธรรมชาติ",
    "image": "assets/images/mountain.svg",
    "imageAlt": "ภาพประกอบหมวด mountain ไม่ใช่ภาพถ่ายสถานที่"
  },
  {
    "id": "wat-arun",
    "name": "วัดอรุณ",
    "province": "กรุงเทพมหานคร",
    "category": "culture",
    "description": "วัดริมแม่น้ำเจ้าพระยาที่โดดเด่นด้วยพระปรางค์",
    "image": "assets/images/culture.svg",
    "imageAlt": "ภาพประกอบหมวด culture ไม่ใช่ภาพถ่ายสถานที่"
  },
  {
    "id": "ayutthaya",
    "name": "อุทยานประวัติศาสตร์พระนครศรีอยุธยา",
    "province": "พระนครศรีอยุธยา",
    "category": "culture",
    "description": "เรียนรู้เรื่องราวเมืองเก่าผ่านโบราณสถานและวัด",
    "image": "assets/images/culture.svg",
    "imageAlt": "ภาพประกอบหมวด culture ไม่ใช่ภาพถ่ายสถานที่"
  },
  {
    "id": "sukhothai",
    "name": "อุทยานประวัติศาสตร์สุโขทัย",
    "province": "สุโขทัย",
    "category": "culture",
    "description": "ชมโบราณสถานและสถาปัตยกรรมของเมืองสุโขทัย",
    "image": "assets/images/culture.svg",
    "imageAlt": "ภาพประกอบหมวด culture ไม่ใช่ภาพถ่ายสถานที่"
  }
];
