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

app.listen(PORT, () => {
  console.log(`[Chronos Life SQLite Server] Running on http://localhost:${PORT}`);
  console.log(`[Chronos Life SQLite Server] DB File: ${DB_PATH}`);
});
