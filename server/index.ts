import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { db, initDatabase, DB_PATH } from './database.ts';

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. 系統與資料庫狀態檢視
app.get('/api/system/status', (req, res) => {
  try {
    const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    const memberCount = (db.prepare('SELECT COUNT(*) as c FROM members').get() as { c: number }).c;
    const recordCount = (db.prepare('SELECT COUNT(*) as c FROM lab_records').get() as { c: number }).c;
    const dbStat = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH) : null;

    res.json({
      status: 'healthy',
      engine: 'SQLite (Node.js 24 Native)',
      databaseFile: DB_PATH,
      databaseSizeBytes: dbStat ? dbStat.size : 0,
      counts: {
        users: userCount,
        members: memberCount,
        labRecords: recordCount,
      },
      serverTime: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 身分驗證：帳號密碼登入
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '請輸入使用者帳號與密碼' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user || user.password !== password) {
    return res.status(401).json({ error: '帳號或密碼不正確' });
  }

  // 產生 Session Token
  const token = 'sess_' + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token, user.id, new Date().toISOString(), expiresAt
  );

  const { password: _, ...userSafe } = user;
  res.json({
    token,
    user: userSafe,
    message: `歡迎回來，${user.name}！`
  });
});

// 3. 身分驗證：LINE 一鍵快速登入 (LINE LIFF Quick Login)
app.post('/api/auth/line-login', (req, res) => {
  const { lineUserId = 'U1001_chen_wei', displayName = '陳偉 (本人)' } = req.body;

  let user = db.prepare('SELECT * FROM users WHERE line_user_id = ?').get(lineUserId) as any;
  if (!user) {
    // 預設關聯到陳偉
    user = db.prepare('SELECT * FROM users WHERE username = ?').get('chen_wei') as any;
  }

  const token = 'sess_line_' + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token, user.id, new Date().toISOString(), expiresAt
  );

  const { password: _, ...userSafe } = user;
  res.json({
    token,
    user: userSafe,
    provider: 'LINE',
    message: `LINE 認證成功，歡迎 ${displayName}！`
  });
});

// 3.1 身分驗證：註冊新使用者 (新增使用者)
app.post('/api/auth/register', (req, res) => {
  const { username, password, name, role = '本人', age = 35, gender = 'M' } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: '請完整填寫帳號、密碼與真實姓名' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: '密碼長度至少需要 4 碼' });
  }

  // 檢查帳號是否已存在
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(400).json({ error: '此帳號已被註冊，請選擇其他帳號' });
  }

  const userId = 'usr-' + Date.now();
  const memberId = 'member-' + Date.now();
  const createdAt = new Date().toISOString();

  try {
    // 1. 寫入 users 資料表
    db.prepare(`
      INSERT INTO users (id, username, password, name, role, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, password, name, role, '/icon-192.png', createdAt);

    // 2. 自動在 members 資料表建立個人健康資產檔案
    const baseLife = gender === 'F' ? 48.0 : 42.0;
    db.prepare(`
      INSERT INTO members (
        id, user_id, name, role, age, gender, base_life_expectancy, dynamic_bonus,
        next_clinic_date, next_clinic_department, next_clinic_doctor, companion_notes,
        sleep_hours_daily, daily_steps, spo2, resting_heart_rate, health_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      memberId, userId, name, role, Number(age) || 35, gender, baseLife, 1.5,
      new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      '家醫科 / 預防醫學', '陳建國 主治醫師', '新註冊會員，建議預約初診建立基線健檢資料。',
      7.0, 6000, 98, 72, 75
    );

    // 3. 建立登入 Session
    const token = 'sess_' + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
      token, userId, createdAt, expiresAt
    );

    const newMember = {
      id: memberId,
      userId,
      name,
      role,
      age: Number(age) || 35,
      gender,
      baseLifeExpectancyYears: baseLife,
      dynamicBonusYears: 1.5,
      nextClinicDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      nextClinicDepartment: '家醫科 / 預防醫學',
      nextClinicDoctor: '陳建國 主治醫師',
      companionNotes: '新註冊會員，建議預約初診建立基線健檢資料。',
      sleepHoursDaily: 7.0,
      dailySteps: 6000,
      spo2: 98,
      restingHeartRate: 72,
      healthScore: 75
    };

    res.json({
      token,
      user: { id: userId, username, name, role, avatar_url: '/icon-192.png' },
      member: newMember,
      message: `註冊成功！歡迎加入 Chronos Life，${name}！`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3.2 身分驗證：忘記密碼與密碼重設
app.post('/api/auth/reset-password', (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: '請提供帳號與新密碼' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: '新密碼長度至少需要 4 碼' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user) {
    return res.status(404).json({ error: `查無帳號 [${username}]，請確認輸入是否正確` });
  }

  try {
    // 更新密碼
    db.prepare('UPDATE users SET password = ? WHERE username = ?').run(newPassword, username);

    // 清除該用戶舊的 sessions
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);

    res.json({
      success: true,
      message: `帳號 [${username}] 密碼已成功更新，請使用新密碼登入！`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. 身分驗證：取得目前登入狀態
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: '未提供認證憑證' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token) as any;
  if (!session) {
    return res.status(401).json({ error: 'Session 已失效或不存在' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
  if (!user) {
    return res.status(404).json({ error: '找不到使用者' });
  }

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// 5. 身分驗證：登出
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true, message: '已安全登出' });
});

// 6. 使用者快捷列表 (供登入介面一鍵展示身分)
app.get('/api/users/presets', (req, res) => {
  const users = db.prepare('SELECT id, username, name, role, avatar_url FROM users').all();
  res.json(users);
});

// 6.1 管理者專用：取得所有使用者詳細資料與健康檔案關聯
app.get('/api/admin/users', (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.name, 
        u.role, 
        u.avatar_url, 
        u.created_at,
        m.id as member_id, 
        m.age, 
        m.gender, 
        m.base_life_expectancy, 
        m.health_score,
        m.next_clinic_date, 
        m.next_clinic_department, 
        m.next_clinic_doctor, 
        m.companion_notes
      FROM users u
      LEFT JOIN members m ON m.user_id = u.id
      ORDER BY u.created_at DESC
    `;
    const users = db.prepare(query).all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.2 管理者專用：新增使用者與初始健康檔案
app.post('/api/admin/users', (req, res) => {
  const { username, password, name, role = '本人', age = 35, gender = 'M', notes = '', clinicDept = '家醫科 / 預防醫學' } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: '請完整填寫帳號、密碼與姓名' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(400).json({ error: `帳號 [${username}] 已存在` });
  }

  const userId = 'usr-' + Date.now();
  const memberId = 'member-' + Date.now();
  const createdAt = new Date().toISOString();
  const baseLife = gender === 'F' ? 48.0 : 42.0;

  try {
    db.prepare(`
      INSERT INTO users (id, username, password, name, role, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, password, name, role, '/icon-192.png', createdAt);

    db.prepare(`
      INSERT INTO members (
        id, user_id, name, role, age, gender, base_life_expectancy, dynamic_bonus,
        next_clinic_date, next_clinic_department, next_clinic_doctor, companion_notes,
        sleep_hours_daily, daily_steps, spo2, resting_heart_rate, health_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      memberId, userId, name, role, Number(age) || 35, gender, baseLife, 1.5,
      new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      clinicDept, '李明峰 主治醫師', notes || '管理者手動建立之會員健康資產。',
      7.0, 6000, 98, 72, 75
    );

    res.json({
      success: true,
      user: { id: userId, username, name, role, avatar_url: '/icon-192.png', created_at: createdAt },
      message: `成功新增使用者 [${name}]`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.3 管理者專用：修改使用者資料
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, role, age, gender, health_score, companion_notes, next_clinic_department } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ error: '找不到該使用者' });
    }

    if (name || role) {
      db.prepare('UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role) WHERE id = ?')
        .run(name || null, role || null, id);
    }

    // 同步更新 members 資料
    const member = db.prepare('SELECT id FROM members WHERE user_id = ?').get(id) as any;
    if (member) {
      db.prepare(`
        UPDATE members SET
          name = COALESCE(?, name),
          role = COALESCE(?, role),
          age = COALESCE(?, age),
          gender = COALESCE(?, gender),
          health_score = COALESCE(?, health_score),
          companion_notes = COALESCE(?, companion_notes),
          next_clinic_department = COALESCE(?, next_clinic_department)
        WHERE id = ?
      `).run(
        name || null,
        role || null,
        age !== undefined ? Number(age) : null,
        gender || null,
        health_score !== undefined ? Number(health_score) : null,
        companion_notes !== undefined ? companion_notes : null,
        next_clinic_department !== undefined ? next_clinic_department : null,
        member.id
      );
    }

    res.json({ success: true, message: `使用者 [${name || user.name}] 資料已成功更新！` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.4 管理者專用：重設特定使用者密碼
app.post('/api/admin/users/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: '新密碼長度至少需要 4 碼' });
  }

  try {
    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ error: '找不到該使用者' });
    }

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);

    res.json({ success: true, message: `帳號 [${user.username}] 密碼已重設成功！` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.5 管理者專用：刪除使用者 (具備系統預設管理員保護)
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;

  try {
    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ error: '找不到該使用者' });
    }

    if (user.username === 'admin') {
      return res.status(403).json({ error: '系統保護：無法刪除預設系統管理員帳號 (admin)' });
    }

    // 刪除使用者、關聯健康檔案、檢驗數據與 Session
    const member = db.prepare('SELECT id FROM members WHERE user_id = ?').get(id) as any;
    if (member) {
      db.prepare('DELETE FROM lab_records WHERE member_id = ?').run(member.id);
      db.prepare('DELETE FROM members WHERE id = ?').run(member.id);
    }
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({ success: true, message: `已成功刪除使用者 [${user.username}] 及其健康數據檔案！` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. 家庭成員資料 API (讀寫 SQLite)
app.get('/api/members', (req, res) => {
  try {
    const rawMembers = db.prepare('SELECT * FROM members').all() as any[];
    const members = rawMembers.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      age: m.age,
      gender: m.gender,
      baseLifeExpectancyYears: m.base_life_expectancy,
      dynamicBonusYears: m.dynamic_bonus,
      nextClinicDate: m.next_clinic_date,
      nextClinicDepartment: m.next_clinic_department,
      nextClinicDoctor: m.next_clinic_doctor,
      companionNotes: m.companion_notes,
      sleepHoursDaily: m.sleep_hours_daily,
      dailySteps: m.daily_steps,
      spo2: m.spo2,
      restingHeartRate: m.resting_heart_rate,
      healthScore: m.health_score,
    }));
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. 健檢檢驗記錄 API (讀寫 SQLite)
app.get('/api/records', (req, res) => {
  const { memberId } = req.query;
  try {
    let rows: any[];
    if (memberId) {
      rows = db.prepare('SELECT * FROM lab_records WHERE member_id = ? ORDER BY date DESC').all(memberId as string);
    } else {
      rows = db.prepare('SELECT * FROM lab_records ORDER BY date DESC').all();
    }

    const records = rows.map(r => ({
      id: r.id,
      memberId: r.member_id,
      date: r.date,
      hospital: r.hospital,
      system: r.system,
      code: r.code,
      standardName: r.standard_name,
      originalReportName: r.original_report_name,
      value: r.value,
      numericValue: r.numeric_value,
      unit: r.unit,
      referenceInterval: r.reference_interval,
      isAbnormal: Boolean(r.is_abnormal),
      trendClassification: r.trend_classification,
      isPendingAudit: Boolean(r.is_pending_audit),
      confidenceScore: r.confidence_score,
      reportPage: r.report_page,
      cropImageLabel: r.crop_image_label,
      examModality: r.exam_modality,
    }));
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 新增單筆檢驗紀錄至 SQLite
app.post('/api/records', (req, res) => {
  const r = req.body;
  if (!r.id || !r.memberId || !r.date || !r.code) {
    return res.status(400).json({ error: '缺少必填欄位 (id, memberId, date, code)' });
  }

  try {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO lab_records (
        id, member_id, date, hospital, system, code, standard_name, original_report_name,
        value, numeric_value, unit, reference_interval, is_abnormal, trend_classification,
        is_pending_audit, confidence_score, report_page, crop_image_label, exam_modality
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      r.id, r.memberId, r.date, r.hospital || '新匯入檢驗', r.system || 'liver',
      r.code, r.standardName || r.code, r.originalReportName || r.code,
      String(r.value), typeof r.numericValue === 'number' ? r.numericValue : parseFloat(r.value) || null,
      r.unit || '', r.referenceInterval || '參考報告', r.isAbnormal ? 1 : 0,
      r.trendClassification || 'stable_normal', r.isPendingAudit ? 1 : 0,
      r.confidenceScore || 1.0, r.reportPage || 1, r.cropImageLabel || '', r.examModality || ''
    );

    res.json({ success: true, id: r.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. 飲食模組 API (Diet & Photo Calorie AI)
// ==========================================

// 6.1 取得飲食紀錄清單
app.get('/api/diet/records', (req, res) => {
  const { memberId = 'member-1' } = req.query;
  try {
    const records = db.prepare(`
      SELECT * FROM diet_records 
      WHERE member_id = ? 
      ORDER BY logged_at DESC
      LIMIT 100
    `).all(memberId as string);

    // 駝峰轉換以適配前端介面
    const formatted = records.map((r: any) => ({
      id: r.id,
      memberId: r.member_id,
      userId: r.user_id,
      mealType: r.meal_type,
      foodName: r.food_name,
      imageUrl: r.image_url,
      calories: r.calories,
      carbs: r.carbs,
      protein: r.protein,
      fat: r.fat,
      fiber: r.fiber,
      sodium: r.sodium,
      glycemicIndex: r.glycemic_index,
      healthImpactRating: r.health_impact_rating,
      aiAnalysisNotes: r.ai_analysis_notes,
      loggedAt: r.logged_at,
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.2 新增單筆飲食紀錄
app.post('/api/diet/records', (req, res) => {
  const {
    id = 'diet-' + Date.now(),
    memberId = 'member-1',
    userId,
    mealType = '午餐',
    foodName,
    imageUrl,
    calories = 450,
    carbs = 35,
    protein = 30,
    fat = 15,
    fiber = 6,
    sodium = 400,
    glycemicIndex = '低GI',
    healthImpactRating = 90,
    aiAnalysisNotes = '',
    loggedAt = new Date().toISOString()
  } = req.body;

  if (!foodName) {
    return res.status(400).json({ error: '請提供菜色餐點名稱' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO diet_records (
        id, member_id, user_id, meal_type, food_name, image_url,
        calories, carbs, protein, fat, fiber, sodium, glycemic_index,
        health_impact_rating, ai_analysis_notes, logged_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, memberId, userId || null, mealType, foodName, imageUrl || null,
      Number(calories), Number(carbs), Number(protein), Number(fat), Number(fiber),
      Number(sodium), glycemicIndex, Number(healthImpactRating), aiAnalysisNotes, loggedAt
    );

    res.json({
      success: true,
      message: `成功記錄餐點 [${foodName}]，熱量 ${calories} kcal 已同步計入長壽三環！`,
      record: {
        id, memberId, userId, mealType, foodName, imageUrl,
        calories, carbs, protein, fat, fiber, sodium, glycemicIndex,
        healthImpactRating, aiAnalysisNotes, loggedAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.3 刪除飲食紀錄
app.delete('/api/diet/records/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM diet_records WHERE id = ?').run(id);
    res.json({ success: true, message: '飲食紀錄已刪除' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.4 多模態 Vision AI 照片卡路里分析模擬
app.post('/api/diet/analyze-photo', (req, res) => {
  const { foodKeyword, imageUrl } = req.body;

  // 智慧菜單辨識知識庫
  const menuDatabase = [
    {
      keywords: ['鮭魚', '沙拉', '彩椒', 'salmon'],
      foodName: '炙烤野生鮭魚菲力彩椒溫沙拉佐初榨橄欖油',
      calories: 520,
      carbs: 24,
      protein: 45,
      fat: 26,
      fiber: 8.5,
      sodium: 380,
      glycemicIndex: '低GI',
      healthImpactRating: 98,
      aiAnalysisNotes: '多模態影像偵測：含高純度深海 Omega-3 (EPA+DHA 1800mg) 與彩椒青花素。臨床回饋：強效抑制肝臟發炎物質，預估對 ALT (-12%) 與 LDL-C 具極佳逆轉助益。'
    },
    {
      keywords: ['雞胸', '舒肥', '地瓜', 'chicken'],
      foodName: '低溫舒肥香草雞胸地瓜高纖餐盒',
      calories: 460,
      carbs: 48,
      protein: 42,
      fat: 8,
      fiber: 7.2,
      sodium: 410,
      glycemicIndex: '低GI',
      healthImpactRating: 95,
      aiAnalysisNotes: '多模態影像偵測：原型低 GI 蒸地瓜複合碳水，搭配精實低脂白肉。臨床回饋：餐後胰島素分泌平緩，促進骨骼肌肉蛋白質合成，適配 Zone 2 運動後的黃金補充。'
    },
    {
      keywords: ['優格', '堅果', '燕麥', 'yogurt'],
      foodName: '無糖高蛋白希臘優格佐綜合堅果與野生藍莓',
      calories: 340,
      carbs: 26,
      protein: 24,
      fat: 15,
      fiber: 6.8,
      sodium: 90,
      glycemicIndex: '低GI',
      healthImpactRating: 96,
      aiAnalysisNotes: '多模態影像偵測：富含天然活性乳酸菌、花青素與白藜蘆醇。臨床回饋：極低鈉、低嘌呤，有效保護腸道菌相與腎絲球過濾率 (eGFR)。'
    },
    {
      keywords: ['海鱸魚', '魚', '鱸魚', 'fish'],
      foodName: '清蒸冬菇海鱸魚菲力糙米定食',
      calories: 440,
      carbs: 46,
      protein: 38,
      fat: 10,
      fiber: 6.5,
      sodium: 350,
      glycemicIndex: '低GI',
      healthImpactRating: 94,
      aiAnalysisNotes: '多模態影像偵測：優質清蒸白肉海鮮，飽和脂肪酸小於 2g。臨床回饋：極低血管管壁負擔，對動脈粥狀硬化預防具有一級保護作用。'
    },
    {
      keywords: ['排骨', '便當', '炸', 'pork'],
      foodName: '台式金黃香酥炸排骨經典便當',
      calories: 880,
      carbs: 96,
      protein: 32,
      fat: 42,
      fiber: 2.8,
      sodium: 1280,
      glycemicIndex: '高GI',
      healthImpactRating: 58,
      aiAnalysisNotes: '多模態影像警示：深層油炸裹粉排骨，熱量偏高 (880 kcal) 且鈉含量 (1280mg) 偏高。臨床建議：建議今日搭配綠茶多酚去油解膩，並增加額外 20 分鐘 Zone 2 慢跑以平衡熱量。'
    }
  ];

  let matched = menuDatabase[0];
  if (foodKeyword) {
    const found = menuDatabase.find(item => 
      item.keywords.some(k => foodKeyword.toLowerCase().includes(k)) ||
      item.foodName.toLowerCase().includes(foodKeyword.toLowerCase())
    );
    if (found) matched = found;
  }

  res.json({
    status: 'analyzed',
    confidenceScore: 0.96,
    imageUrl: imageUrl || '/icon-192.png',
    analysis: matched
  });
});

// ==========================================
// 7. 運動模組 API (Exercise & Wearable Sync)
// ==========================================

// 7.1 取得運動與穿戴紀錄清單
app.get('/api/exercise/records', (req, res) => {
  const { memberId = 'member-1' } = req.query;
  try {
    const records = db.prepare(`
      SELECT * FROM exercise_records 
      WHERE member_id = ? 
      ORDER BY logged_at DESC
      LIMIT 100
    `).all(memberId as string);

    const formatted = records.map((r: any) => ({
      id: r.id,
      memberId: r.member_id,
      userId: r.user_id,
      exerciseType: r.exercise_type,
      sourceDevice: r.source_device,
      durationMinutes: r.duration_minutes,
      caloriesBurned: r.calories_burned,
      avgHeartRate: r.avg_heart_rate,
      maxHeartRate: r.max_heart_rate,
      zone2Minutes: r.zone2_minutes,
      distanceKm: r.distance_km,
      steps: r.steps,
      vo2Max: r.vo2_max,
      lifespanBonusHours: r.lifespan_bonus_hours,
      loggedAt: r.logged_at
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7.2 新增單筆運動紀錄
app.post('/api/exercise/records', (req, res) => {
  const {
    id = 'ex-' + Date.now(),
    memberId = 'member-1',
    userId,
    exerciseType = 'Zone 2 超慢跑',
    sourceDevice = 'Apple Watch Ultra 2',
    durationMinutes = 30,
    caloriesBurned = 260,
    avgHeartRate = 122,
    maxHeartRate = 142,
    zone2Minutes = 26,
    distanceKm = 3.2,
    steps = 4200,
    vo2Max = 44.0,
    lifespanBonusHours = 2.5,
    loggedAt = new Date().toISOString()
  } = req.body;

  try {
    const insert = db.prepare(`
      INSERT INTO exercise_records (
        id, member_id, user_id, exercise_type, source_device,
        duration_minutes, calories_burned, avg_heart_rate, max_heart_rate,
        zone2_minutes, distance_km, steps, vo2_max, lifespan_bonus_hours, logged_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, memberId, userId || null, exerciseType, sourceDevice,
      Number(durationMinutes), Number(caloriesBurned), Number(avgHeartRate),
      Number(maxHeartRate), Number(zone2Minutes), Number(distanceKm),
      Number(steps), Number(vo2Max), Number(lifespanBonusHours), loggedAt
    );

    // 更新 members 資料表的即時日常步數
    db.prepare('UPDATE members SET daily_steps = daily_steps + ? WHERE id = ?').run(Number(steps), memberId);

    res.json({
      success: true,
      message: `成功記錄運動 [${exerciseType}]！燃燒 ${caloriesBurned} kcal，為生命贏回 +${lifespanBonusHours} 小時健康餘命！`,
      record: {
        id, memberId, userId, exerciseType, sourceDevice,
        durationMinutes, caloriesBurned, avgHeartRate, maxHeartRate,
        zone2Minutes, distanceKm, steps, vo2Max, lifespanBonusHours, loggedAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7.3 一鍵連線同步穿戴式裝置最新遙測數據
app.post('/api/exercise/sync-wearable', (req, res) => {
  const { device = 'Apple Watch Ultra 2', memberId = 'member-1' } = req.body;
  try {
    // 模擬最新真實遙測讀數
    const liveTelemetry = {
      device,
      syncTime: new Date().toISOString(),
      currentHeartRate: 72,
      restingHeartRate: 64,
      dailySteps: 9840,
      activeCaloriesKcal: 485,
      zone2MinutesToday: 32,
      spo2Percent: 99,
      sleepQualityScore: 88,
      connectionStatus: '已連線並即時傳輸中'
    };

    // 同步更新 SQLite members 即時基準
    db.prepare(`
      UPDATE members 
      SET daily_steps = ?, resting_heart_rate = ?, spo2 = ?
      WHERE id = ?
    `).run(liveTelemetry.dailySteps, liveTelemetry.restingHeartRate, liveTelemetry.spo2Percent, memberId);

    res.json({
      success: true,
      message: `已成功與 ${device} 完成健康遙測雙向同步！`,
      telemetry: liveTelemetry
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. 長期數據監控與跨維度關聯分析 API
// ==========================================
app.get('/api/analytics/long-term', (req, res) => {
  const { memberId = 'member-1', days = 30 } = req.query;
  const numDays = Math.min(180, Math.max(7, Number(days) || 30));

  try {
    // 讀取飲食紀錄
    const dietRows = db.prepare(`
      SELECT substr(logged_at, 1, 10) as day, 
             SUM(calories) as total_cals,
             SUM(carbs) as total_carbs,
             SUM(protein) as total_protein,
             SUM(fat) as total_fat,
             AVG(health_impact_rating) as avg_rating
      FROM diet_records
      WHERE member_id = ?
      GROUP BY substr(logged_at, 1, 10)
      ORDER BY day DESC
      LIMIT ?
    `).all(memberId as string, numDays) as any[];

    // 讀取運動紀錄
    const exerciseRows = db.prepare(`
      SELECT substr(logged_at, 1, 10) as day,
             SUM(calories_burned) as total_burned,
             SUM(duration_minutes) as total_duration,
             SUM(zone2_minutes) as total_zone2,
             SUM(steps) as total_steps,
             AVG(avg_heart_rate) as avg_hr,
             SUM(lifespan_bonus_hours) as total_bonus_hours
      FROM exercise_records
      WHERE member_id = ?
      GROUP BY substr(logged_at, 1, 10)
      ORDER BY day DESC
      LIMIT ?
    `).all(memberId as string, numDays) as any[];

    // 建立時間軸對齊字典
    const dayMap = new Map<string, any>();
    const dietMap = new Map(dietRows.map(r => [r.day, r]));
    const exMap = new Map(exerciseRows.map(r => [r.day, r]));

    const today = new Date('2026-09-27T10:00:00Z');
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];

      const dData = dietMap.get(dayKey) || {
        total_cals: 1350 + Math.floor(Math.sin(i) * 120),
        total_carbs: 110,
        total_protein: 95,
        total_fat: 45,
        avg_rating: 90
      };

      const eData = exMap.get(dayKey) || {
        total_burned: 300 + Math.floor(Math.cos(i) * 60),
        total_duration: 30,
        total_zone2: 25,
        total_steps: 7200 + Math.floor(Math.sin(i) * 1200),
        avg_hr: 122,
        total_bonus_hours: 2.2
      };

      // 計算基礎代謝 (BMR 估算 ~1550) + 運動消耗
      const totalExpenditure = 1550 + (eData.total_burned || 0);
      const intake = dData.total_cals || 1400;
      const caloricDeficit = totalExpenditure - intake; // 正值表示熱量赤字 (健康減脂)

      // 模擬生化指標受健康生活型態改善之推移預測 (例如 ALT 隨時間從 62 下降至 38)
      const altSimulated = +(62 - ((numDays - i) / numDays) * 24 + Math.sin(i) * 1.5).toFixed(1);
      const hba1cSimulated = +(6.1 - ((numDays - i) / numDays) * 0.6 + Math.cos(i) * 0.05).toFixed(2);
      const restingHeartRateSimulated = Math.round(74 - ((numDays - i) / numDays) * 7 + Math.sin(i) * 1);

      dayMap.set(dayKey, {
        date: dayKey,
        intakeCalories: intake,
        burnedCalories: eData.total_burned || 0,
        totalExpenditure,
        caloricDeficit,
        steps: eData.total_steps || 6000,
        zone2Minutes: eData.total_zone2 || 0,
        restingHeartRate: restingHeartRateSimulated,
        altValue: altSimulated,
        hba1cValue: hba1cSimulated,
        lifespanBonusHours: +(eData.total_bonus_hours || 1.8).toFixed(1),
        dietRating: Math.round(dData.avg_rating || 90)
      });
    }

    const timeline = Array.from(dayMap.values());

    // 計算宏觀綜效統計
    const totalBonusHours = timeline.reduce((acc, cur) => acc + cur.lifespanBonusHours, 0);
    const avgDailyDeficit = Math.round(timeline.reduce((acc, cur) => acc + cur.caloricDeficit, 0) / timeline.length);
    const totalZone2Minutes = timeline.reduce((acc, cur) => acc + cur.zone2Minutes, 0);
    const avgSteps = Math.round(timeline.reduce((acc, cur) => acc + cur.steps, 0) / timeline.length);

    res.json({
      timeRangeDays: numDays,
      memberId,
      summary: {
        totalLifespanEarnedHours: +totalBonusHours.toFixed(1),
        totalLifespanEarnedDays: +(totalBonusHours / 24).toFixed(1),
        avgDailyCaloricDeficitKcal: avgDailyDeficit,
        totalZone2Minutes,
        avgDailySteps: avgSteps,
        liverAltImprovementPercent: -22.5, // 脂肪肝指標顯著好轉
        hba1cImprovementPercent: -9.8,     // 血糖恆定能力提升
        restingHeartRateDropBpm: -7        // 心血管耐力強化
      },
      timeline
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Chronos Life SQLite Server] Running on http://localhost:${PORT}`);
  console.log(`[Chronos Life SQLite Server] DB File: ${DB_PATH}`);
});
