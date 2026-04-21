/* ============================================================
   ZOO WEBAPP — MOCK DATA
   สวนสัตว์เขาไม่รัก — All application mock data
   ============================================================ */

const MOCK_USERS = [
  {
    id: 1,
    role: 'admin',
    email: 'admin@zoo.th',
    password: 'Admin1234',
    firstName: 'ผู้ดูแล',
    lastName: 'ระบบ',
    name: 'ผู้ดูแลระบบ',
    phone: '020000001',
    dob: '1990-01-01',
    createdAt: '2025-01-01',
    status: 'active'
  },
  {
    id: 2,
    role: 'user',
    email: 'user@zoo.th',
    password: 'User1234',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    name: 'สมชาย ใจดี',
    phone: '0812345678',
    dob: '1995-06-15',
    createdAt: '2025-03-10',
    status: 'active'
  },
  {
    id: 3,
    role: 'user',
    email: 'nipa@zoo.th',
    password: 'User1234',
    firstName: 'นิภา',
    lastName: 'รักสัตว์',
    name: 'นิภา รักสัตว์',
    phone: '0898765432',
    dob: '1998-11-22',
    createdAt: '2025-04-05',
    status: 'active'
  },
  {
    id: 4,
    role: 'user',
    email: 'wichai@zoo.th',
    password: 'User1234',
    firstName: 'วิชัย',
    lastName: 'ธรรมดี',
    name: 'วิชัย ธรรมดี',
    phone: '0876543210',
    dob: '2000-02-14',
    createdAt: '2025-05-20',
    status: 'active'
  }
];

const MOCK_ZONES = [
  { id: 1, name: 'Zone 1', nameTH: 'โซน 1 — แอฟริกา', color: '#f97316', description: 'สัตว์จากทวีปแอฟริกา' },
  { id: 2, name: 'Zone 2', nameTH: 'โซน 2 — เอเชีย',   color: '#ec4899', description: 'สัตว์จากทวีปเอเชีย' },
  { id: 3, name: 'Zone 3', nameTH: 'โซน 3 — อเมริกา', color: '#a855f7', description: 'สัตว์จากทวีปอเมริกา' }
];

const MOCK_ANIMALS = [
  /* ==================== ZONE 1 — AFRICA ==================== */
  {
    id: 1,
    zoneId: 1,
    zone: 'Zone 1',
    cageCode: 'PR-001',
    nameTH: 'ตาหวาน',
    speciesTH: 'สิงโตแอฟริกา',
    speciesEN: 'African Lion',
    gender: 'ผู้',
    ageMonths: 5,
    ageDisplay: '5 เดือน',
    origin: 'ทุ่งหญ้าสะวันนา ทวีปแอฟริกา',
    diet: 'เนื้อสัตว์',
    weight: '28 กก.',
    status: 'active',
    featured: true,
    image: 'images/istockphoto-889610222-612x612 1.png',
    cardImage: 'images/istockphoto-889610222-612x612 1.png',
    description: 'สิงโตเจ้าป่าวัยเยาว์ที่น่ารักและซุกซน'
  },
  {
    id: 3,
    zoneId: 1,
    zone: 'Zone 1',
    cageCode: 'PR-003',
    nameTH: 'แรด',
    speciesTH: 'แรดขาว',
    speciesEN: 'White Rhinoceros',
    gender: 'ผู้',
    ageMonths: 84,
    ageDisplay: '7 ปี',
    origin: 'แอฟริกาใต้',
    diet: 'หญ้า ผลไม้',
    weight: '1,200 กก.',
    status: 'active',
    featured: true,
    image: 'images/rhino-white-background-1 1.png',
    cardImage: 'images/rhino-white-background-1 1.png',
    description: 'แรดขาวตัวใหญ่ใจดี รักสงบ'
  },

  /* ==================== ZONE 2 — ASIA ==================== */
  {
    id: 4,
    zoneId: 2,
    zone: 'Zone 2',
    cageCode: 'AS-001',
    nameTH: 'พลาย',
    speciesTH: 'ช้างเอเชีย',
    speciesEN: 'Asian Elephant',
    gender: 'ผู้',
    ageMonths: 120,
    ageDisplay: '10 ปี',
    origin: 'ประเทศไทย',
    diet: 'หญ้า ผลไม้ อ้อย',
    weight: '2,800 กก.',
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=450&h=560&fit=crop',
    cardImage: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&h=280&fit=crop',
    description: 'พลายเป็นช้างเอเชียที่เชื่อง ชอบโชว์กายกรรมและว่ายน้ำเป็นที่ชื่นชอบของผู้ชม'
  },
  {
    id: 5,
    zoneId: 2,
    zone: 'Zone 2',
    cageCode: 'AS-002',
    nameTH: 'บิ๊ก',
    speciesTH: 'เสือโคร่งขาว',
    speciesEN: 'White Tiger',
    gender: 'ผู้',
    ageMonths: 48,
    ageDisplay: '4 ปี',
    origin: 'อินเดีย',
    diet: 'เนื้อสัตว์ ปลา',
    weight: '195 กก.',
    status: 'active',
    featured: false,
    image: 'images/whitetiger.png',
    cardImage: 'images/whitetiger.png',
    description: 'บิ๊กเป็นเสือโคร่งขาวที่หายากและสวยงาม เขามีพฤติกรรมเงียบขรึมและเป็นราชา'
  },
  {
    id: 6,
    zoneId: 2,
    zone: 'Zone 2',
    cageCode: 'AS-003',
    nameTH: 'หมวย',
    speciesTH: 'อุรังอุตัง',
    speciesEN: 'Orangutan',
    gender: 'เมีย',
    ageMonths: 72,
    ageDisplay: '6 ปี',
    origin: 'เกาะบอร์เนียว',
    diet: 'ผลไม้ ใบไม้ แมลง',
    weight: '32 กก.',
    status: 'active',
    featured: false,
    image: 'images/Orangutan.png',
    cardImage: 'images/Orangutan.png',
    description: 'หมวยเป็นอุรังอุตังที่ฉลาดมาก เธอชอบเล่นของเล่นและมักทำให้ผู้ชมหัวเราะ'
  },

  /* ==================== ZONE 3 — AMERICAS ==================== */
  {
    id: 7,
    zoneId: 3,
    zone: 'Zone 3',
    cageCode: 'AM-001',
    nameTH: 'สมปอง',
    speciesTH: 'เม่นแคระ',
    speciesEN: 'African Pygmy Hedgehog',
    gender: 'เมีย',
    ageMonths: 18,
    ageDisplay: '1.5 ปี',
    origin: 'แอฟริกากลาง',
    diet: 'แมลง ผลไม้',
    weight: '0.35 กก.',
    status: 'active',
    featured: true,
    image: 'images/360_F_181402437_35nrjnNtPERM9xRqLTJoPYda3aP65jYy 1.png',
    cardImage: 'images/360_F_181402437_35nrjnNtPERM9xRqLTJoPYda3aP65jYy 1.png',
    description: 'เม่นแคระตัวน้อยน่ารัก'
  },
  {
    id: 8,
    zoneId: 3,
    zone: 'Zone 3',
    cageCode: 'AM-002',
    nameTH: 'สายไหม',
    speciesTH: 'ฮิปโปโปตามัส',
    speciesEN: 'Hippopotamus',
    gender: 'เมีย',
    ageMonths: 96,
    ageDisplay: '8 ปี',
    origin: 'แอฟริกาใต้สะฮารา',
    diet: 'หญ้า ผักสด',
    weight: '1,500 กก.',
    status: 'active',
    featured: false,
    image: 'images/hippo.png',
    cardImage: 'images/hippo.png',
    description: 'สายเป็นฮิปโปตัวใหญ่ใจดี เธอชอบว่ายน้ำและมักเปล่งเสียงร้องดังตอนเช้า'
  },
  {
    id: 9,
    zoneId: 3,
    zone: 'Zone 3',
    cageCode: 'AM-003',
    nameTH: 'นอนน้อย',
    speciesTH: 'แพนด้ายักษ์',
    speciesEN: 'Giant Panda',
    gender: 'ผู้',
    ageMonths: 30,
    ageDisplay: '2.5 ปี',
    origin: 'จีน',
    diet: 'ไผ่ ผลไม้',
    weight: '85 กก.',
    status: 'active',
    featured: false,
    image: 'images/panda.jpg',
    cardImage: 'images/panda.jpg',
    description: 'หมีน้อยเป็นแพนด้าตัวน้อยที่น่ารักที่สุดในสวนสัตว์ เขาชอบกินไผ่และกลิ้งเล่น'
  }
];

const TICKET_TYPES = [
  {
    id: 'adult',
    nameTH: 'บัตรเข้าชมราคาผู้ใหญ่',
    type: 'ผู้ใหญ่',
    ageRange: '18+ ปี',
    icon: '👨‍👩‍👧',
    image: 'images/parenting 1.png',
    price: 100,
    isFree: false
  },
  {
    id: 'child',
    nameTH: 'บัตรเข้าชมราคาเด็ก',
    type: 'เด็ก',
    ageRange: '4–18 ปี',
    icon: '👧',
    image: 'images/children 1.png',
    price: 60,
    isFree: false
  },
  {
    id: 'infant',
    nameTH: 'บัตรเข้าชมราคาเด็กทารก',
    type: 'เด็กทารก',
    ageRange: '0–3 ปี',
    icon: '👶',
    image: 'images/baby 1.png',
    price: 0,
    isFree: true
  }
];

const MOCK_PROMOTIONS = [
  {
    id: 1,
    code: '3SALE',
    discountType: 'fixed',
    discountAmount: 20,
    minimumOrder: 0,
    expiryDate: '2026-12-31',
    description: 'ส่วนลด ฿20 สำหรับทุกการซื้อ',
    isActive: true,
    usageCount: 47
  },
  {
    id: 2,
    code: 'SUMMER50',
    discountType: 'fixed',
    discountAmount: 50,
    minimumOrder: 200,
    expiryDate: '2026-08-31',
    description: 'ส่วนลด ฿50 เมื่อซื้อครบ ฿200',
    isActive: true,
    usageCount: 23
  },
  {
    id: 3,
    code: 'FAMILY20',
    discountType: 'percent',
    discountAmount: 20,
    minimumOrder: 300,
    expiryDate: '2026-12-31',
    description: 'ส่วนลด 20% แพ็คเกจครอบครัว',
    isActive: true,
    usageCount: 12
  },
  {
    id: 4,
    code: 'STUDENT10',
    discountType: 'percent',
    discountAmount: 10,
    minimumOrder: 0,
    expiryDate: '2026-07-31',
    description: 'ส่วนลด 10% สำหรับนักศึกษา',
    isActive: false,
    usageCount: 89
  }
];

const MOCK_TICKET_HISTORY = [
  {
    id: '#555555',
    userId: 2,
    date: '2026-02-29',
    dateDisplay: '29 ก.พ. 2026',
    type: 'ผู้ใหญ่',
    typeId: 'adult',
    quantity: 1,
    unitPrice: 100,
    total: 100,
    discount: 0,
    promo: null,
    paymentMethod: 'CreditCard',
    status: 'completed'
  },
  {
    id: '#555556',
    userId: 2,
    date: '2026-02-29',
    dateDisplay: '29 ก.พ. 2026',
    type: 'ผู้ใหญ่',
    typeId: 'adult',
    quantity: 1,
    unitPrice: 100,
    total: 100,
    discount: 0,
    promo: null,
    paymentMethod: 'PromptPay',
    status: 'completed'
  },
  {
    id: '#555557',
    userId: 2,
    date: '2026-02-29',
    dateDisplay: '29 ก.พ. 2026',
    type: 'เด็ก',
    typeId: 'child',
    quantity: 1,
    unitPrice: 60,
    total: 60,
    discount: 0,
    promo: null,
    paymentMethod: 'CreditCard',
    status: 'completed'
  },
  {
    id: '#555558',
    userId: 2,
    date: '2026-03-15',
    dateDisplay: '15 มี.ค. 2026',
    type: 'ผู้ใหญ่',
    typeId: 'adult',
    quantity: 2,
    unitPrice: 100,
    total: 180,
    discount: 20,
    promo: '3SALE',
    paymentMethod: 'CreditCard',
    status: 'completed'
  },
  {
    id: '#555561',
    userId: 3,
    date: '2026-04-01',
    dateDisplay: '1 เม.ย. 2026',
    type: 'เด็ก',
    typeId: 'child',
    quantity: 3,
    unitPrice: 60,
    total: 130,
    discount: 50,
    promo: 'SUMMER50',
    paymentMethod: 'PromptPay',
    status: 'completed'
  }
];

const MOCK_SHOWS = [
  {
    id: 1,
    nameTH: 'การแสดงสิงโต',
    description: 'ชมความน่ารักของฝูงสิงโตในแอฟริกา',
    timeSlots: ['10:30', '14:30'],
    period: 'AM/PM',
    duration: '30 นาที',
    zone: 'Zone 1',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&h=450&fit=crop'
  },
  {
    id: 2,
    nameTH: 'การแสดงช้าง',
    description: 'ชมความฉลาดและพละกำลังของช้างไทย',
    timeSlots: ['11:00', '15:00'],
    period: 'AM/PM',
    duration: '45 นาที',
    zone: 'Zone 2',
    image: ''
  },
  {
    id: 3,
    nameTH: 'การแสดงอุรังอุตัง',
    description: 'ความฉลาดของอุรังอุตังที่ทำให้ทึ่ง',
    timeSlots: ['13:00', '16:00'],
    period: 'PM',
    duration: '20 นาที',
    zone: 'Zone 2',
    image: ''
  },
  {
    id: 4,
    nameTH: 'ให้อาหารฮิปโป',
    description: 'กิจกรรมให้อาหารฮิปโปใกล้ชิด',
    timeSlots: ['09:00', '16:30'],
    period: 'AM/PM',
    duration: '15 นาที',
    zone: 'Zone 3',
    image: ''
  }
];

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: 'คุณวรรณา มีสุข',
    label: 'ผู้ปกครอง',
    stars: 5,
    text: 'พาลูกมาเที่ยวแล้วประทับใจมาก บรรยากาศดี สะอาด สัตว์น่ารักทุกตัว ลูกชอบมากเป็นพิเศษตรงโซนช้าง จะพาครอบครัวมาอีกแน่นอน! 🐘',
    avatar: '👩'
  },
  {
    id: 2,
    name: 'คุณสมพงษ์ ใจดี',
    label: 'นักท่องเที่ยว',
    stars: 5,
    text: 'ซื้อบัตรออนไลน์สะดวกมาก ไม่ต้องรอคิว เข้าสวนสัตว์ได้ทันที การจัดการดีมากครับ ราคาก็ไม่แพง คุ้มมากกับสิ่งที่ได้รับ 👍',
    avatar: '👨'
  },
  {
    id: 3,
    name: 'คุณอรนุช พรมสุวรรณ',
    label: 'นักท่องเที่ยว',
    stars: 4,
    text: 'มาเที่ยวกับแก๊งเพื่อน สนุกมากค่ะ สัตว์น่ารักทุกตัว ชอบโซนแพนด้าเป็นพิเศษ หมีน้อยน่ารักมากจนอยากกอด 🐼 จะแนะนำเพื่อนมาแน่นอน',
    avatar: '👩‍🦰'
  }
];

/* ======================== HELPER FUNCTIONS ======================== */

/**
 * Find user by email and password
 */
function findUser(email, password) {
  return MOCK_USERS.find(u => u.email === email && u.password === password) || null;
}

/**
 * Find user by email only
 */
function findUserByEmail(email) {
  return MOCK_USERS.find(u => u.email === email) || null;
}

/**
 * Get next user ID
 */
function getNextUserId() {
  return Math.max(...MOCK_USERS.map(u => u.id)) + 1;
}

/**
 * Register new user (add to mock list)
 */
function registerUser(data) {
  const newUser = {
    id: getNextUserId(),
    role: 'user',
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName} ${data.lastName}`,
    phone: data.phone,
    dob: data.dob,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active'
  };
  MOCK_USERS.push(newUser);
  return newUser;
}

/**
 * Validate promotion code
 */
function validatePromo(code, orderTotal) {
  const promo = MOCK_PROMOTIONS.find(p => p.code === code.toUpperCase() && p.isActive);
  if (!promo) return { valid: false, message: 'ไม่พบรหัสส่วนลดนี้' };

  const today = new Date().toISOString().split('T')[0];
  if (promo.expiryDate < today) return { valid: false, message: 'รหัสส่วนลดหมดอายุแล้ว' };

  if (promo.minimumOrder > 0 && orderTotal < promo.minimumOrder) {
    return { valid: false, message: `ต้องซื้อขั้นต่ำ ฿${promo.minimumOrder}` };
  }

  let discountAmount = 0;
  if (promo.discountType === 'fixed') {
    discountAmount = promo.discountAmount;
  } else if (promo.discountType === 'percent') {
    discountAmount = Math.floor(orderTotal * promo.discountAmount / 100);
  }

  return { valid: true, promo, discountAmount, message: promo.description };
}

/**
 * Get ticket history for a user
 */
function getUserTicketHistory(userId) {
  return MOCK_TICKET_HISTORY.filter(t => t.userId === userId);
}

/**
 * Get all animals (optionally by zone)
 */
function getAnimals(zoneId = null) {
  if (zoneId) return MOCK_ANIMALS.filter(a => a.zoneId === zoneId);
  return MOCK_ANIMALS;
}

/**
 * Get animal by ID
 */
function getAnimalById(id) {
  return MOCK_ANIMALS.find(a => a.id === parseInt(id)) || null;
}

/**
 * Get featured animals for home page
 */
function getFeaturedAnimals() {
  return MOCK_ANIMALS.filter(a => a.featured);
}

/**
 * Generate unique ticket ID
 */
function generateTicketId() {
  const base = 555558;
  const rand = Math.floor(Math.random() * 1000);
  return '#' + (base + rand + MOCK_TICKET_HISTORY.length);
}

/**
 * Add ticket to history
 */
function addTicketHistory(userId, items, discount, promo, paymentMethod) {
  const now = new Date();
  const dateDisplay = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const date = now.toISOString().split('T')[0];

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  items.forEach(item => {
    if (item.qty <= 0) return;
    const ticket = {
      id: generateTicketId(),
      userId,
      date,
      dateDisplay,
      type: item.type,
      typeId: item.id,
      quantity: item.qty,
      unitPrice: item.price,
      total: item.price * item.qty - (item === items[0] ? discount : 0),
      discount: item === items[0] ? discount : 0,
      promo: promo || null,
      paymentMethod,
      status: 'completed'
    };
    MOCK_TICKET_HISTORY.push(ticket);
  });
}

/**
 * Get all users
 */
function getAllUsers() {
  return MOCK_USERS;
}

/**
 * Update user role
 */
function updateUserRole(userId, newRole) {
  const user = MOCK_USERS.find(u => u.id == userId);
  if (user) {
    user.role = newRole.toLowerCase();
    return true;
  }
  return false;
}

