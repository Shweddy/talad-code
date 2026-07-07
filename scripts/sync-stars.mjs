/**
 * sync-stars.mjs
 * ─────────────────────────────────────────────────────────────
 * ดึงจำนวนดาว (stargazers) ของทุก repo ที่ปรากฏใน content/issues/*.md
 * แล้วเขียนลง src/data/stars.json — รันโดย GitHub Actions ทุกวัน
 *
 * ทำไมทำแบบนี้: เว็บเป็น static ทั้งหมด ไม่ต้องเรียก GitHub API
 * ตอน runtime เลย → ไม่ติด rate limit, โหลดเร็ว, ฟรี
 *
 * รันเอง:  GITHUB_TOKEN=ghp_xxx node scripts/sync-stars.mjs
 * (ไม่ใส่ token ก็ได้ แต่ rate limit เหลือ 60 ครั้ง/ชม.)
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ISSUES_DIR = 'content/issues';
const OUT_FILE = 'src/data/stars.json';
const TOKEN = process.env.GITHUB_TOKEN;

// ── 1. รวบรวม repo slug ทั้งหมดจาก frontmatter ──────────────
async function collectRepos() {
  const repos = new Set();
  const files = await readdir(ISSUES_DIR);
  for (const file of files.filter((f) => f.endsWith('.md'))) {
    const text = await readFile(path.join(ISSUES_DIR, file), 'utf8');
    // จับบรรทัด `repo: owner/name` ใน frontmatter — ง่ายและพอเพียง
    for (const m of text.matchAll(/^\s*repo:\s*([\w.-]+\/[\w.-]+)\s*$/gm)) {
      repos.add(m[1]);
    }
  }
  return [...repos];
}

// ── 2. ดึงดาวทีละ repo (มี retry + สุภาพกับ API) ─────────────
async function fetchStars(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'taladcode-star-sync',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (res.status === 404) {
    console.warn(`⚠ ไม่พบ repo: ${repo} (อาจถูกลบหรือเปลี่ยนชื่อ)`);
    return null;
  }
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} สำหรับ ${repo}`);
  }
  const data = await res.json();
  return {
    stars: data.stargazers_count,
    archived: data.archived,
    fullName: data.full_name, // ชื่อจริงหลัง redirect ถ้า repo ย้าย
  };
}

// ── 3. main ──────────────────────────────────────────────────
const repos = await collectRepos();
console.log(`พบ ${repos.length} repo ที่ต้องอัปเดต`);

// อ่านข้อมูลเก่าไว้เป็น fallback ถ้าดึงบาง repo ไม่สำเร็จ
let previous = {};
try {
  previous = JSON.parse(await readFile(OUT_FILE, 'utf8')).repos ?? {};
} catch {
  /* ยังไม่มีไฟล์เก่า — ไม่เป็นไร */
}

const result = {};
for (const repo of repos) {
  try {
    const info = await fetchStars(repo);
    if (info) {
      result[repo] = info;
      console.log(`✦ ${repo} → ★ ${info.stars.toLocaleString()}`);
    } else if (previous[repo]) {
      result[repo] = previous[repo]; // repo หาย ใช้ค่าเดิมไปก่อน
    }
  } catch (err) {
    console.warn(`⚠ ${repo}: ${err.message} — ใช้ค่าเดิม`);
    if (previous[repo]) result[repo] = previous[repo];
  }
  // เว้นจังหวะเล็กน้อย ไม่ยิงรัว
  await new Promise((r) => setTimeout(r, 200));
}

await mkdir(path.dirname(OUT_FILE), { recursive: true });
await writeFile(
  OUT_FILE,
  JSON.stringify({ updatedAt: new Date().toISOString(), repos: result }, null, 2) + '\n'
);
console.log(`✅ เขียน ${OUT_FILE} เรียบร้อย (${Object.keys(result).length} repo)`);
