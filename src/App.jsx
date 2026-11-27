import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Award,
  FileText,
  RotateCcw,
  KeyRound,
  User,
  Calendar,
  GraduationCap,
  Check,
  X,
  HelpCircle,
  LayoutGrid,
  Sparkles,
  Link2,
  Type,
  Save,
  Filter,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  BarChart3,
  Users,
  FolderKanban,
  LogOut,
  Search,
  Database,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

// ============================================================================
// 1. KONFIGURASI & DATA AWAL
// ============================================================================

const SCHOOL_NAME = 'SDN JOGOSARI I PANDAAN';

// Kata sandi untuk masuk ke Portal Guru & Admin (ubah sesuai kebutuhan sekolah)
const TEACHER_PASSWORD = 'guru123';
const ADMIN_PASSWORD = 'admin123';

// Opsional: Isi URL & Anon Key di sini jika ingin semua Chromebook siswa
// otomatis terhubung ke Supabase tanpa perlu pengaturan manual di browser.
const DEFAULT_SUPABASE_URL = 'https://dcrslhcaqatmxbbuptyv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnNsaGNhcWF0bXhiYnVwdHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3MjM5MjMsImV4cCI6MjExMTI5OTkyM30.skqwTcJ4Xf9w1kkp59d6O6XgY-XXn5vbTk7MNa_lKZA';

const STORAGE_KEYS = {
  packages: 'tka_jogosari_packages_v1',
  stimuli: 'tka_jogosari_stimuli_v1',
  questions: 'tka_jogosari_questions_v1',
  sessions: 'tka_jogosari_sessions_v1',
  supabase: 'tka_supabase_config',
};

const loadLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Abaikan jika localStorage tidak tersedia
  }
  return typeof fallback === 'function' ? fallback() : fallback;
};

const saveLocalJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Abaikan jika kuota penyimpanan penuh
  }
};

const INITIAL_PACKAGES = [
  {
    id: 'pkg-tka-mtk-01',
    subject: 'Matematika',
    title: 'Simulasi TKA 1 — Matematika',
    token: 'MTK6SD1',
    durationMinutes: 30,
    isActive: true,
    createdAt: '2026-11-20',
  },
  {
    id: 'pkg-tka-bin-01',
    subject: 'Bahasa Indonesia',
    title: 'Simulasi TKA 1 — Bahasa Indonesia',
    token: 'BIN6SD1',
    durationMinutes: 30,
    isActive: true,
    createdAt: '2026-11-20',
  },
];

const INITIAL_STIMULI = [
  {
    id: 'stim-grafik-panen',
    packageId: 'pkg-tka-mtk-01',
    subject: 'Matematika',
    title: 'Grafik Data Hasil Panen Mangga Kebun Pak Budi (dalam kg)',
    type: 'chart',
    content:
      'Perhatikan diagram batang di bawah ini yang menunjukkan hasil panen mangga di kebun Pak Budi selama 4 bulan berturut-turut.',
  },
  {
    id: 'stim-mangrove',
    packageId: 'pkg-tka-bin-01',
    subject: 'Bahasa Indonesia',
    title: 'Hutan Mangrove, Benteng Alami Penjaga Pesisir',
    type: 'text',
    content:
      'Hutan mangrove atau hutan bakau merupakan ekosistem unik yang tumbuh di wilayah pesisir pantai yang dipengaruhi pasang surut air laut. Akar pohon bakau yang kokoh dan saling menjalin mampu menahan hempasan ombak besar sehingga mencegah terjadinya abrasi atau pengikisan daratan oleh air laut.\n\nSelain menjadi benteng alami pantai, hutan mangrove juga berperan penting sebagai rumah bagi berbagai biota laut. Ikan kecil, kepiting, dan udang memanfaatkan sela-sela akar bakau untuk berlindung dari pemangsa sekaligus mencari makanan. Tak hanya itu, daun bakau yang gugur akan terurai menjadi nutrisi alami yang menyuburkan perairan sekitar.\n\nSayangnya, luas hutan mangrove di beberapa daerah mulai menyusut akibat alih fungsi lahan menjadi tambak atau permukiman tanpa perencanaan yang ramah lingkungan. Oleh karena itu, kegiatan penanaman kembali bibit bakau oleh warga dan pelajar sangat diperlukan agar kelestarian pesisir tetap terjaga bagi generasi mendatang.',
  },
];

const INITIAL_QUESTIONS = [
  // --- PAKET MATEMATIKA ---
  {
    id: 'q-mtk-1',
    packageId: 'pkg-tka-mtk-01',
    subject: 'Matematika',
    topic: 'Geometri & Pengukuran',
    difficulty: 'Sedang',
    type: 'PG',
    weight: 1,
    stimulusId: null,
    hasGeometrySvg: true,
    questionText:
      'Sebuah taman bermain berbentuk gabungan persegi panjang dan segitiga siku-siku seperti pada gambar di atas. Berapakah luas seluruh taman bermain tersebut?',
    options: [
      { id: 'A', text: '96 m²' },
      { id: 'B', text: '120 m²' },
      { id: 'C', text: '144 m²' },
      { id: 'D', text: '168 m²' },
    ],
    correctAnswer: 'B',
    explanation:
      'Langkah 1: Hitung luas persegi panjang = 12 m × 8 m = 96 m². Langkah 2: Hitung luas segitiga siku-siku = ½ × 6 m × 8 m = 24 m². Langkah 3: Jumlahkan keduanya = 96 m² + 24 m² = 120 m².',
  },
  {
    id: 'q-mtk-2',
    packageId: 'pkg-tka-mtk-01',
    subject: 'Matematika',
    topic: 'Pecahan & Perbandingan',
    difficulty: 'Sedang',
    type: 'PG_KOMPLEKS',
    weight: 1,
    stimulusId: null,
    questionText:
      'Ibu membuat 2 liter jus jeruk untuk acara keluarga. Sebanyak 3/4 liter diminum oleh Ayah dan Kakak, sedangkan 0,5 liter diminum oleh Adik. Manakah pernyataan berikut yang BENAR? (Pilih lebih dari satu jawaban)',
    options: [
      { id: '1', text: 'Jumlah jus yang diminum Ayah dan Kakak adalah 0,75 liter.' },
      { id: '2', text: 'Total jus yang sudah diminum seluruhnya adalah 1,5 liter.' },
      { id: '3', text: 'Sisa jus jeruk Ibu sekarang adalah 3/4 liter.' },
      { id: '4', text: 'Adik minum jus jeruk lebih banyak daripada Ayah dan Kakak.' },
    ],
    correctAnswer: ['1', '3'],
    explanation:
      '3/4 liter = 0,75 liter (Pernyataan 1 BENAR). Total diminum = 0,75 + 0,5 = 1,25 liter (Pernyataan 2 SALAH). Sisa = 2 − 1,25 = 0,75 liter = 3/4 liter (Pernyataan 3 BENAR). Adik minum 0,5 liter < 0,75 liter (Pernyataan 4 SALAH).',
  },
  {
    id: 'q-mtk-3',
    packageId: 'pkg-tka-mtk-01',
    subject: 'Matematika',
    topic: 'Pengolahan Data',
    difficulty: 'Mudah',
    type: 'BENAR_SALAH',
    weight: 1,
    stimulusId: 'stim-grafik-panen',
    questionText:
      'Berdasarkan grafik hasil panen mangga kebun Pak Budi di atas, tentukan apakah setiap pernyataan berikut Benar atau Salah!',
    options: [
      { id: 'p1', text: 'Hasil panen tertinggi terjadi pada bulan Maret sebanyak 80 kg.' },
      { id: 'p2', text: 'Selisih hasil panen bulan Januari dan Februari adalah 25 kg.' },
      { id: 'p3', text: 'Rata-rata hasil panen selama 4 bulan tersebut adalah 60 kg.' },
    ],
    correctAnswer: { p1: true, p2: false, p3: true },
    explanation:
      'Data panen: Jan = 50, Feb = 60, Mar = 80, Apr = 50. (1) Tertinggi Maret 80 kg (Benar). (2) Selisih Jan & Feb = 10 kg, bukan 25 kg (Salah). (3) Rata-rata = 240 ÷ 4 = 60 kg (Benar).',
  },
  {
    id: 'q-mtk-4',
    packageId: 'pkg-tka-mtk-01',
    subject: 'Matematika',
    topic: 'Operasi Hitung & Satuan',
    difficulty: 'Sulit',
    type: 'MENJODOHKAN',
    weight: 1,
    stimulusId: null,
    questionText:
      'Pasangkan setiap soal hitung di kolom kiri dengan hasil yang tepat di kolom kanan!',
    options: {
      left: [
        { id: 'L1', text: '2,5 jam + 30 menit' },
        { id: 'L2', text: '150 + 25 × 4' },
        { id: 'L3', text: '3,2 km − 1.200 m' },
      ],
      right: [
        { id: 'R1', text: '2.000 meter' },
        { id: 'R2', text: '250' },
        { id: 'R3', text: '180 menit' },
      ],
    },
    correctAnswer: { L1: 'R3', L2: 'R2', L3: 'R1' },
    explanation:
      '• 2,5 jam + 30 menit = 150 + 30 = 180 menit.\n• 150 + (25 × 4) = 150 + 100 = 250.\n• 3,2 km − 1.200 m = 3.200 − 1.200 = 2.000 meter.',
  },

  // --- PAKET BAHASA INDONESIA ---
  {
    id: 'q-bin-1',
    packageId: 'pkg-tka-bin-01',
    subject: 'Bahasa Indonesia',
    topic: 'Ide Pokok Paragraf',
    difficulty: 'Mudah',
    type: 'PG',
    weight: 1,
    stimulusId: 'stim-mangrove',
    questionText:
      'Apa ide pokok yang dibahas pada paragraf kedua bacaan "Hutan Mangrove, Benteng Alami Penjaga Pesisir"?',
    options: [
      { id: 'A', text: 'Penyebab menyusutnya luas hutan mangrove di daerah pesisir.' },
      { id: 'B', text: 'Peran hutan mangrove sebagai habitat dan sumber nutrisi biota laut.' },
      { id: 'C', text: 'Cara akar pohon bakau menahan hempasan ombak besar.' },
      { id: 'D', text: 'Ajakan menanam kembali bibit bakau bagi para pelajar.' },
    ],
    correctAnswer: 'B',
    explanation:
      'Kalimat utama paragraf kedua menjelaskan peran hutan mangrove sebagai rumah bagi berbagai biota laut dan daunnya sebagai nutrisi perairan.',
  },
  {
    id: 'q-bin-2',
    packageId: 'pkg-tka-bin-01',
    subject: 'Bahasa Indonesia',
    topic: 'Informasi Tersurat & Tersirat',
    difficulty: 'Sedang',
    type: 'PG_KOMPLEKS',
    weight: 1,
    stimulusId: 'stim-mangrove',
    questionText:
      'Berdasarkan isi bacaan tersebut, manfaat apa saja yang diberikan oleh hutan mangrove bagi lingkungan pesisir? (Pilih lebih dari satu jawaban)',
    options: [
      { id: '1', text: 'Mencegah pengikisan daratan (abrasi) akibat ombak laut.' },
      { id: '2', text: 'Menjadi tempat berlindung bagi ikan kecil, kepiting, dan udang.' },
      { id: '3', text: 'Menghasilkan kayu bahan bangunan utama untuk permukiman.' },
      { id: '4', text: 'Menyuburkan perairan sekitar dari daun bakau yang gugur.' },
    ],
    correctAnswer: ['1', '2', '4'],
    explanation:
      'Pernyataan 1 ada di paragraf 1, sedangkan 2 dan 4 ada di paragraf 2. Pernyataan 3 salah karena alih fungsi lahan justru merusak mangrove.',
  },
  {
    id: 'q-bin-3',
    packageId: 'pkg-tka-bin-01',
    subject: 'Bahasa Indonesia',
    topic: 'Pemahaman Bacaan',
    difficulty: 'Mudah',
    type: 'BENAR_SALAH',
    weight: 1,
    stimulusId: 'stim-mangrove',
    questionText:
      'Tentukan apakah pernyataan berikut sesuai (Benar) atau tidak sesuai (Salah) dengan teks bacaan di atas!',
    options: [
      { id: 'p1', text: 'Hutan mangrove hanya dapat tumbuh di daerah pegunungan yang sejuk.' },
      { id: 'p2', text: 'Alih fungsi lahan menjadi tambak tanpa perencanaan ramah lingkungan mengurangi luas mangrove.' },
      { id: 'p3', text: 'Pelajar dapat ikut menjaga pesisir dengan menanam kembali bibit bakau.' },
    ],
    correctAnswer: { p1: false, p2: true, p3: true },
    explanation:
      '(1) Salah, mangrove tumbuh di pesisir pantai. (2) Benar, sesuai paragraf 3. (3) Benar, sesuai kalimat terakhir paragraf 3.',
  },
  {
    id: 'q-bin-4',
    packageId: 'pkg-tka-bin-01',
    subject: 'Bahasa Indonesia',
    topic: 'Kosakata & Makna Kata',
    difficulty: 'Sedang',
    type: 'MENJODOHKAN',
    weight: 1,
    stimulusId: 'stim-mangrove',
    questionText:
      'Pasangkan istilah penting yang terdapat dalam bacaan di kolom kiri dengan arti yang tepat di kolom kanan!',
    options: {
      left: [
        { id: 'L1', text: 'Abrasi' },
        { id: 'L2', text: 'Biota' },
        { id: 'L3', text: 'Nutrisi' },
      ],
      right: [
        { id: 'R1', text: 'Zat gizi atau makanan penyubur' },
        { id: 'R2', text: 'Pengikisan daratan oleh air laut' },
        { id: 'R3', text: 'Keseluruhan flora dan fauna di suatu daerah' },
      ],
    },
    correctAnswer: { L1: 'R2', L2: 'R3', L3: 'R1' },
    explanation:
      '• Abrasi = pengikisan daratan oleh air laut.\n• Biota = keseluruhan flora & fauna.\n• Nutrisi = zat gizi/makanan penyubur.',
  },
];

// ============================================================================
// 2. MESIN KOREKSI SKOR PARSIAL & ANALISIS BUTIR SOAL (TEORI TES KLASIK)
// ============================================================================

function evaluateQuestion(question, userAnswer) {
  const W = Number(question.weight) || 1;

  if (
    userAnswer === undefined ||
    userAnswer === null ||
    (Array.isArray(userAnswer) && userAnswer.length === 0) ||
    (typeof userAnswer === 'object' && !Array.isArray(userAnswer) && Object.keys(userAnswer).length === 0)
  ) {
    return { score: 0, maxScore: W, status: 'unanswered', formulaNote: 'Belum dijawab (0 poin).' };
  }

  if (question.type === 'PG') {
    const isCorrect = userAnswer === question.correctAnswer;
    return {
      score: isCorrect ? W : 0,
      maxScore: W,
      status: isCorrect ? 'correct' : 'wrong',
      formulaNote: isCorrect ? 'Jawaban tepat (Skor penuh).' : 'Jawaban belum tepat (0 poin).',
    };
  }

  if (question.type === 'PG_KOMPLEKS') {
    const correctSet = new Set(question.correctAnswer || []);
    const selected = Array.isArray(userAnswer) ? userAnswer : [];
    const K = Math.max(1, correctSet.size);
    let B = 0;
    let S = 0;
    selected.forEach((id) => {
      if (correctSet.has(id)) B += 1;
      else S += 1;
    });
    const score = Number((Math.max(0, (B - S) / K) * W).toFixed(2));
    const status = score === W ? 'correct' : score > 0 ? 'partial' : 'wrong';
    return {
      score,
      maxScore: W,
      status,
      formulaNote: `Skor Parsial: max(0, (${B} benar − ${S} salah) ÷ ${K} kunci) × ${W} = ${score.toFixed(2)}`,
    };
  }

  if (question.type === 'BENAR_SALAH' || question.type === 'MENJODOHKAN') {
    const keys = Object.keys(question.correctAnswer || {});
    if (keys.length === 0) return { score: 0, maxScore: W, status: 'wrong', formulaNote: '' };
    let matched = 0;
    keys.forEach((k) => {
      if (userAnswer[k] === question.correctAnswer[k]) matched += 1;
    });
    const score = Number(((matched / keys.length) * W).toFixed(2));
    const status = score === W ? 'correct' : score > 0 ? 'partial' : 'wrong';
    const label = question.type === 'BENAR_SALAH' ? 'pernyataan benar' : 'pasangan tepat';
    return {
      score,
      maxScore: W,
      status,
      formulaNote: `Skor Parsial: (${matched} dari ${keys.length} ${label}) × ${W} = ${score.toFixed(2)}`,
    };
  }

  return { score: 0, maxScore: W, status: 'wrong', formulaNote: '' };
}

function isQuestionAnswered(question, userAnswer) {
  if (userAnswer === undefined || userAnswer === null) return false;
  if (question.type === 'PG') return Boolean(userAnswer);
  if (question.type === 'PG_KOMPLEKS') return Array.isArray(userAnswer) && userAnswer.length > 0;
  if (question.type === 'BENAR_SALAH' || question.type === 'MENJODOHKAN') {
    return typeof userAnswer === 'object' && Object.keys(userAnswer).length > 0;
  }
  return false;
}

function buildSeedSessions(questions) {
  const mtkQs = questions.filter((q) => q.packageId === 'pkg-tka-mtk-01');
  const binQs = questions.filter((q) => q.packageId === 'pkg-tka-bin-01');

  const rawSamples = [
    {
      id: 'sess-1',
      packageId: 'pkg-tka-mtk-01',
      studentName: 'Alya Putri Ramadhani',
      studentClass: '6A',
      birthDate: '2014-05-12',
      finishedAt: '2026-11-26 08:25',
      answers: {
        'q-mtk-1': 'B',
        'q-mtk-2': ['1', '3'],
        'q-mtk-3': { p1: true, p2: false, p3: true },
        'q-mtk-4': { L1: 'R3', L2: 'R2', L3: 'R1' },
      },
    },
    {
      id: 'sess-2',
      packageId: 'pkg-tka-mtk-01',
      studentName: 'Bima Sakti Pratama',
      studentClass: '6A',
      birthDate: '2014-02-18',
      finishedAt: '2026-11-26 08:27',
      answers: {
        'q-mtk-1': 'B',
        'q-mtk-2': ['1', '3'],
        'q-mtk-3': { p1: true, p2: false, p3: true },
        'q-mtk-4': { L1: 'R3', L2: 'R1', L3: 'R2' },
      },
    },
    {
      id: 'sess-3',
      packageId: 'pkg-tka-mtk-01',
      studentName: 'Citra Dewi Lestari',
      studentClass: '6B',
      birthDate: '2014-08-03',
      finishedAt: '2026-11-26 08:28',
      answers: {
        'q-mtk-1': 'B',
        'q-mtk-2': ['1'],
        'q-mtk-3': { p1: true, p2: true, p3: true },
        'q-mtk-4': { L1: 'R3', L2: 'R2', L3: 'R1' },
      },
    },
    {
      id: 'sess-4',
      packageId: 'pkg-tka-mtk-01',
      studentName: 'Dimas Arya Nugroho',
      studentClass: '6B',
      birthDate: '2014-11-21',
      finishedAt: '2026-11-26 08:29',
      answers: {
        'q-mtk-1': 'A',
        'q-mtk-2': ['1', '2'],
        'q-mtk-3': { p1: true, p2: false, p3: true },
        'q-mtk-4': { L1: 'R3', L2: 'R2', L3: 'R1' },
      },
    },
    {
      id: 'sess-9',
      packageId: 'pkg-tka-bin-01',
      studentName: 'Alya Putri Ramadhani',
      studentClass: '6A',
      birthDate: '2014-05-12',
      finishedAt: '2026-11-26 10:15',
      answers: {
        'q-bin-1': 'B',
        'q-bin-2': ['1', '2', '4'],
        'q-bin-3': { p1: false, p2: true, p3: true },
        'q-bin-4': { L1: 'R2', L2: 'R3', L3: 'R1' },
      },
    },
    {
      id: 'sess-10',
      packageId: 'pkg-tka-bin-01',
      studentName: 'Bima Sakti Pratama',
      studentClass: '6A',
      birthDate: '2014-02-18',
      finishedAt: '2026-11-26 10:18',
      answers: {
        'q-bin-1': 'B',
        'q-bin-2': ['1', '2'],
        'q-bin-3': { p1: false, p2: true, p3: true },
        'q-bin-4': { L1: 'R2', L2: 'R3', L3: 'R1' },
      },
    },
  ];

  return rawSamples.map((s) => {
    const qs = s.packageId === 'pkg-tka-mtk-01' ? mtkQs : binQs;
    const itemScores = {};
    let obtained = 0;
    let max = 0;
    qs.forEach((q) => {
      const res = evaluateQuestion(q, s.answers[q.id]);
      itemScores[q.id] = res.score;
      obtained += res.score;
      max += res.maxScore;
    });
    const scoreTotal = max > 0 ? Number(((obtained / max) * 100).toFixed(1)) : 0;
    return { ...s, itemScores, scoreTotal };
  });
}

// ============================================================================
// 3. KOMPONEN VISUAL SVG (BANGUN DATAR & GRAFIK BATANG)
// ============================================================================

const GeometryFigureSVG = () => (
  <div className="my-4 flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-4">
    <svg viewBox="0 0 340 175" className="w-full max-w-sm h-auto" role="img" aria-label="Bangun gabungan persegi panjang dan segitiga">
      <rect x="35" y="30" width="160" height="105" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
      <polygon points="195,30 195,135 285,135" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
      <line x1="195" y1="30" x2="195" y2="135" stroke="#0284c7" strokeWidth="2" strokeDasharray="5,4" />
      <polyline points="195,123 207,123 207,135" fill="none" stroke="#d97706" strokeWidth="1.8" />
      <text x="115" y="22" textAnchor="middle" className="fill-slate-700 font-bold text-xs">12 m</text>
      <text x="18" y="86" textAnchor="middle" className="fill-slate-700 font-bold text-xs">8 m</text>
      <text x="240" y="154" textAnchor="middle" className="fill-amber-700 font-bold text-xs">6 m</text>
      <text x="115" y="154" textAnchor="middle" className="fill-sky-700 font-bold text-xs">12 m</text>
      <text x="115" y="87" textAnchor="middle" className="fill-sky-800 text-[11px] font-medium">Persegi Panjang</text>
      <text x="225" y="112" textAnchor="middle" className="fill-amber-800 text-[11px] font-medium">Segitiga</text>
    </svg>
  </div>
);

const HarvestBarChartSVG = () => {
  const data = [
    { month: 'Januari', val: 50, color: '#38bdf8' },
    { month: 'Februari', val: 60, color: '#0ea5e9' },
    { month: 'Maret', val: 80, color: '#0284c7' },
    { month: 'April', val: 50, color: '#38bdf8' },
  ];
  const maxVal = 100;

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4">
      <svg viewBox="0 0 360 200" className="w-full h-auto" role="img" aria-label="Diagram Batang Hasil Panen Mangga">
        {[0, 20, 40, 60, 80, 100].map((tick) => {
          const y = 165 - (tick / maxVal) * 135;
          return (
            <g key={tick}>
              <line x1="42" y1={y} x2="340" y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x="34" y={y + 4} textAnchor="end" className="fill-slate-500 text-[10px] font-medium">
                {tick}
              </text>
            </g>
          );
        })}
        <line x1="42" y1="25" x2="42" y2="165" stroke="#64748b" strokeWidth="1.5" />
        <line x1="42" y1="165" x2="340" y2="165" stroke="#64748b" strokeWidth="1.5" />
        {data.map((d, idx) => {
          const barWidth = 42;
          const x = 68 + idx * 70;
          const barHeight = (d.val / maxVal) * 135;
          const y = 165 - barHeight;
          return (
            <g key={d.month}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill={d.color} />
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="fill-slate-800 text-[11px] font-bold">
                {d.val} kg
              </text>
              <text x={x + barWidth / 2} y="182" textAnchor="middle" className="fill-slate-600 text-[11px] font-medium">
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ============================================================================
// 4. KOMPONEN UTAMA APLIKASI (PORTAL SISWA + PORTAL GURU/ADMIN)
// ============================================================================

export default function App() {
  // --- STATE DATA UTAMA (Tersimpan Otomatis di localStorage + Sinkron Supabase) ---
  const [packages, setPackages] = useState(() => loadLocalJson(STORAGE_KEYS.packages, INITIAL_PACKAGES));
  const [stimuli, setStimuli] = useState(() => loadLocalJson(STORAGE_KEYS.stimuli, INITIAL_STIMULI));
  const [questions, setQuestions] = useState(() => loadLocalJson(STORAGE_KEYS.questions, INITIAL_QUESTIONS));
  const [sessions, setSessions] = useState(() =>
    loadLocalJson(STORAGE_KEYS.sessions, () => buildSeedSessions(INITIAL_QUESTIONS))
  );

  // Auto-save setiap perubahan ke localStorage agar tidak hilang saat refresh
  useEffect(() => saveLocalJson(STORAGE_KEYS.packages, packages), [packages]);
  useEffect(() => saveLocalJson(STORAGE_KEYS.stimuli, stimuli), [stimuli]);
  useEffect(() => saveLocalJson(STORAGE_KEYS.questions, questions), [questions]);
  useEffect(() => saveLocalJson(STORAGE_KEYS.sessions, sessions), [sessions]);

  // --- MODE PORTAL ---
  const [portalMode, setPortalMode] = useState('STUDENT');
  const [adminPkgId, setAdminPkgId] = useState(() => packages[0]?.id || INITIAL_PACKAGES[0].id);

  // --- TOAST NOTIFIKASI ---
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // --- STATE KONEKSI SUPABASE ---
  const [supabaseConfig, setSupabaseConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.supabase);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey) return parsed;
      }
    } catch {
      // Abaikan
    }
    if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY) {
      return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY, connected: true };
    }
    return { url: '', anonKey: '', connected: false };
  });
  const [supabaseTestError, setSupabaseTestError] = useState('');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('idle');
  const [autoRefreshLive, setAutoRefreshLive] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);

  const buildSupabaseHeaders = useCallback((apiKey, extra = {}) => {
    const cleanKey = (apiKey || '').trim();
    const headers = { apikey: cleanKey, ...extra };
    if (cleanKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${cleanKey}`;
    }
    return headers;
  }, []);

  // --- FUNGSI SINKRONISASI CLOUD SUPABASE (CRUD PENUH) ---
  const upsertCloudRows = useCallback(
    async (table, rows, configOverride = null) => {
      const cfg = configOverride || supabaseConfig;
      if (!cfg.connected || !cfg.url || !cfg.anonKey || !rows.length) return { ok: false, skipped: true };
      const cleanUrl = cfg.url.trim().replace(/\/$/, '');
      try {
        const res = await fetch(`${cleanUrl}/rest/v1/${table}`, {
          method: 'POST',
          headers: buildSupabaseHeaders(cfg.anonKey, {
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
          }),
          body: JSON.stringify(rows),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (res.status === 404 || String(err.message || '').includes('does not exist')) {
            setCloudSyncStatus('needs_sql');
          }
          return { ok: false, status: res.status, message: err.message || res.statusText };
        }
        setCloudSyncStatus('synced');
        return { ok: true };
      } catch (e) {
        return { ok: false, message: e.message };
      }
    },
    [supabaseConfig, buildSupabaseHeaders]
  );

  const deleteCloudRow = useCallback(
    async (table, id) => {
      if (!supabaseConfig.connected || !supabaseConfig.url || !supabaseConfig.anonKey) return;
      const cleanUrl = supabaseConfig.url.trim().replace(/\/$/, '');
      try {
        await fetch(`${cleanUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: buildSupabaseHeaders(supabaseConfig.anonKey),
        });
      } catch {
        // Tetap terhapus lokal
      }
    },
    [supabaseConfig, buildSupabaseHeaders]
  );

  // Memuat seluruh data terbaru dari Supabase (Paket, Wacana, Soal, Sesi Nilai)
  const loadAllFromSupabase = useCallback(
    async (cfg = supabaseConfig, silent = false) => {
      if (!cfg.connected || !cfg.url || !cfg.anonKey) return false;
      const cleanUrl = cfg.url.trim().replace(/\/$/, '');
      setCloudSyncStatus('syncing');
      try {
        const headers = buildSupabaseHeaders(cfg.anonKey);
        const [pkgRes, stimRes, qRes, sessRes] = await Promise.all([
          fetch(`${cleanUrl}/rest/v1/tka_packages?select=id,data`, { headers }),
          fetch(`${cleanUrl}/rest/v1/tka_stimuli?select=id,data`, { headers }),
          fetch(`${cleanUrl}/rest/v1/tka_questions?select=id,data`, { headers }),
          fetch(`${cleanUrl}/rest/v1/tka_sessions?select=id,data`, { headers }),
        ]);

        if (!pkgRes.ok || !qRes.ok) {
          setCloudSyncStatus('needs_sql');
          if (!silent) {
            showToast(
              'Tabel sinkronisasi (tka_packages/tka_questions) belum dibuat. Jalankan SQL Bagian 4 di Supabase!',
              'error'
            );
          }
          return false;
        }

        const [pkgRows, stimRows, qRows, sessRows] = await Promise.all([
          pkgRes.json(),
          stimRes.ok ? stimRes.json() : [],
          qRes.json(),
          sessRes.ok ? sessRes.json() : [],
        ]);

        if (Array.isArray(pkgRows) && pkgRows.length > 0) {
          const loadedPkgs = pkgRows.map((r) => r.data);
          setPackages(loadedPkgs);
          setAdminPkgId((prev) => (loadedPkgs.some((p) => p.id === prev) ? prev : loadedPkgs[0].id));
        }
        if (Array.isArray(stimRows) && stimRows.length > 0) {
          setStimuli(stimRows.map((r) => r.data));
        }
        if (Array.isArray(qRows) && qRows.length > 0) {
          setQuestions(qRows.map((r) => r.data));
        }
        if (Array.isArray(sessRows) && sessRows.length > 0) {
          setSessions(sessRows.map((r) => r.data));
        }

        const now = new Date();
        setLastSyncedTime(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
            now.getSeconds()
          ).padStart(2, '0')}`
        );
        setCloudSyncStatus('synced');
        if (!silent) showToast('Data terbaru berhasil dimuat dari Supabase Cloud!');
        return true;
      } catch {
        setCloudSyncStatus('idle');
        if (!silent) showToast('Gagal memuat data dari Supabase. Menggunakan data lokal.', 'error');
        return false;
      }
    },
    [supabaseConfig, buildSupabaseHeaders, showToast]
  );

  // Menyegarkan khusus data nilai siswa secara ringan untuk Live Auto-Refresh (10 detik)
  const refreshSessionsFromSupabase = useCallback(
    async (cfg = supabaseConfig, silent = true) => {
      if (!cfg.connected || !cfg.url || !cfg.anonKey) return false;
      const cleanUrl = cfg.url.trim().replace(/\/$/, '');
      try {
        const res = await fetch(`${cleanUrl}/rest/v1/tka_sessions?select=id,data`, {
          headers: buildSupabaseHeaders(cfg.anonKey),
        });
        if (!res.ok) return false;
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          setSessions(rows.map((r) => r.data));
        }
        const now = new Date();
        setLastSyncedTime(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
            now.getSeconds()
          ).padStart(2, '0')}`
        );
        setCloudSyncStatus('synced');
        if (!silent) showToast('Rekap nilai terbaru berhasil dimuat dari Supabase!');
        return true;
      } catch {
        if (!silent) showToast('Gagal menyegarkan data nilai dari Supabase.', 'error');
        return false;
      }
    },
    [supabaseConfig, buildSupabaseHeaders, showToast]
  );

  // Mengunggah seluruh data lokal (paket, wacana, soal, nilai) ke Supabase sekaligus
  const pushAllLocalToSupabase = useCallback(
    async (cfg = supabaseConfig) => {
      if (!cfg.connected || !cfg.url || !cfg.anonKey) {
        showToast('Hubungkan Supabase terlebih dahulu.', 'error');
        return;
      }
      setCloudSyncStatus('syncing');
      const [r1, r2, r3, r4] = await Promise.all([
        upsertCloudRows(
          'tka_packages',
          packages.map((p) => ({ id: p.id, data: p })),
          cfg
        ),
        upsertCloudRows(
          'tka_stimuli',
          stimuli.map((s) => ({ id: s.id, package_id: s.packageId, data: s })),
          cfg
        ),
        upsertCloudRows(
          'tka_questions',
          questions.map((q) => ({ id: q.id, package_id: q.packageId, data: q })),
          cfg
        ),
        upsertCloudRows(
          'tka_sessions',
          sessions.map((s) => ({ id: s.id, package_id: s.packageId, data: s })),
          cfg
        ),
      ]);

      if (r1.ok && r3.ok) {
        setCloudSyncStatus('synced');
        showToast(`Berhasil mengunggah ${packages.length} paket & ${questions.length} soal ke Supabase!`);
      } else {
        setCloudSyncStatus('needs_sql');
        showToast(
          'Gagal mengunggah ke Supabase. Pastikan SQL Bagian 4 (tka_packages, tka_questions, dll.) sudah dijalankan!',
          'error'
        );
      }
    },
    [packages, stimuli, questions, sessions, supabaseConfig, upsertCloudRows, showToast]
  );

  // Muat otomatis data dari Supabase saat aplikasi dibuka
  useEffect(() => {
    if (supabaseConfig.connected && supabaseConfig.url && supabaseConfig.anonKey) {
      loadAllFromSupabase(supabaseConfig, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-Refresh Real-Time setiap 10 detik saat Guru membuka Dashboard
  useEffect(() => {
    if (portalMode !== 'TEACHER_DASHBOARD' || !supabaseConfig.connected || !autoRefreshLive) {
      return;
    }
    const intervalId = setInterval(() => {
      refreshSessionsFromSupabase(supabaseConfig, true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [portalMode, supabaseConfig, autoRefreshLive, refreshSessionsFromSupabase]);

  // ==========================================================================
  // STATE PORTAL SISWA
  // ==========================================================================
  const [step, setStep] = useState('TOKEN');
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [student, setStudent] = useState({ name: '', className: '6A', birthDate: '' });
  const [identityError, setIdentityError] = useState('');

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [fontSize, setFontSize] = useState('md');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [activeMatchLeft, setActiveMatchLeft] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('ALL');

  const activeQuestions = useMemo(() => {
    if (!selectedPackage) return [];
    return questions
      .filter((q) => q.packageId === selectedPackage.id)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
  }, [questions, selectedPackage]);

  useEffect(() => {
    setActiveMatchLeft(null);
  }, [currentIdx]);

  const finishExamAndRecord = useCallback(() => {
    if (!selectedPackage) return;
    const itemScores = {};
    let obtained = 0;
    let max = 0;
    activeQuestions.forEach((q) => {
      const res = evaluateQuestion(q, answers[q.id]);
      itemScores[q.id] = res.score;
      obtained += res.score;
      max += res.maxScore;
    });
    const scoreTotal = max > 0 ? Number(((obtained / max) * 100).toFixed(1)) : 0;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newSession = {
      id: `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      packageId: selectedPackage.id,
      studentName: student.name.trim(),
      studentClass: student.className,
      birthDate: student.birthDate,
      finishedAt: formattedDate,
      answers: { ...answers },
      itemScores,
      scoreTotal,
    };

    setSessions((prev) => [newSession, ...prev]);
    upsertCloudRows('tka_sessions', [{ id: newSession.id, package_id: newSession.packageId, data: newSession }]);
    setShowFinishModal(false);
    setStep('RESULT');
  }, [activeQuestions, answers, selectedPackage, student, upsertCloudRows]);

  useEffect(() => {
    if (portalMode !== 'STUDENT' || step !== 'EXAM') return;
    if (timeLeft <= 0) {
      finishExamAndRecord();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [portalMode, step, timeLeft, finishExamAndRecord]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const updateAnswer = useCallback((questionId, newAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: newAnswer }));
    const now = new Date();
    setLastSavedAt(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
        now.getSeconds()
      ).padStart(2, '0')}`
    );
  }, []);

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    const cleaned = tokenInput.trim().toUpperCase();
    const foundPkg = packages.find((pkg) => pkg.token.toUpperCase() === cleaned && pkg.isActive);
    if (!foundPkg) {
      setTokenError('Token tidak ditemukan atau sesi ujian sedang dinonaktifkan oleh guru.');
      return;
    }
    const pkgQuestions = questions.filter((q) => q.packageId === foundPkg.id);
    if (pkgQuestions.length === 0) {
      setTokenError('Paket soal ini belum memiliki butir soal. Hubungi guru.');
      return;
    }
    setSelectedPackage(foundPkg);
    setTokenError('');
    setStep('IDENTITY');
  };

  const handleStartExam = (e) => {
    e.preventDefault();
    if (!student.name.trim()) {
      setIdentityError('Silakan masukkan Nama Lengkap terlebih dahulu.');
      return;
    }
    if (!student.birthDate) {
      setIdentityError('Silakan pilih Tanggal Lahir terlebih dahulu.');
      return;
    }
    setIdentityError('');
    setAnswers({});
    setFlagged({});
    setCurrentIdx(0);
    setTimeLeft((selectedPackage?.durationMinutes || 30) * 60);
    setStep('EXAM');
  };

  const handleRestartStudent = () => {
    setAnswers({});
    setFlagged({});
    setCurrentIdx(0);
    setSelectedPackage(null);
    setTokenInput('');
    setReviewFilter('ALL');
    setStep('TOKEN');
  };

  const studentResults = useMemo(() => {
    const details = activeQuestions.map((q) => {
      const evalRes = evaluateQuestion(q, answers[q.id]);
      return { question: q, userAnswer: answers[q.id], ...evalRes };
    });
    const totalObtained = details.reduce((acc, item) => acc + item.score, 0);
    const totalMax = details.reduce((acc, item) => acc + item.maxScore, 0);
    const scoreTotal = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;

    const countCorrect = details.filter((d) => d.status === 'correct').length;
    const countPartial = details.filter((d) => d.status === 'partial').length;
    const countWrong = details.filter((d) => d.status === 'wrong' || d.status === 'unanswered').length;

    return { details, scoreTotal, countCorrect, countPartial, countWrong };
  }, [activeQuestions, answers]);

  // ==========================================================================
  // STATE PORTAL GURU / ADMIN
  // ==========================================================================
  const [teacherPass, setTeacherPass] = useState('');
  const [teacherLoginErr, setTeacherLoginErr] = useState('');
  const [teacherTab, setTeacherTab] = useState('PACKAGES');

  const [showNewPkgModal, setShowNewPkgModal] = useState(false);
  const [newPkgForm, setNewPkgForm] = useState({
    title: '',
    subject: 'Matematika',
    token: '',
    durationMinutes: 45,
  });

  const [bankSubTab, setBankSubTab] = useState('LIST');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qForm, setQForm] = useState({
    type: 'PG',
    topic: '',
    difficulty: 'Sedang',
    weight: 1,
    stimulusId: '',
    questionText: '',
    explanation: '',
    pgOptions: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ],
    pgCorrect: 'A',
    pgKompleksCorrect: ['A'],
    bsStatements: [
      { id: 'p1', text: '', answer: true },
      { id: 'p2', text: '', answer: false },
    ],
    matchPairs: [
      { id: '1', leftText: '', rightText: '' },
      { id: '2', leftText: '', rightText: '' },
      { id: '3', leftText: '', rightText: '' },
    ],
  });

  const [showStimulusModal, setShowStimulusModal] = useState(false);
  const [stimForm, setStimForm] = useState({ title: '', content: '' });

  const [resultClassFilter, setResultClassFilter] = useState('ALL');
  const [resultSearch, setResultSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ==========================================================================
  // HANDLER PORTAL GURU (DENGAN SIMPAN LOKAL + SUPABASE OTOMATIS)
  // ==========================================================================

  const handleTeacherLogin = (e) => {
    e.preventDefault();
    const entered = teacherPass.trim();
    if (entered === TEACHER_PASSWORD || entered === ADMIN_PASSWORD) {
      setTeacherLoginErr('');
      setPortalMode('TEACHER_DASHBOARD');
      showToast('Berhasil masuk ke Portal Guru!');
    } else {
      setTeacherLoginErr('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
    }
  };

  const generateRandomToken = (subject) => {
    const prefix = subject === 'Matematika' ? 'MTK' : 'BIN';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${rand}`;
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!newPkgForm.title.trim()) return;
    const tokenVal = (newPkgForm.token.trim() || generateRandomToken(newPkgForm.subject)).toUpperCase();
    if (packages.some((p) => p.token.toUpperCase() === tokenVal)) {
      showToast('Token sudah dipakai paket lain, gunakan token unik.', 'error');
      return;
    }
    const created = {
      id: `pkg-${Date.now()}`,
      title: newPkgForm.title.trim(),
      subject: newPkgForm.subject,
      token: tokenVal,
      durationMinutes: Number(newPkgForm.durationMinutes) || 30,
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setPackages((prev) => [created, ...prev]);
    setAdminPkgId(created.id);
    setShowNewPkgModal(false);
    setNewPkgForm({ title: '', subject: 'Matematika', token: '', durationMinutes: 45 });

    const res = await upsertCloudRows('tka_packages', [{ id: created.id, data: created }]);
    if (res.ok) {
      showToast(`Paket "${created.title}" tersimpan di lokal & Supabase Cloud!`);
    } else if (res.skipped) {
      showToast(`Paket "${created.title}" tersimpan permanen di perangkat ini!`);
    } else {
      showToast('Paket tersimpan lokal. Jalankan SQL Bagian 4 di Supabase agar tersimpan di Cloud.', 'error');
    }
  };

  const handleTogglePackageActive = async (pkg) => {
    const updated = { ...pkg, isActive: !pkg.isActive };
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));
    await upsertCloudRows('tka_packages', [{ id: updated.id, data: updated }]);
  };

  const openNewQuestionModal = () => {
    setEditingQuestionId(null);
    setQForm({
      type: 'PG',
      topic: '',
      difficulty: 'Sedang',
      weight: 1,
      stimulusId: '',
      questionText: '',
      explanation: '',
      pgOptions: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      pgCorrect: 'A',
      pgKompleksCorrect: ['A'],
      bsStatements: [
        { id: 'p1', text: '', answer: true },
        { id: 'p2', text: '', answer: false },
      ],
      matchPairs: [
        { id: '1', leftText: '', rightText: '' },
        { id: '2', leftText: '', rightText: '' },
        { id: '3', leftText: '', rightText: '' },
      ],
    });
    setShowQuestionModal(true);
  };

  const openEditQuestionModal = (q) => {
    setEditingQuestionId(q.id);
    const base = {
      type: q.type,
      topic: q.topic || '',
      difficulty: q.difficulty || 'Sedang',
      weight: q.weight || 1,
      stimulusId: q.stimulusId || '',
      questionText: q.questionText || '',
      explanation: q.explanation || '',
      pgOptions: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      pgCorrect: 'A',
      pgKompleksCorrect: [],
      bsStatements: [
        { id: 'p1', text: '', answer: true },
        { id: 'p2', text: '', answer: false },
      ],
      matchPairs: [
        { id: '1', leftText: '', rightText: '' },
        { id: '2', leftText: '', rightText: '' },
      ],
    };

    if (q.type === 'PG') {
      base.pgOptions = q.options.map((o) => ({ ...o }));
      base.pgCorrect = q.correctAnswer;
    } else if (q.type === 'PG_KOMPLEKS') {
      base.pgOptions = q.options.map((o) => ({ ...o }));
      base.pgKompleksCorrect = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [];
    } else if (q.type === 'BENAR_SALAH') {
      base.bsStatements = q.options.map((o) => ({
        id: o.id,
        text: o.text,
        answer: Boolean(q.correctAnswer[o.id]),
      }));
    } else if (q.type === 'MENJODOHKAN') {
      base.matchPairs = q.options.left.map((l, idx) => {
        const rId = q.correctAnswer[l.id];
        const rObj = q.options.right.find((r) => r.id === rId);
        return { id: String(idx + 1), leftText: l.text, rightText: rObj ? rObj.text : '' };
      });
    }

    setQForm(base);
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const targetPkg = packages.find((p) => p.id === adminPkgId);
    if (!targetPkg || !qForm.questionText.trim()) return;

    let optionsPayload;
    let correctPayload;

    if (qForm.type === 'PG') {
      optionsPayload = qForm.pgOptions.filter((o) => o.text.trim());
      correctPayload = qForm.pgCorrect;
    } else if (qForm.type === 'PG_KOMPLEKS') {
      optionsPayload = qForm.pgOptions.filter((o) => o.text.trim());
      correctPayload = qForm.pgKompleksCorrect;
    } else if (qForm.type === 'BENAR_SALAH') {
      const valid = qForm.bsStatements.filter((s) => s.text.trim());
      optionsPayload = valid.map((s) => ({ id: s.id, text: s.text }));
      correctPayload = {};
      valid.forEach((s) => {
        correctPayload[s.id] = s.answer;
      });
    } else if (qForm.type === 'MENJODOHKAN') {
      const valid = qForm.matchPairs.filter((m) => m.leftText.trim() && m.rightText.trim());
      const left = valid.map((m, i) => ({ id: `L${i + 1}`, text: m.leftText }));
      const right = valid.map((m, i) => ({ id: `R${i + 1}`, text: m.rightText }));
      const shiftedRight = right.length > 1 ? [...right.slice(1), right[0]] : right;
      optionsPayload = { left, right: shiftedRight };
      correctPayload = {};
      valid.forEach((_, i) => {
        correctPayload[`L${i + 1}`] = `R${i + 1}`;
      });
    }

    const questionObj = {
      id: editingQuestionId || `q-${Date.now()}`,
      packageId: targetPkg.id,
      subject: targetPkg.subject,
      topic: qForm.topic.trim() || 'Materi Umum',
      difficulty: qForm.difficulty,
      type: qForm.type,
      weight: Number(qForm.weight) || 1,
      stimulusId: qForm.stimulusId || null,
      questionText: qForm.questionText.trim(),
      options: optionsPayload,
      correctAnswer: correctPayload,
      explanation: qForm.explanation.trim() || 'Pembahasan belum diisi.',
    };

    if (editingQuestionId) {
      setQuestions((prev) => prev.map((q) => (q.id === editingQuestionId ? questionObj : q)));
    } else {
      setQuestions((prev) => [...prev, questionObj]);
    }
    setShowQuestionModal(false);

    const res = await upsertCloudRows('tka_questions', [
      { id: questionObj.id, package_id: questionObj.packageId, data: questionObj },
    ]);

    if (res.ok) {
      showToast('Soal berhasil disimpan ke perangkat & Supabase Cloud!');
    } else if (res.skipped) {
      showToast('Soal berhasil disimpan permanen di perangkat ini!');
    } else {
      showToast('Soal tersimpan lokal. Jalankan SQL Bagian 4 di Supabase agar tersimpan di Cloud.', 'error');
    }
  };

  const handleCreateStimulus = async (e) => {
    e.preventDefault();
    const targetPkg = packages.find((p) => p.id === adminPkgId);
    if (!targetPkg || !stimForm.title.trim() || !stimForm.content.trim()) return;
    const created = {
      id: `stim-${Date.now()}`,
      packageId: targetPkg.id,
      subject: targetPkg.subject,
      title: stimForm.title.trim(),
      type: 'text',
      content: stimForm.content.trim(),
    };
    setStimuli((prev) => [created, ...prev]);
    setStimForm({ title: '', content: '' });
    setShowStimulusModal(false);

    const res = await upsertCloudRows('tka_stimuli', [
      { id: created.id, package_id: created.packageId, data: created },
    ]);
    showToast(res.ok ? 'Wacana tersimpan ke Supabase Cloud!' : 'Wacana tersimpan permanen di perangkat ini!');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'package') {
      setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setQuestions((prev) => prev.filter((q) => q.packageId !== deleteTarget.id));
      if (adminPkgId === deleteTarget.id) {
        const remaining = packages.filter((p) => p.id !== deleteTarget.id);
        setAdminPkgId(remaining[0]?.id || '');
      }
      await deleteCloudRow('tka_packages', deleteTarget.id);
      showToast('Paket soal berhasil dihapus.');
    } else if (deleteTarget.type === 'question') {
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      await deleteCloudRow('tka_questions', deleteTarget.id);
      showToast('Butir soal berhasil dihapus.');
    } else if (deleteTarget.type === 'stimulus') {
      setStimuli((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setQuestions((prev) =>
        prev.map((q) => (q.stimulusId === deleteTarget.id ? { ...q, stimulusId: null } : q))
      );
      await deleteCloudRow('tka_stimuli', deleteTarget.id);
      showToast('Wacana berhasil dihapus.');
    }
    setDeleteTarget(null);
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent = [
      'topik,tingkat_kesulitan,pertanyaan,opsi_a,opsi_b,opsi_c,opsi_d,kunci,pembahasan',
      '"Bilangan Bulat","Mudah","Hasil dari 125 + 75 x 2 adalah...","400","275","250","300","B","Perkalian dikerjakan terlebih dahulu: 75 x 2 = 150, lalu 125 + 150 = 275."',
      '"Pecahan","Sedang","Bentuk desimal dari pecahan 3/5 adalah...","0,3","0,5","0,6","0,75","C","3/5 = 6/10 = 0,6."',
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_soal_tka.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (e) => {
    const file = e.target.files?.[0];
    const targetPkg = packages.find((p) => p.id === adminPkgId);
    if (!file || !targetPkg) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = String(ev.target?.result || '');
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length < 2) {
          showToast('File CSV kosong atau tidak sesuai format template.', 'error');
          return;
        }
        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
          const clean = cols.map((c) => c.replace(/^"|"$/g, '').trim());
          if (clean.length >= 8) {
            imported.push({
              id: `q-csv-${Date.now()}-${i}`,
              packageId: targetPkg.id,
              subject: targetPkg.subject,
              topic: clean[0] || 'Materi Umum',
              difficulty: ['Mudah', 'Sedang', 'Sulit'].includes(clean[1]) ? clean[1] : 'Sedang',
              type: 'PG',
              weight: 1,
              stimulusId: null,
              questionText: clean[2],
              options: [
                { id: 'A', text: clean[3] },
                { id: 'B', text: clean[4] },
                { id: 'C', text: clean[5] },
                { id: 'D', text: clean[6] },
              ],
              correctAnswer: (clean[7] || 'A').toUpperCase(),
              explanation: clean[8] || 'Pembahasan dari import CSV.',
            });
          }
        }
        if (imported.length > 0) {
          setQuestions((prev) => [...prev, ...imported]);
          const res = await upsertCloudRows(
            'tka_questions',
            imported.map((q) => ({ id: q.id, package_id: q.packageId, data: q }))
          );
          showToast(
            res.ok
              ? `Berhasil mengimpor & menyimpan ${imported.length} soal ke Supabase Cloud!`
              : `Berhasil mengimpor ${imported.length} soal ke perangkat ini!`
          );
        } else {
          showToast('Tidak ada baris soal yang valid pada file CSV.', 'error');
        }
      } catch {
        showToast('Gagal membaca file CSV. Pastikan memakai template resmi.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportResultsCsv = () => {
    const pkg = packages.find((p) => p.id === adminPkgId);
    const filtered = sessions.filter(
      (s) => s.packageId === adminPkgId && (resultClassFilter === 'ALL' || s.studentClass === resultClassFilter)
    );
    const header = 'No,Nama Siswa,Kelas,Tanggal Lahir,Waktu Selesai,Nilai Akhir';
    const rows = filtered.map(
      (s, idx) =>
        `${idx + 1},"${s.studentName}","${s.studentClass}","${s.birthDate}","${s.finishedAt}",${s.scoreTotal}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_nilai_${(pkg?.token || 'TKA').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File rekap nilai Excel (.csv) berhasil diunduh!');
  };

  // ==========================================================================
  // ANALISIS BUTIR SOAL (TEORI TES KLASIK)
  // ==========================================================================
  const itemAnalysisData = useMemo(() => {
    const pkgQuestions = questions.filter((q) => q.packageId === adminPkgId);
    const pkgSessions = sessions.filter((s) => s.packageId === adminPkgId);
    const n = pkgSessions.length;

    if (n === 0 || pkgQuestions.length === 0) {
      return { items: [], topicSummary: [], totalParticipants: n };
    }

    const sortedSessions = [...pkgSessions].sort((a, b) => b.scoreTotal - a.scoreTotal);
    const groupSize = Math.max(1, Math.round(n * 0.27));
    const upperGroup = sortedSessions.slice(0, groupSize);
    const lowerGroup = sortedSessions.slice(Math.max(0, n - groupSize));

    const topicMap = {};

    const items = pkgQuestions.map((q, idx) => {
      const W = Number(q.weight) || 1;
      const scores = pkgSessions.map((s) =>
        s.itemScores && s.itemScores[q.id] !== undefined
          ? s.itemScores[q.id]
          : evaluateQuestion(q, s.answers?.[q.id]).score
      );
      const meanScore = scores.reduce((a, b) => a + b, 0) / n;
      const pValue = Number((meanScore / W).toFixed(2));

      const pUpper =
        upperGroup.reduce((acc, s) => {
          const sc =
            s.itemScores && s.itemScores[q.id] !== undefined
              ? s.itemScores[q.id]
              : evaluateQuestion(q, s.answers?.[q.id]).score;
          return acc + sc / W;
        }, 0) / upperGroup.length;

      const pLower =
        lowerGroup.reduce((acc, s) => {
          const sc =
            s.itemScores && s.itemScores[q.id] !== undefined
              ? s.itemScores[q.id]
              : evaluateQuestion(q, s.answers?.[q.id]).score;
          return acc + sc / W;
        }, 0) / lowerGroup.length;

      const dValue = Number((pUpper - pLower).toFixed(2));

      let pLabel = 'Sedang';
      let pColor = 'bg-sky-100 text-sky-800';
      if (pValue < 0.3) {
        pLabel = 'Sukar';
        pColor = 'bg-rose-100 text-rose-800';
      } else if (pValue > 0.7) {
        pLabel = 'Mudah';
        pColor = 'bg-emerald-100 text-emerald-800';
      }

      let dLabel = 'Sangat Baik';
      let dColor = 'bg-emerald-100 text-emerald-800';
      if (dValue < 0.2) {
        dLabel = 'Revisi';
        dColor = 'bg-rose-100 text-rose-800';
      } else if (dValue < 0.3) {
        dLabel = 'Cukup';
        dColor = 'bg-amber-100 text-amber-800';
      } else if (dValue < 0.4) {
        dLabel = 'Baik';
        dColor = 'bg-sky-100 text-sky-800';
      }

      let distractorStats = null;
      if (q.type === 'PG' && Array.isArray(q.options)) {
        distractorStats = q.options.map((opt) => {
          const count = pkgSessions.filter((s) => s.answers?.[q.id] === opt.id).length;
          const pct = Math.round((count / n) * 100);
          return { id: opt.id, pct, isKey: opt.id === q.correctAnswer };
        });
      }

      if (!topicMap[q.topic]) topicMap[q.topic] = { topic: q.topic, sumP: 0, count: 0 };
      topicMap[q.topic].sumP += pValue;
      topicMap[q.topic].count += 1;

      return { number: idx + 1, question: q, pValue, pLabel, pColor, dValue, dLabel, dColor, distractorStats };
    });

    const topicSummary = Object.values(topicMap).map((t) => ({
      topic: t.topic,
      percent: Math.round((t.sumP / t.count) * 100),
      questionCount: t.count,
    }));

    return { items, topicSummary, totalParticipants: n };
  }, [adminPkgId, questions, sessions]);

  const fontClasses = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
  };

  const ToastBanner = () =>
    toast ? (
      <div className="fixed bottom-5 right-5 z-50">
        <div
          className={`px-4 py-3 rounded-2xl shadow-xl border font-semibold text-sm flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      </div>
    ) : null;

  // ==========================================================================
  // VIEW A: LOGIN PORTAL GURU
  // ==========================================================================
  if (portalMode === 'TEACHER_LOGIN') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <ToastBanner />
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-indigo-900 p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8 text-sky-300" />
            </div>
            <h1 className="text-xl font-bold">Portal Guru &amp; Admin Sekolah</h1>
            <p className="text-sky-200 font-bold text-xs tracking-wider uppercase mt-1">{SCHOOL_NAME}</p>
            <p className="text-slate-300 text-xs mt-1">Kelola Paket Soal, Nilai, &amp; Analisis TKA</p>
          </div>
          <form onSubmit={handleTeacherLogin} className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi Guru</label>
              <input
                type="password"
                value={teacherPass}
                onChange={(e) => {
                  setTeacherPass(e.target.value);
                  setTeacherLoginErr('');
                }}
                placeholder="Masukkan kata sandi..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
              />
              {teacherLoginErr && (
                <p className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {teacherLoginErr}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition"
            >
              Masuk Dashboard Guru
            </button>

            <button
              type="button"
              onClick={() => setPortalMode('STUDENT')}
              className="w-full py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              ← Kembali ke Portal Siswa
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW B: DASHBOARD PORTAL GURU / ADMIN
  // ==========================================================================
  if (portalMode === 'TEACHER_DASHBOARD') {
    const activeAdminPkg = packages.find((p) => p.id === adminPkgId) || packages[0];
    const pkgQuestions = questions.filter((q) => q.packageId === adminPkgId);
    const pkgStimuli = stimuli.filter((s) => s.packageId === adminPkgId);
    const pkgSessions = sessions.filter((s) => {
      if (s.packageId !== adminPkgId) return false;
      if (resultClassFilter !== 'ALL' && s.studentClass !== resultClassFilter) return false;
      if (resultSearch.trim() && !s.studentName.toLowerCase().includes(resultSearch.toLowerCase())) return false;
      return true;
    });

    const avgAllScore =
      sessions.length > 0
        ? (sessions.reduce((acc, s) => acc + s.scoreTotal, 0) / sessions.length).toFixed(1)
        : '0.0';

    const navItems = [
      { id: 'PACKAGES', label: 'Paket Soal', icon: FolderKanban },
      { id: 'QUESTIONS', label: 'Bank Soal & Wacana', icon: FileText },
      { id: 'RESULTS', label: 'Rekap Nilai', icon: Users },
      { id: 'ANALYSIS', label: 'Analisis Butir Soal', icon: BarChart3 },
      { id: 'SETTINGS', label: 'Cloud Supabase', icon: Database },
    ];

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <ToastBanner />

        {/* HEADER PORTAL GURU */}
        <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base leading-tight">Portal Guru — {SCHOOL_NAME}</h1>
                <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  {supabaseConfig.connected ? (
                    cloudSyncStatus === 'needs_sql' ? (
                      '⚠ Supabase terhubung (Jalankan SQL Bagian 4 untuk sync soal)'
                    ) : (
                      <>
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            autoRefreshLive ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
                          }`}
                        />
                        <span>
                          {autoRefreshLive ? 'Live Auto-Refresh (10d) Aktif' : 'Terhubung ke Supabase Cloud'}
                          {lastSyncedTime ? ` • Update: ${lastSyncedTime}` : ''}
                        </span>
                      </>
                    )
                  ) : (
                    '● Tersimpan Lokal di Browser (Hubungkan Supabase untuk Cloud)'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPortalMode('STUDENT');
                  setStep('TOKEN');
                }}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Pratinjau Portal Siswa</span>
                <span className="sm:hidden">Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeacherPass('');
                  setPortalMode('STUDENT');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Keluar Portal Guru"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-800/80 border-t border-slate-700/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = teacherTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTeacherTab(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-2 transition ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* KPI RINGKAS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Total Paket Simulasi</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{packages.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Total Bank Soal</p>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">{questions.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Pengerjaan Selesai</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{sessions.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Rata-rata Nilai</p>
              <p className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">{avgAllScore}</p>
            </div>
          </div>

          {/* ================= TAB 1: MANAJEMEN PAKET SOAL ================= */}
          {teacherTab === 'PACKAGES' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">Daftar Paket Ujian (Terpisah per Mata Pelajaran)</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Semua paket dan soal tersimpan permanen secara otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewPkgModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Buat Paket Simulasi Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => {
                  const qCount = questions.filter((q) => q.packageId === pkg.id).length;
                  const sCount = sessions.filter((s) => s.packageId === pkg.id).length;
                  const isMtk = pkg.subject === 'Matematika';
                  return (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                              isMtk ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {isMtk ? <Calculator className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                            {pkg.subject}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePackageActive(pkg)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                              pkg.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {pkg.isActive ? '● Aktif' : '○ Nonaktif'}
                          </button>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">{pkg.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Durasi {pkg.durationMinutes} menit • {qCount} Butir Soal • {sCount} Peserta Selesai
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">Token Masuk Siswa:</span>
                          <span className="font-mono font-black text-base tracking-widest text-indigo-700">
                            {pkg.token}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setAdminPkgId(pkg.id);
                            setTeacherTab('QUESTIONS');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition"
                        >
                          Kelola Soal ({qCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdminPkgId(pkg.id);
                            setTeacherTab('ANALYSIS');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition"
                        >
                          Analisis ({sCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'package', id: pkg.id, label: pkg.title })}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Paket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: BANK SOAL & WACANA ================= */}
          {teacherTab === 'QUESTIONS' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-xs font-bold uppercase text-slate-500">Paket Aktif:</label>
                  <select
                    value={adminPkgId}
                    onChange={(e) => setAdminPkgId(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-sm text-slate-800 bg-white outline-none focus:border-indigo-500"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.token})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Template CSV
                  </button>
                  <label className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Import CSV
                    <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowStimulusModal(true)}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Wacana
                  </button>
                  <button
                    type="button"
                    onClick={openNewQuestionModal}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Soal Baru
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBankSubTab('LIST')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    bankSubTab === 'LIST' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  Daftar Soal ({pkgQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBankSubTab('STIMULI')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    bankSubTab === 'STIMULI' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  Wacana / Stimulus Bersama ({pkgStimuli.length})
                </button>
              </div>

              {bankSubTab === 'LIST' ? (
                <div className="space-y-3">
                  {pkgQuestions.length === 0 && (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                      Belum ada soal di paket ini. Klik <strong>Tambah Soal Baru</strong> atau <strong>Import CSV</strong>.
                    </div>
                  )}
                  {pkgQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-bold text-xs">
                            No. {idx + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs">
                            {q.type}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-xs">
                            {q.topic}
                          </span>
                          <span className="text-xs text-slate-400">Bobot: {q.weight}</span>
                          {q.stimulusId && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                              Tertaut Wacana
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-800">{q.questionText}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditQuestionModal(q)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({ type: 'question', id: q.id, label: `Soal No. ${idx + 1}` })
                          }
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {pkgStimuli.length === 0 && (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                      Belum ada wacana bersama di paket ini.
                    </div>
                  )}
                  {pkgStimuli.map((st) => (
                    <div key={st.id} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-amber-950">{st.title}</h3>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'stimulus', id: st.id, label: st.title })}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-line line-clamp-4">{st.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: REKAP NILAI SISWA ================= */}
          {teacherTab === 'RESULTS' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {supabaseConfig.connected && (
                    <>
                      <button
                        type="button"
                        onClick={() => setAutoRefreshLive((prev) => !prev)}
                        className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition ${
                          autoRefreshLive
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                        title="Otomatis menyegarkan nilai siswa setiap 10 detik"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            autoRefreshLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        Live 10d: {autoRefreshLive ? 'ON' : 'OFF'}
                      </button>
                      <button
                        type="button"
                        onClick={() => refreshSessionsFromSupabase(supabaseConfig, false)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Muat Terbaru
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleExportResultsCsv}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Download Excel (.csv)
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="p-4">No</th>
                        <th className="p-4">Nama Siswa</th>
                        <th className="p-4">Kelas</th>
                        <th className="p-4">Tgl Lahir</th>
                        <th className="p-4">Waktu Selesai</th>
                        <th className="p-4 text-right">Nilai (0-100)</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pkgSessions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            Belum ada data peserta untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        pkgSessions
                          .slice()
                          .sort((a, b) => b.scoreTotal - a.scoreTotal)
                          .map((s, idx) => (
                            <tr key={s.id} className="hover:bg-slate-50/70">
                              <td className="p-4 font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-4 font-bold text-slate-900">{s.studentName}</td>
                              <td className="p-4 font-semibold text-slate-600">{s.studentClass}</td>
                              <td className="p-4 text-slate-500">{s.birthDate}</td>
                              <td className="p-4 text-xs font-mono text-slate-500">{s.finishedAt}</td>
                              <td className="p-4 text-right font-black text-base text-indigo-700">{s.scoreTotal}</td>
                              <td className="p-4 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    s.scoreTotal >= 75
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : s.scoreTotal >= 55
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {s.scoreTotal >= 75 ? 'Tuntas' : s.scoreTotal >= 55 ? 'Cukup' : 'Pendalaman'}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: ANALISIS BUTIR SOAL ================= */}
          {teacherTab === 'ANALYSIS' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase text-slate-500">Pilih Paket:</label>
                  <select
                    value={adminPkgId}
                    onChange={(e) => setAdminPkgId(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border-2 border-slate-200 font-bold text-sm bg-white"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl">
                  Dihitung otomatis dari {itemAnalysisData.totalParticipants} peserta selesai (Skor Parsial)
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 text-base">
                  Pemetaan Ketuntasan Topik / Materi ({activeAdminPkg?.subject})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {itemAnalysisData.topicSummary.map((t) => (
                    <div key={t.topic} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-800">
                          {t.topic} ({t.questionCount} soal)
                        </span>
                        <span
                          className={
                            t.percent >= 75
                              ? 'text-emerald-700'
                              : t.percent >= 50
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }
                        >
                          {t.percent}% — {t.percent >= 75 ? 'Tuntas' : t.percent >= 50 ? 'Cukup' : 'Perlu Pendalaman'}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.percent >= 75 ? 'bg-emerald-500' : t.percent >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${t.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Analisis Butir Soal (Tingkat Kesukaran P, Daya Pembeda D, &amp; Pengecoh)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    P = Rata-rata skor / bobot maksimal • D = Selisih capaian 27% Kelompok Atas dan 27% Kelompok Bawah.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="p-4">No</th>
                        <th className="p-4">Topik &amp; Tipe</th>
                        <th className="p-4 text-center">Tingkat Kesukaran (P)</th>
                        <th className="p-4 text-center">Daya Pembeda (D)</th>
                        <th className="p-4">Sebaran Jawaban (Khusus PG)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itemAnalysisData.items.map((row) => (
                        <tr key={row.question.id} className="hover:bg-slate-50/70">
                          <td className="p-4 font-black text-slate-700">#{row.number}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{row.question.topic}</p>
                            <p className="text-xs text-slate-500">{row.question.type}</p>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-mono font-bold mr-2">{row.pValue.toFixed(2)}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${row.pColor}`}>
                              {row.pLabel}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-mono font-bold mr-2">{row.dValue.toFixed(2)}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${row.dColor}`}>
                              {row.dLabel}
                            </span>
                          </td>
                          <td className="p-4">
                            {row.distractorStats ? (
                              <div className="flex flex-wrap gap-1.5">
                                {row.distractorStats.map((d) => (
                                  <span
                                    key={d.id}
                                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border ${
                                      d.isKey
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                        : d.pct < 5
                                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {d.id}: {d.pct}%{d.isKey ? ' ✓' : ''}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Tipe Non-PG (Skor Parsial)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: PENGATURAN CLOUD SUPABASE ================= */}
          {teacherTab === 'SETTINGS' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg">Koneksi &amp; Sinkronisasi Penuh Supabase Cloud</h2>
                  <p className="text-xs text-slate-500">
                    Menyimpan Paket, Wacana, Bank Soal, dan Rekap Nilai siswa secara permanen di Cloud.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Supabase Project URL</label>
                  <input
                    type="url"
                    value={supabaseConfig.url}
                    onChange={(e) => {
                      setSupabaseConfig({ ...supabaseConfig, url: e.target.value, connected: false });
                      setSupabaseTestError('');
                    }}
                    placeholder="https://xxxxxxxxxxxx.supabase.co"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Supabase Publishable / Anon Public Key
                  </label>
                  <input
                    type="password"
                    value={supabaseConfig.anonKey}
                    onChange={(e) => {
                      setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value, connected: false });
                      setSupabaseTestError('');
                    }}
                    placeholder="sb_publishable_... atau eyJhbGciOiJIUzI1NiIs..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                {supabaseConfig.connected && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Koneksi aktif ke: {supabaseConfig.url}</span>
                  </div>
                )}

                {cloudSyncStatus === 'needs_sql' && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-semibold">
                    Tabel sinkronisasi soal (<code>tka_packages</code> &amp; <code>tka_questions</code>) belum dibuat. Jalankan skrip <strong>Bagian 4</strong> dari file <code>skema_database_supabase.md</code> di SQL Editor Supabase, lalu klik tombol <strong>Unggah Semua Data ke Cloud</strong> di bawah.
                  </div>
                )}

                {supabaseTestError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{supabaseTestError}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const cleanUrl = supabaseConfig.url.trim().replace(/\/$/, '');
                      const cleanKey = supabaseConfig.anonKey.trim();
                      setSupabaseTestError('');
                      if (!cleanUrl || !cleanKey) {
                        showToast('Isi URL dan Key Supabase terlebih dahulu.', 'error');
                        return;
                      }
                      try {
                        const res = await fetch(`${cleanUrl}/rest/v1/tka_packages?select=id&limit=1`, {
                          headers: buildSupabaseHeaders(cleanKey),
                        });
                        if (res.ok) {
                          const nextConfig = { url: cleanUrl, anonKey: cleanKey, connected: true };
                          setSupabaseConfig(nextConfig);
                          saveLocalJson(STORAGE_KEYS.supabase, nextConfig);
                          setCloudSyncStatus('synced');
                          showToast('Berhasil terhubung ke Supabase Cloud! Memuat data...');
                          await loadAllFromSupabase(nextConfig, true);
                        } else {
                          const errData = await res.json().catch(() => ({}));
                          const detail = errData.message || errData.error_description || res.statusText || 'Akses ditolak';
                          if (res.status === 404 || String(detail).includes('does not exist')) {
                            setCloudSyncStatus('needs_sql');
                          }
                          setSupabaseTestError(`Kode ${res.status}: ${detail}`);
                          showToast(`Koneksi ditolak (${res.status}). Lihat detail di atas tombol.`, 'error');
                        }
                      } catch {
                        setSupabaseTestError('Gagal menghubungi server. Pastikan Project URL diawali https:// dan berakhiran .supabase.co');
                        showToast('Gagal menghubungi server Supabase.', 'error');
                      }
                    }}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Uji &amp; Simpan Koneksi
                  </button>

                  {supabaseConfig.connected && (
                    <>
                      <button
                        type="button"
                        onClick={() => pushAllLocalToSupabase(supabaseConfig)}
                        className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 transition"
                      >
                        <Upload className="w-4 h-4" />
                        Unggah Semua Data ke Cloud
                      </button>
                      <button
                        type="button"
                        onClick={() => loadAllFromSupabase(supabaseConfig, false)}
                        className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center gap-2 transition"
                      >
                        <Download className="w-4 h-4" />
                        Muat dari Cloud
                      </button>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1.5">
                  <p className="font-extrabold">Penting untuk Ujian 200 Chromebook Siswa (Real-Time):</p>
                  <p>
                    Agar semua Chromebook siswa otomatis memuat soal terbaru dan langsung mengirim nilai secara{' '}
                    <strong>real-time</strong> ke layar Guru tanpa perlu login/setting di perangkat siswa, isikan{' '}
                    <strong>URL</strong> dan <strong>Anon Key</strong> Supabase kamu pada baris{' '}
                    <code>DEFAULT_SUPABASE_URL</code> dan <code>DEFAULT_SUPABASE_ANON_KEY</code> di bagian atas file{' '}
                    <code>src/App.jsx</code> (GitHub), lalu klik <strong>Commit changes</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ================= MODAL BUAT PAKET BARU ================= */}
        {showNewPkgModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreatePackage}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-lg">Buat Paket Simulasi Baru</h3>
                <button type="button" onClick={() => setShowNewPkgModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Judul Paket Ujian</label>
                <input
                  type="text"
                  required
                  value={newPkgForm.title}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, title: e.target.value })}
                  placeholder="Contoh: Simulasi TKA 2 — Matematika"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mata Pelajaran</label>
                  <select
                    value={newPkgForm.subject}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm bg-white"
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newPkgForm.durationMinutes}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Token Ujian (Kosongkan untuk otomatis)</label>
                <input
                  type="text"
                  value={newPkgForm.token}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, token: e.target.value.toUpperCase() })}
                  placeholder="Contoh: MTK6SD2"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-mono uppercase"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPkgModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= MODAL TAMBAH / EDIT SOAL ================= */}
        {showQuestionModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <form
              onSubmit={handleSaveQuestion}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {editingQuestionId ? 'Edit Butir Soal' : 'Tambah Soal Baru'} ({activeAdminPkg?.subject})
                </h3>
                <button type="button" onClick={() => setShowQuestionModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Tipe Soal</label>
                    <select
                      value={qForm.type}
                      onChange={(e) => setQForm({ ...qForm, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                    >
                      <option value="PG">Pilihan Ganda</option>
                      <option value="PG_KOMPLEKS">PG Kompleks (Centang)</option>
                      <option value="BENAR_SALAH">Benar / Salah</option>
                      <option value="MENJODOHKAN">Menjodohkan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Topik / Materi</label>
                    <input
                      type="text"
                      required
                      value={qForm.topic}
                      onChange={(e) => setQForm({ ...qForm, topic: e.target.value })}
                      placeholder="Misal: Pecahan / Ide Pokok"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Tautkan Wacana (Opsional)</label>
                    <select
                      value={qForm.stimulusId}
                      onChange={(e) => setQForm({ ...qForm, stimulusId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">Tanpa Wacana</option>
                      {pkgStimuli.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Teks Pertanyaan</label>
                  <textarea
                    rows={3}
                    required
                    value={qForm.questionText}
                    onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                    placeholder="Ketik pertanyaan soal di sini..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                {(qForm.type === 'PG' || qForm.type === 'PG_KOMPLEKS') && (
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-700">
                      {qForm.type === 'PG'
                        ? 'Opsi Jawaban (Pilih 1 Kunci Benar):'
                        : 'Opsi Pernyataan (Centang semua Kunci Benar):'}
                    </p>
                    {qForm.pgOptions.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        {qForm.type === 'PG' ? (
                          <input
                            type="radio"
                            name="pgKey"
                            checked={qForm.pgCorrect === opt.id}
                            onChange={() => setQForm({ ...qForm, pgCorrect: opt.id })}
                            className="w-4 h-4 accent-indigo-600"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={qForm.pgKompleksCorrect.includes(opt.id)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...qForm.pgKompleksCorrect, opt.id]
                                : qForm.pgKompleksCorrect.filter((id) => id !== opt.id);
                              setQForm({ ...qForm, pgKompleksCorrect: next });
                            }}
                            className="w-4 h-4 accent-indigo-600"
                          />
                        )}
                        <span className="font-bold text-xs w-5">{opt.id}.</span>
                        <input
                          type="text"
                          required
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...qForm.pgOptions];
                            updated[idx] = { ...opt, text: e.target.value };
                            setQForm({ ...qForm, pgOptions: updated });
                          }}
                          placeholder={`Isi pilihan ${opt.id}`}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {qForm.type === 'BENAR_SALAH' && (
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700">Daftar Pernyataan &amp; Kunci:</p>
                      <button
                        type="button"
                        onClick={() =>
                          setQForm({
                            ...qForm,
                            bsStatements: [
                              ...qForm.bsStatements,
                              { id: `p${qForm.bsStatements.length + 1}`, text: '', answer: true },
                            ],
                          })
                        }
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        + Tambah Baris
                      </button>
                    </div>
                    {qForm.bsStatements.map((st, idx) => (
                      <div key={st.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={st.text}
                          onChange={(e) => {
                            const next = [...qForm.bsStatements];
                            next[idx] = { ...st, text: e.target.value };
                            setQForm({ ...qForm, bsStatements: next });
                          }}
                          placeholder={`Pernyataan ${idx + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <select
                          value={st.answer ? 'true' : 'false'}
                          onChange={(e) => {
                            const next = [...qForm.bsStatements];
                            next[idx] = { ...st, answer: e.target.value === 'true' };
                            setQForm({ ...qForm, bsStatements: next });
                          }}
                          className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                        >
                          <option value="true">Benar</option>
                          <option value="false">Salah</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {qForm.type === 'MENJODOHKAN' && (
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-700">Pasangan Kolom Kiri &amp; Jawaban Benar Kolom Kanan:</p>
                    {qForm.matchPairs.map((mp, idx) => (
                      <div key={mp.id} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={mp.leftText}
                          onChange={(e) => {
                            const next = [...qForm.matchPairs];
                            next[idx] = { ...mp, leftText: e.target.value };
                            setQForm({ ...qForm, matchPairs: next });
                          }}
                          placeholder={`Kiri ${idx + 1}`}
                          className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          required
                          value={mp.rightText}
                          onChange={(e) => {
                            const next = [...qForm.matchPairs];
                            next[idx] = { ...mp, rightText: e.target.value };
                            setQForm({ ...qForm, matchPairs: next });
                          }}
                          placeholder={`Pasangan Benar ${idx + 1}`}
                          className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Pembahasan Langkah demi Langkah</label>
                  <textarea
                    rows={2}
                    value={qForm.explanation}
                    onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                    placeholder="Jelaskan cara mendapatkan jawaban yang benar agar siswa langsung paham..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= MODAL TAMBAH WACANA ================= */}
        {showStimulusModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateStimulus}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-lg">Tambah Wacana / Teks Bacaan Bersama</h3>
                <button type="button" onClick={() => setShowStimulusModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Judul Wacana</label>
                <input
                  type="text"
                  required
                  value={stimForm.title}
                  onChange={(e) => setStimForm({ ...stimForm, title: e.target.value })}
                  placeholder="Contoh: Petualangan di Taman Nasional Komodo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Isi Teks Bacaan</label>
                <textarea
                  rows={6}
                  required
                  value={stimForm.content}
                  onChange={(e) => setStimForm({ ...stimForm, content: e.target.value })}
                  placeholder="Ketik atau tempel paragraf bacaan di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowStimulusModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm"
                >
                  Simpan Wacana
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= MODAL KONFIRMASI HAPUS ================= */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Hapus Data?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Anda yakin ingin menghapus <strong>{deleteTarget.label}</strong>?
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // VIEW C: PORTAL SISWA — LAYAR 1 (MASUK TOKEN)
  // ==========================================================================
  if (step === 'TOKEN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4 relative">
        <ToastBanner />

        <button
          type="button"
          onClick={() => setPortalMode('TEACHER_LOGIN')}
          className="fixed top-4 right-4 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 shadow-sm text-xs font-bold flex items-center gap-1.5 transition"
        >
          <ShieldCheck className="w-4 h-4" />
          Portal Guru
        </button>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Portal Simulasi TKA</h1>
            <p className="text-white font-extrabold text-sm tracking-wide mt-1">{SCHOOL_NAME}</p>
            <p className="text-sky-100 text-xs mt-1">Kelas 6 • Matematika &amp; Bahasa Indonesia</p>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleTokenSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Masukkan Token Ujian</label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => {
                      setTokenInput(e.target.value.toUpperCase());
                      setTokenError('');
                    }}
                    placeholder="Masukkan token dari guru..."
                    className="w-full pl-11 pr-4 py-3.5 text-lg font-bold tracking-widest uppercase border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition"
                  />
                </div>
                {tokenError && (
                  <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{tokenError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-sky-200 transition flex items-center justify-center gap-2"
              >
                Lanjut ke Data Siswa
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-6 text-center">
          {SCHOOL_NAME} • Tanpa akun/password siswa • Hasil &amp; Pembahasan Langsung Tampil
        </p>
      </div>
    );
  }

  // ==========================================================================
  // VIEW C: PORTAL SISWA — LAYAR 2 (IDENTITAS)
  // ==========================================================================
  if (step === 'IDENTITY' && selectedPackage) {
    const isMtk = selectedPackage.subject === 'Matematika';
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div
            className={`p-6 text-white ${
              isMtk ? 'bg-gradient-to-r from-indigo-600 to-sky-600' : 'bg-gradient-to-r from-teal-600 to-emerald-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                Token: {selectedPackage.token}
              </span>
              <button
                type="button"
                onClick={() => setStep('TOKEN')}
                className="text-xs text-white/90 hover:text-white underline"
              >
                Ganti Mata Uji
              </button>
            </div>
            <h2 className="text-xl font-bold mt-3">{selectedPackage.title}</h2>
            <p className="text-white/90 text-sm mt-0.5">
              {activeQuestions.length} Soal {selectedPackage.subject} • Durasi {selectedPackage.durationMinutes} Menit
            </p>
          </div>

          <form onSubmit={handleStartExam} className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap Siswa</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={student.name}
                  onChange={(e) => {
                    setStudent({ ...student, name: e.target.value });
                    setIdentityError('');
                  }}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kelas</label>
                <select
                  value={student.className}
                  onChange={(e) => setStudent({ ...student, className: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 bg-white font-medium"
                >
                  <option value="6A">Kelas 6A</option>
                  <option value="6B">Kelas 6B</option>
                  <option value="6C">Kelas 6C</option>
                  <option value="6D">Kelas 6D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Lahir</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={student.birthDate}
                    onChange={(e) => {
                      setStudent({ ...student, birthDate: e.target.value });
                      setIdentityError('');
                    }}
                    className="w-full pl-11 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {identityError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {identityError}
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                Mulai Ujian Sekarang
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW C: PORTAL SISWA — LAYAR 3 (PENGERJAAN UJIAN CBT)
  // ==========================================================================
  if (step === 'EXAM' && selectedPackage && activeQuestions.length > 0) {
    const q = activeQuestions[currentIdx];
    const stimulus = q.stimulusId ? stimuli.find((s) => s.id === q.stimulusId) : null;
    const currentAnswer = answers[q.id];
    const isFlagged = Boolean(flagged[q.id]);

    const answeredCount = activeQuestions.filter((item) => isQuestionAnswered(item, answers[item.id])).length;
    const flaggedCount = activeQuestions.filter((item) => flagged[item.id]).length;
    const unansweredCount = activeQuestions.length - answeredCount;

    const typeLabels = {
      PG: 'Pilihan Ganda',
      PG_KOMPLEKS: 'Pilihan Ganda Kompleks',
      BENAR_SALAH: 'Benar / Salah',
      MENJODOHKAN: 'Menjodohkan',
    };

    const handleToggleMulti = (optionId) => {
      const prevArr = Array.isArray(currentAnswer) ? currentAnswer : [];
      updateAnswer(
        q.id,
        prevArr.includes(optionId) ? prevArr.filter((id) => id !== optionId) : [...prevArr, optionId]
      );
    };

    const handleTrueFalse = (statementId, val) => {
      const prevObj = typeof currentAnswer === 'object' && !Array.isArray(currentAnswer) ? currentAnswer : {};
      updateAnswer(q.id, { ...prevObj, [statementId]: val });
    };

    const handleMatchRightClick = (rightId) => {
      if (!activeMatchLeft) return;
      const prevObj = typeof currentAnswer === 'object' && !Array.isArray(currentAnswer) ? currentAnswer : {};
      const cleaned = { ...prevObj };
      Object.keys(cleaned).forEach((k) => {
        if (cleaned[k] === rightId) delete cleaned[k];
      });
      cleaned[activeMatchLeft] = rightId;
      updateAnswer(q.id, cleaned);
      setActiveMatchLeft(null);
    };

    const matchBadgeColors = [
      'bg-sky-100 text-sky-800 border-sky-300',
      'bg-purple-100 text-purple-800 border-purple-300',
      'bg-emerald-100 text-emerald-800 border-emerald-300',
    ];

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 ${
                  selectedPackage.subject === 'Matematika' ? 'bg-indigo-600' : 'bg-teal-600'
                }`}
              >
                {selectedPackage.subject === 'Matematika' ? <Calculator className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm sm:text-base truncate">{student.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  Kelas {student.className} • {selectedPackage.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden md:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                <Type className="w-4 h-4 text-slate-500 ml-2 mr-1" />
                {[
                  { id: 'sm', label: 'A-' },
                  { id: 'md', label: 'A' },
                  { id: 'lg', label: 'A+' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontSize(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      fontSize === f.id ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono font-bold text-sm sm:text-base border ${
                  timeLeft <= 300 ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowNavDrawer(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>
                  {answeredCount}/{activeQuestions.length}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-sm">
                  Soal No. {q.number}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {typeLabels[q.type]}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <Save className="w-3.5 h-3.5" />
                {lastSavedAt ? `Tersimpan (${lastSavedAt})` : 'Auto-save aktif'}
              </div>
            </div>

            {stimulus && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Wacana / Stimulus: {stimulus.title}</span>
                </div>
                {stimulus.type === 'chart' ? (
                  <div>
                    <p className={`text-slate-700 ${fontClasses[fontSize]}`}>{stimulus.content}</p>
                    <HarvestBarChartSVG />
                  </div>
                ) : (
                  <div className={`space-y-3 text-slate-800 whitespace-pre-line text-justify ${fontClasses[fontSize]}`}>
                    {stimulus.content}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm flex-1">
              {q.hasGeometrySvg && <GeometryFigureSVG />}
              <p className={`font-medium text-slate-800 mb-6 ${fontClasses[fontSize]}`}>{q.questionText}</p>

              {q.type === 'PG' && (
                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const selected = currentAnswer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateAnswer(q.id, opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-start gap-3.5 ${
                          selected
                            ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-200'
                            : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            selected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className={`pt-0.5 text-slate-800 ${fontClasses[fontSize]}`}>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === 'PG_KOMPLEKS' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-lg mb-1">
                    Centang semua pernyataan yang benar (bisa lebih dari satu).
                  </p>
                  {q.options.map((opt) => {
                    const selectedArr = Array.isArray(currentAnswer) ? currentAnswer : [];
                    const checked = selectedArr.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleMulti(opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-start gap-3.5 ${
                          checked ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                            checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {checked && <Check className="w-4 h-4 stroke-[3]" />}
                        </span>
                        <span className={`text-slate-800 ${fontClasses[fontSize]}`}>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === 'BENAR_SALAH' && (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs sm:text-sm font-bold text-slate-700">
                        <th className="p-4">Pernyataan</th>
                        <th className="p-4 text-center w-24">Benar</th>
                        <th className="p-4 text-center w-24">Salah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {q.options.map((stmt) => {
                        const val = currentAnswer ? currentAnswer[stmt.id] : undefined;
                        return (
                          <tr key={stmt.id}>
                            <td className={`p-4 text-slate-800 ${fontClasses[fontSize]}`}>{stmt.text}</td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleTrueFalse(stmt.id, true)}
                                className={`w-11 h-11 rounded-xl border-2 font-bold text-sm inline-flex items-center justify-center ${
                                  val === true ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-slate-500'
                                }`}
                              >
                                {val === true ? <Check className="w-5 h-5 stroke-[3]" /> : 'B'}
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleTrueFalse(stmt.id, false)}
                                className={`w-11 h-11 rounded-xl border-2 font-bold text-sm inline-flex items-center justify-center ${
                                  val === false ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 text-slate-500'
                                }`}
                              >
                                {val === false ? <X className="w-5 h-5 stroke-[3]" /> : 'S'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {q.type === 'MENJODOHKAN' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-sky-900">
                    <span className="flex items-center gap-2 font-medium">
                      <Link2 className="w-4 h-4 text-sky-600 shrink-0" />
                      Klik 1 kotak di <strong>Kolom Kiri</strong>, lalu klik pasangannya di <strong>Kolom Kanan</strong>.
                    </span>
                    {currentAnswer && Object.keys(currentAnswer).length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateAnswer(q.id, {})}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Reset Pasangan
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase text-slate-500">Kolom Kiri</p>
                      {q.options.left.map((item, idx) => {
                        const pairedRightId = currentAnswer ? currentAnswer[item.id] : null;
                        const isSelected = activeMatchLeft === item.id;
                        const badgeStyle = matchBadgeColors[idx % matchBadgeColors.length];
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveMatchLeft(item.id)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-200'
                                : pairedRightId
                                ? 'border-emerald-300 bg-emerald-50/40'
                                : 'border-slate-200 hover:border-sky-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeStyle}`}>
                                {idx + 1}
                              </span>
                              <span className={`font-medium text-slate-800 ${fontClasses[fontSize]}`}>{item.text}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Kolom Kanan {activeMatchLeft ? '(Klik pasangan sekarang!)' : ''}
                      </p>
                      {q.options.right.map((item) => {
                        const pairedLeftIdx = q.options.left.findIndex(
                          (l) => currentAnswer && currentAnswer[l.id] === item.id
                        );
                        const isPaired = pairedLeftIdx !== -1;
                        const badgeStyle = isPaired ? matchBadgeColors[pairedLeftIdx % matchBadgeColors.length] : '';
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleMatchRightClick(item.id)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                              activeMatchLeft
                                ? 'border-sky-400 border-dashed hover:bg-sky-50 cursor-pointer'
                                : isPaired
                                ? 'border-emerald-300 bg-emerald-50/40'
                                : 'border-slate-200'
                            }`}
                          >
                            <span className={`font-medium text-slate-800 ${fontClasses[fontSize]}`}>{item.text}</span>
                            {isPaired && (
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${badgeStyle}`}>
                                Pasangan #{pairedLeftIdx + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="px-4 py-3 rounded-xl border border-slate-200 font-semibold text-sm text-slate-700 disabled:opacity-40 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>

              <button
                type="button"
                onClick={() => setFlagged((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 flex items-center gap-2 ${
                  isFlagged ? 'bg-amber-400 border-amber-500 text-amber-950' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <Flag className="w-4 h-4" />
                {isFlagged ? 'Ditandai Ragu-ragu' : 'Ragu-ragu'}
              </button>

              {currentIdx < activeQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => Math.min(activeQuestions.length - 1, i + 1))}
                  className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center gap-1.5"
                >
                  Selanjutnya <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFinishModal(true)}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Selesai Ujian
                </button>
              )}
            </div>
          </div>

          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-slate-800">Daftar Nomor Soal</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terjawab {answeredCount} dari {activeQuestions.length} soal
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {activeQuestions.map((item, idx) => {
                  const isDone = isQuestionAnswered(item, answers[item.id]);
                  const isYellow = Boolean(flagged[item.id]);
                  let btnColor = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (isYellow) btnColor = 'bg-amber-400 text-amber-950 border-amber-500';
                  else if (isDone) btnColor = 'bg-emerald-500 text-white border-emerald-600';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-11 rounded-xl font-bold text-sm border transition ${btnColor} ${
                        idx === currentIdx ? 'ring-2 ring-sky-500 ring-offset-2' : ''
                      }`}
                    >
                      {item.number}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setShowFinishModal(true)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Selesai &amp; Lihat Nilai
              </button>
            </div>
          </aside>
        </main>

        {showNavDrawer && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex justify-end lg:hidden">
            <div className="w-80 max-w-[85vw] bg-white h-full p-5 flex flex-col justify-between overflow-y-auto shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-800">Nomor Soal</h3>
                  <button type="button" onClick={() => setShowNavDrawer(false)} className="p-2 rounded-lg bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {activeQuestions.map((item, idx) => {
                    const isDone = isQuestionAnswered(item, answers[item.id]);
                    const isYellow = Boolean(flagged[item.id]);
                    let btnColor = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (isYellow) btnColor = 'bg-amber-400 text-amber-950 border-amber-500';
                    else if (isDone) btnColor = 'bg-emerald-500 text-white border-emerald-600';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCurrentIdx(idx);
                          setShowNavDrawer(false);
                        }}
                        className={`h-12 rounded-xl font-bold border ${btnColor}`}
                      >
                        {item.number}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNavDrawer(false);
                  setShowFinishModal(true);
                }}
                className="w-full mt-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl"
              >
                Selesai &amp; Lihat Nilai
              </button>
            </div>
          </div>
        )}

        {showFinishModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Akhiri Simulasi Ujian?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Nilai dan pembahasan lengkap akan langsung tampil setelah kamu selesai.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <p className="text-2xl font-extrabold text-emerald-700">{answeredCount}</p>
                  <p className="text-xs font-medium text-emerald-800">Terjawab</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <p className="text-2xl font-extrabold text-amber-700">{flaggedCount}</p>
                  <p className="text-xs font-medium text-amber-800">Ragu-ragu</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-2xl">
                  <p className="text-2xl font-extrabold text-slate-700">{unansweredCount}</p>
                  <p className="text-xs font-medium text-slate-600">Kosong</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 font-bold text-slate-700"
                >
                  Periksa Lagi
                </button>
                <button
                  type="button"
                  onClick={finishExamAndRecord}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Ya, Selesai!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // VIEW C: PORTAL SISWA — LAYAR 4 (HASIL & PEMBAHASAN LANGSUNG TAMPIL)
  // ==========================================================================
  const filteredDetails = studentResults.details.filter((d) =>
    reviewFilter === 'NEED_REVIEW' ? d.status !== 'correct' : true
  );
  const isMtkResult = selectedPackage?.subject === 'Matematika';

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div
            className={`p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isMtkResult ? 'bg-gradient-to-r from-indigo-600 to-sky-600' : 'bg-gradient-to-r from-teal-600 to-emerald-600'
            }`}
          >
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Award className="w-4 h-4" /> Nilai Tercatat Otomatis di Rekap Guru
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Hebat, {student.name}!</h1>
              <p className="text-white/90 text-sm mt-1">
                {SCHOOL_NAME} • Kelas {student.className} • {selectedPackage?.title}
              </p>
            </div>
            <div className="bg-white text-slate-900 rounded-3xl px-8 py-5 text-center shadow-xl min-w-[180px]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nilai {selectedPackage?.subject}</p>
              <p className={`text-5xl font-black mt-1 ${isMtkResult ? 'text-indigo-600' : 'text-teal-600'}`}>
                {studentResults.scoreTotal}
              </p>
              <p className="text-xs text-slate-500 mt-1">Skala 0 – 100</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700">Benar Penuh</p>
                <p className="text-3xl font-black text-emerald-900 mt-1">{studentResults.countCorrect}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold text-amber-700">Skor Parsial</p>
                <p className="text-3xl font-black text-amber-900 mt-1">{studentResults.countPartial}</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                <p className="text-xs font-bold text-rose-700">Salah / Kosong</p>
                <p className="text-3xl font-black text-rose-900 mt-1">{studentResults.countWrong}</p>
              </div>
            </div>

            <div className="flex justify-end items-center pt-2">
              <button
                type="button"
                onClick={handleRestartStudent}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Kembali &amp; Pilih Mata Pelajaran Lain
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-sky-600" />
              Pembahasan Lengkap ({selectedPackage?.subject})
            </h2>
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400 mr-1" />
              {[
                { id: 'ALL', label: `Semua (${activeQuestions.length})` },
                { id: 'NEED_REVIEW', label: 'Perlu Dipelajari' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReviewFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    reviewFilter === tab.id ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredDetails.map(({ question: q, userAnswer, score, maxScore, status, formulaNote }) => {
            const statusBadge = {
              correct: { text: 'Benar Penuh', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              partial: { text: 'Benar Sebagian (Parsial)', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
              wrong: { text: 'Belum Tepat', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
              unanswered: { text: 'Tidak Dijawab', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
            }[status];

            const formatAnswerSummary = (isKey) => {
              const target = isKey ? q.correctAnswer : userAnswer;
              if (
                target === undefined ||
                target === null ||
                (Array.isArray(target) && target.length === 0) ||
                (typeof target === 'object' && !Array.isArray(target) && Object.keys(target).length === 0)
              ) {
                return <span className="italic text-slate-400">Tidak dijawab</span>;
              }
              if (q.type === 'PG') {
                const found = q.options.find((o) => o.id === target);
                return found ? `${found.id}. ${found.text}` : target;
              }
              if (q.type === 'PG_KOMPLEKS') {
                return (
                  <ul className="list-disc pl-5 space-y-1">
                    {target.map((id) => {
                      const found = q.options.find((o) => o.id === id);
                      return <li key={id}>{found ? found.text : id}</li>;
                    })}
                  </ul>
                );
              }
              if (q.type === 'BENAR_SALAH') {
                return (
                  <ul className="space-y-1">
                    {q.options.map((stmt, i) => (
                      <li key={stmt.id}>
                        Pernyataan {i + 1}: <strong>{target[stmt.id] === true ? 'Benar' : target[stmt.id] === false ? 'Salah' : 'Kosong'}</strong>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (q.type === 'MENJODOHKAN') {
                return (
                  <ul className="space-y-1">
                    {q.options.left.map((l) => {
                      const rObj = q.options.right.find((r) => r.id === target[l.id]);
                      return (
                        <li key={l.id}>
                          {l.text} → <strong>{rObj ? rObj.text : '(Kosong)'}</strong>
                        </li>
                      );
                    })}
                  </ul>
                );
              }
              return null;
            };

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Soal #{q.number}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {q.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge.cls}`}>
                      {statusBadge.text}
                    </span>
                    <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                      Skor: {score.toFixed(2)} / {maxScore.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">{q.questionText}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold uppercase text-slate-500 mb-1.5">Jawaban Kamu</p>
                    <div className="text-slate-800">{formatAnswerSummary(false)}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <p className="text-xs font-bold uppercase text-emerald-700 mb-1.5">Kunci Jawaban</p>
                    <div className="text-emerald-950">{formatAnswerSummary(true)}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200/80 space-y-1.5">
                  <p className="text-xs font-bold text-sky-900 uppercase">Pembahasan Langkah demi Langkah</p>
                  <p className="text-sm text-slate-800 whitespace-pre-line">{q.explanation}</p>
                  <p className="text-xs font-mono text-sky-800 pt-2 border-t border-sky-200/60">{formulaNote}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
