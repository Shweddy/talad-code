import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * สคีมาของ "ฉบับ" (issue) แต่ละเดือน
 * ไฟล์อยู่ที่ content/issues/NNN.md — หนึ่งไฟล์ต่อหนึ่งฉบับ
 * อาสาสมัครแก้แค่ frontmatter + เนื้อหา Markdown แล้วส่ง PR
 */
const projectSchema = z.object({
  name: z.string(),                       // ชื่อโปรเจกต์ เช่น "PyThaiNLP"
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'ต้องเป็นรูปแบบ owner/repo'),
  category: z.enum([
    'Python',
    'JavaScript',
    'TypeScript',
    'Go',
    'Rust',
    'AI-LLM',
    'Mobile',
    'DevOps',
    'DevTools',
    'เกม-กราฟิก',
    'อื่นๆ',
  ]),
  level: z.enum(['มือใหม่', 'กลาง', 'สูง']).default('กลาง'),
  thaiMade: z.boolean().default(false),   // ผลงานคนไทย → ติดป้ายพิเศษ
  description: z.string().max(280),       // คำอธิบายสั้น ภาษาไทย
  why: z.string().max(280),               // "ทำไมต้องลอง" — จุดขายหนึ่งประโยค
  website: z.string().url().optional(),
});

const issues = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/issues' }),
  schema: z.object({
    issue: z.number().int().positive(),   // เลขฉบับ เช่น 12
    title: z.string(),                    // ชื่อฉบับ เช่น "ฉบับที่ 12 — AI ภาษาไทยมาแรง"
    date: z.coerce.date(),                // วันตีพิมพ์
    editors: z.array(z.string()).default([]), // GitHub username ของอาสาสมัครประจำฉบับ
    projects: z.array(projectSchema).min(1),
    draft: z.boolean().default(false),
  }),
});

export const collections = { issues };
