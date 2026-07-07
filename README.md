# ตลาดโค้ด 🧺

ตลาดสดโอเพนซอร์ส — เปิดแผงโปรเจกต์น่าสนใจทุกเดือน อธิบายเป็นภาษาไทย
ตลาดของชุมชน โดยชุมชน เพื่อนักพัฒนาไทย

## โครงสร้างโปรเจกต์

```
talad-code/
├── content/issues/        ← เนื้อหาแต่ละฉบับ (Markdown) — อาสาสมัครแก้ตรงนี้
│   └── 012.md
├── src/
│   ├── content.config.ts  ← สคีมา frontmatter (Zod) — build จะ fail ถ้าข้อมูลผิดรูป
│   ├── data/stars.json    ← จำนวนดาว sync อัตโนมัติทุกวัน (อย่าแก้เอง)
│   ├── layouts/           ← โครงหน้าเว็บ
│   ├── components/        ← การ์ดโปรเจกต์, ตัวคั่นพวงมาลัย
│   └── pages/             ← หน้าแรก, คู่มือมือใหม่ (/start), คลังฉบับ, หน้าแต่ละฉบับ
├── scripts/sync-stars.mjs ← สคริปต์ดึงดาวจาก GitHub API
└── .github/
    ├── workflows/
    │   ├── deploy.yml     ← build + deploy ขึ้น Cloudflare Pages เมื่อ merge เข้า main
    │   └── sync-stars.yml ← cron รายวัน อัปเดต stars.json
    └── ISSUE_TEMPLATE/
        └── submit-project.yml ← ฟอร์มให้ชุมชนส่งโปรเจกต์
```

## เริ่มพัฒนา

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # สร้างไฟล์ static ลง dist/
npm run sync-stars # ดึงจำนวนดาวล่าสุด (แนะนำใส่ GITHUB_TOKEN)
```

## วิธีตีพิมพ์ฉบับใหม่

1. สร้างไฟล์ `content/issues/013.md` (คัดลอกโครงจากฉบับก่อนได้)
2. กรอก frontmatter ตามสคีมา — ถ้าผิดรูปแบบ build จะฟ้องทันที
3. เปิด Pull Request → ทีมรีวิว → merge
4. GitHub Actions จะ build และ deploy อัตโนมัติ เสร็จใน ~2 นาที

## การรับโปรเจกต์จากชุมชน

ชุมชนส่งผ่าน GitHub Issue form (`submit-project.yml`)
→ ทีมคัดเลือกติดป้าย `คัดเลือกแล้ว`
→ บรรณาธิการประจำฉบับรวมเข้า Markdown ของฉบับถัดไป

## Infra ที่ต้องตั้งค่าครั้งแรก

| อย่าง | ที่ไหน | หมายเหตุ |
|---|---|---|
| Cloudflare Pages project | Cloudflare dashboard | ตั้งชื่อ `taladcode` (ต้องตรงกับ `--project-name` ใน deploy.yml) |
| `CLOUDFLARE_API_TOKEN` | GitHub repo → Settings → Secrets | สิทธิ์ Pages:Edit |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub repo → Settings → Secrets | ดูได้ใน Cloudflare dashboard |
| โดเมน + DNS | Cloudflare | ชี้ CNAME ไปที่ Pages |

จำนวนดาวไม่ต้องตั้งค่าอะไร — `sync-stars.yml` ใช้ `GITHUB_TOKEN`
ที่ Actions มีให้อัตโนมัติ

## License

โค้ด: MIT · เนื้อหา: CC BY-SA 4.0
