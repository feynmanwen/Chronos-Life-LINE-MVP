import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const DB_PATH = path.join(DB_DIR, 'chronos_life.db');
export const db = new DatabaseSync(DB_PATH);

// 1. 初始化資料庫資料表 (SQLite Schema)
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar_url TEXT,
      line_user_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      base_life_expectancy REAL NOT NULL,
      dynamic_bonus REAL NOT NULL,
      next_clinic_date TEXT,
      next_clinic_department TEXT,
      next_clinic_doctor TEXT,
      companion_notes TEXT,
      sleep_hours_daily REAL NOT NULL,
      daily_steps INTEGER NOT NULL,
      spo2 INTEGER NOT NULL,
      resting_heart_rate INTEGER NOT NULL,
      health_score INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lab_records (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      date TEXT NOT NULL,
      hospital TEXT NOT NULL,
      system TEXT NOT NULL,
      code TEXT NOT NULL,
      standard_name TEXT NOT NULL,
      original_report_name TEXT NOT NULL,
      value TEXT NOT NULL,
      numeric_value REAL,
      unit TEXT NOT NULL,
      reference_interval TEXT NOT NULL,
      is_abnormal INTEGER NOT NULL,
      trend_classification TEXT NOT NULL,
      is_pending_audit INTEGER DEFAULT 0,
      confidence_score REAL DEFAULT 1.0,
      report_page INTEGER,
      crop_image_label TEXT,
      exam_modality TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

// 2. 預載初始資料 (Pre-seeding Users, Family Members, Lab Records)
function seedInitialData() {
  // A. 預載使用者帳號
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  if (userCount.cnt === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, password, name, role, avatar_url, line_user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr-1',
      'chen_wei',
      '123456',
      '陳偉 (本人)',
      '本人',
      '/icon-192.png',
      'U1001_chen_wei',
      new Date().toISOString()
    );

    insertUser.run(
      'usr-2',
      'chen_guo_hua',
      '123456',
      '陳國華 (父親)',
      '父親',
      '/icon-192.png',
      'U1002_chen_gh',
      new Date().toISOString()
    );

    insertUser.run(
      'usr-admin',
      'admin',
      'admin123',
      '李明峰 主治醫師',
      '醫師 / 管理員',
      '/icon-192.png',
      'U0000_dr_lee',
      new Date().toISOString()
    );

    console.log('[SQLite] Default users initialized.');
  }

  // B. 預載家庭成員檔案
  const memberCount = db.prepare('SELECT COUNT(*) as cnt FROM members').get() as { cnt: number };
  if (memberCount.cnt === 0) {
    const insertMember = db.prepare(`
      INSERT INTO members (
        id, user_id, name, role, age, gender, base_life_expectancy, dynamic_bonus,
        next_clinic_date, next_clinic_department, next_clinic_doctor, companion_notes,
        sleep_hours_daily, daily_steps, spo2, resting_heart_rate, health_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialMembers = [
      {
        id: 'member-1',
        user_id: 'usr-1',
        name: '陳偉 (本人)',
        role: '本人',
        age: 42,
        gender: 'M',
        base_life_expectancy: 42.5,
        dynamic_bonus: 3.2,
        next_clinic_date: '2026-09-28',
        next_clinic_department: '肝膽腸胃科',
        next_clinic_doctor: '李明峰 主治醫師',
        companion_notes: '追蹤脂肪肝與 ALT 數值，準備近三年健檢折線圖與用藥提問清單。',
        sleep_hours_daily: 6.5,
        daily_steps: 7850,
        spo2: 98,
        resting_heart_rate: 72,
        health_score: 78,
      },
      {
        id: 'member-2',
        user_id: 'usr-2',
        name: '陳國華 (父親)',
        role: '父親',
        age: 70,
        gender: 'M',
        base_life_expectancy: 16.4,
        dynamic_bonus: 1.1,
        next_clinic_date: '2026-09-19',
        next_clinic_department: '心臟血管內科',
        next_clinic_doctor: '張世傑 教授',
        companion_notes: '定期慢箋領藥，近期血壓偶有波動 (138/88 mmHg)，需留意晨間低血壓。',
        sleep_hours_daily: 7.0,
        daily_steps: 4200,
        spo2: 96,
        resting_heart_rate: 68,
        health_score: 71,
      },
      {
        id: 'member-3',
        user_id: 'usr-1',
        name: '林美珠 (母親)',
        role: '母親',
        age: 65,
        gender: 'F',
        base_life_expectancy: 22.8,
        dynamic_bonus: 0.8,
        next_clinic_date: '2026-09-11',
        next_clinic_department: '骨科 / 新陳代謝科',
        next_clinic_doctor: '黃雅琪 醫師',
        companion_notes: '【骨肌流失高風險】DXA T-score -2.6，醫師建議評估雙磷酸鹽類骨鬆藥物。',
        sleep_hours_daily: 6.0,
        daily_steps: 3500,
        spo2: 97,
        resting_heart_rate: 75,
        health_score: 66,
      },
      {
        id: 'member-4',
        user_id: 'usr-1',
        name: '王淑芬 (配偶)',
        role: '配偶',
        age: 40,
        gender: 'F',
        base_life_expectancy: 46.2,
        dynamic_bonus: 2.5,
        next_clinic_date: '2026-10-15',
        next_clinic_department: '乳房外科',
        next_clinic_doctor: '陳美玲 副院長',
        companion_notes: '追蹤乳房超音波 0.8cm 結節 (BI-RADS 3)，定期 6 個月回診比對影像。',
        sleep_hours_daily: 7.2,
        daily_steps: 8200,
        spo2: 99,
        resting_heart_rate: 66,
        health_score: 84,
      }
    ];

    for (const m of initialMembers) {
      insertMember.run(
        m.id, m.user_id, m.name, m.role, m.age, m.gender, m.base_life_expectancy, m.dynamic_bonus,
        m.next_clinic_date, m.next_clinic_department, m.next_clinic_doctor, m.companion_notes,
        m.sleep_hours_daily, m.daily_steps, m.spo2, m.resting_heart_rate, m.health_score
      );
    }
    console.log('[SQLite] Family members initialized.');
  }

  // C. 預載檢驗數據 (包含三大黃金案例)
  const recordCount = db.prepare('SELECT COUNT(*) as cnt FROM lab_records').get() as { cnt: number };
  if (recordCount.cnt === 0) {
    const insertRecord = db.prepare(`
      INSERT INTO lab_records (
        id, member_id, date, hospital, system, code, standard_name, original_report_name,
        value, numeric_value, unit, reference_interval, is_abnormal, trend_classification,
        is_pending_audit, confidence_score, report_page, crop_image_label, exam_modality
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const goldenRecords = [
      // 情境 A: 肝膽代謝 ALT 趨勢
      {
        id: 'rec-a-1',
        member_id: 'member-1',
        date: '2024-03-15',
        hospital: '國泰綜合醫院健康管理中心',
        system: 'liver',
        code: 'ALT',
        standard_name: '丙胺酸轉胺酶 (ALT)',
        original_report_name: 'GPT (血清麩丙酮酸轉氨基酶)',
        value: '28',
        numeric_value: 28,
        unit: 'U/L',
        reference_interval: '0 - 40',
        is_abnormal: 0,
        trend_classification: 'stable_normal',
        is_pending_audit: 0,
        confidence_score: 0.98,
        report_page: 3,
        crop_image_label: '國泰健檢 2024 P.3 肝功能生化分析 [GPT: 28 U/L]',
        exam_modality: '全自動生化酵素免疫比色法',
      },
      {
        id: 'rec-a-2',
        member_id: 'member-1',
        date: '2025-04-10',
        hospital: '國立臺灣大學醫學院附設醫院',
        system: 'liver',
        code: 'ALT',
        standard_name: '丙胺酸轉胺酶 (ALT)',
        original_report_name: 'ALT / 丙胺酸轉胺酶',
        value: '45',
        numeric_value: 45,
        unit: 'U/L',
        reference_interval: '0 - 41',
        is_abnormal: 1,
        trend_classification: 'normal_worsening',
        is_pending_audit: 0,
        confidence_score: 0.96,
        report_page: 4,
        crop_image_label: '臺大醫院 2025 綜合血液檢查單 [ALT: 45 U/L]',
        exam_modality: '紫外吸光連續監控法 (IFCC 標準)',
      },
      {
        id: 'rec-a-3',
        member_id: 'member-1',
        date: '2026-03-20',
        hospital: '臺北榮民總醫院',
        system: 'liver',
        code: 'ALT',
        standard_name: '丙胺酸轉胺酶 (ALT)',
        original_report_name: 'ALT (SGPT)',
        value: '72',
        numeric_value: 72,
        unit: 'U/L',
        reference_interval: '0 - 45',
        is_abnormal: 1,
        trend_classification: 'abnormal_worsening',
        is_pending_audit: 0,
        confidence_score: 0.99,
        report_page: 2,
        crop_image_label: '臺北榮總 2026 健檢報告書 P.2 [ALT: 72 U/L]',
        exam_modality: '微流控全自動生化分析',
      },
      // 情境 B: 骨肌流失 (DXA T-score)
      {
        id: 'rec-b-1',
        member_id: 'member-3',
        date: '2024-05-12',
        hospital: '長庚醫療財團法人林口長庚紀念醫院',
        system: 'joints',
        code: 'T-SCORE',
        standard_name: '骨質密度 T 值 (T-Score)',
        original_report_name: 'BMD L1-L4 T-Score (雙能量X光骨質密度)',
        value: '-1.8',
        numeric_value: -1.8,
        unit: 'SD',
        reference_interval: '>= -1.0',
        is_abnormal: 1,
        trend_classification: 'normal_worsening',
        is_pending_audit: 0,
        confidence_score: 0.97,
        report_page: 5,
        crop_image_label: '林口長庚 2024 DXA 掃描報告 [L1-L4 T-Score: -1.8]',
        exam_modality: '雙能量 X 光吸收儀 (DXA)',
      },
      {
        id: 'rec-b-2',
        member_id: 'member-3',
        date: '2025-06-08',
        hospital: '奇美醫療財團法人奇美醫院',
        system: 'joints',
        code: 'T-SCORE',
        standard_name: '骨質密度 T 值 (T-Score)',
        original_report_name: '全腰椎骨質密度測定 T-Score',
        value: '-2.2',
        numeric_value: -2.2,
        unit: 'SD',
        reference_interval: '>= -1.0',
        is_abnormal: 1,
        trend_classification: 'abnormal_worsening',
        is_pending_audit: 0,
        confidence_score: 0.95,
        report_page: 3,
        crop_image_label: '奇美醫院 2025 骨質疏鬆檢驗單 [T-Score: -2.2]',
        exam_modality: '雙能量 X 光吸收儀 (DXA Hologic)',
      },
      {
        id: 'rec-b-3',
        member_id: 'member-3',
        date: '2026-05-18',
        hospital: '臺北榮民總醫院',
        system: 'joints',
        code: 'T-SCORE',
        standard_name: '骨質密度 T 值 (T-Score)',
        original_report_name: '脊椎與股骨頸 T-Score (DXA)',
        value: '-2.6',
        numeric_value: -2.6,
        unit: 'SD',
        reference_interval: '>= -1.0',
        is_abnormal: 1,
        trend_classification: 'abnormal_worsening',
        is_pending_audit: 0,
        confidence_score: 0.99,
        report_page: 6,
        crop_image_label: '臺北榮總 2026 影像醫學部 DXA [T-Score: -2.6 骨質疏鬆確診]',
        exam_modality: '雙能量 X 光吸收儀 (DXA GE Lunar)',
      },
      // 情境 C: BI-RADS
      {
        id: 'rec-c-1',
        member_id: 'member-4',
        date: '2026-02-10',
        hospital: '國立臺灣大學醫學院附設醫院',
        system: 'vascular',
        code: 'BI-RADS',
        standard_name: '乳房影像分級 (BI-RADS)',
        original_report_name: '乳房 X 光攝影檢查 (Mammography) BI-RADS',
        value: 'Category 1',
        numeric_value: 1,
        unit: '級',
        reference_interval: 'Category 1 - 2',
        is_abnormal: 0,
        trend_classification: 'stable_normal',
        is_pending_audit: 0,
        confidence_score: 0.98,
        report_page: 8,
        crop_image_label: '臺大醫院 2026 乳房攝影審查單 [BI-RADS: 1]',
        exam_modality: '3D 數位乳房斷層攝影 (DBT)',
      },
      {
        id: 'rec-c-2',
        member_id: 'member-4',
        date: '2026-02-10',
        hospital: '和信治癌中心醫院',
        system: 'vascular',
        code: 'BI-RADS',
        standard_name: '乳房超音波結節 (BI-RADS)',
        original_report_name: '高頻乳房超音波檢查 (Breast Echo) BI-RADS',
        value: 'Category 3 (右乳 0.8cm 結節)',
        numeric_value: 3,
        unit: '級',
        reference_interval: 'Category 1 - 2',
        is_abnormal: 1,
        trend_classification: 'normal_worsening',
        is_pending_audit: 0,
        confidence_score: 0.97,
        report_page: 4,
        crop_image_label: '和信醫院 2026 超音波報告 [BI-RADS 3, 0.8cm nodule]',
        exam_modality: '高頻超音波 (High-Resolution Ultrasound)',
      }
    ];

    for (const r of goldenRecords) {
      insertRecord.run(
        r.id, r.member_id, r.date, r.hospital, r.system, r.code, r.standard_name, r.original_report_name,
        r.value, r.numeric_value, r.unit, r.reference_interval, r.is_abnormal, r.trend_classification,
        r.is_pending_audit, r.confidence_score, r.report_page, r.crop_image_label, r.exam_modality
      );
    }
    console.log('[SQLite] Lab records initialized.');
  }
}
