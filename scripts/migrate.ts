/**
 * Data migration script: migrates all existing content from the filesystem
 * into Supabase (posts, collections, photos, profile, about_sections).
 *
 * Run: npx tsx scripts/migrate.ts
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

/* ---------- env ---------- */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ROOT = path.resolve(__dirname, '..');

/* ---------- helpers ---------- */
function contentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return map[ext] ?? 'application/octet-stream';
}

/* ---------- 1. Blog Posts ---------- */
async function migratePosts() {
  console.log('\n=== Migrating blog posts ===');
  const postsDir = path.join(ROOT, 'content', 'posts');
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    try {
      // Idempotent check
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (existing) {
        console.log(`  [skip] post "${slug}" already exists`);
        continue;
      }

      const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8');
      const { data: fm, content } = matter(raw);

      const { error } = await supabase.from('posts').insert({
        slug,
        title: fm.title ?? slug,
        date: fm.date ?? new Date().toISOString().slice(0, 10),
        summary: fm.summary ?? '',
        content: content.trim(),
        tags: fm.tags ?? [],
        cover_url: fm.cover_url ?? null,
        draft: fm.draft ?? false,
      });

      if (error) throw error;
      console.log(`  [ok] post "${slug}"`);
    } catch (err: any) {
      console.error(`  [err] post "${slug}": ${err.message ?? err}`);
    }
  }
}

/* ---------- 2. Gallery Collections ---------- */
async function migrateCollections(): Promise<
  Map<string, { id: string; cover: string | null }>
> {
  console.log('\n=== Migrating gallery collections ===');
  const galleryDir = path.join(ROOT, 'content', 'gallery');
  const files = fs.readdirSync(galleryDir).filter((f) => f.endsWith('.md'));
  const result = new Map<string, { id: string; cover: string | null }>();

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    try {
      const raw = fs.readFileSync(path.join(galleryDir, file), 'utf-8');
      const { data: fm, content } = matter(raw);

      // Idempotent check
      const { data: existing } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        console.log(`  [skip] collection "${slug}" already exists`);
        result.set(slug, { id: existing.id, cover: fm.cover ?? null });
        continue;
      }

      const { data: inserted, error } = await supabase
        .from('collections')
        .insert({
          slug,
          title: fm.title ?? slug,
          date: fm.date ?? new Date().toISOString().slice(0, 10),
          end_date: fm.endDate ?? null,
          location: fm.location ?? '',
          description: content.trim(),
        })
        .select('id')
        .single();

      if (error) throw error;
      console.log(`  [ok] collection "${slug}" (id=${inserted.id})`);
      result.set(slug, { id: inserted.id, cover: fm.cover ?? null });
    } catch (err: any) {
      console.error(`  [err] collection "${slug}": ${err.message ?? err}`);
    }
  }

  return result;
}

/* ---------- 3. Collection Photos ---------- */
async function migrateCollectionPhotos(
  collections: Map<string, { id: string; cover: string | null }>,
) {
  console.log('\n=== Migrating collection photos ===');

  for (const [slug, { id: collectionId, cover }] of collections) {
    const imgDir = path.join(ROOT, 'public', 'images', 'gallery', slug);
    if (!fs.existsSync(imgDir)) {
      console.log(`  [skip] no image dir for "${slug}"`);
      continue;
    }

    const images = fs
      .readdirSync(imgDir)
      .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
      .sort();

    let coverPhotoId: string | null = null;

    for (let i = 0; i < images.length; i++) {
      const filename = images[i];
      const storagePath = `collections/${slug}/${filename}`;
      const filePath = path.join(imgDir, filename);

      try {
        // Check if photo row already exists
        const { data: existingPhoto } = await supabase
          .from('photos')
          .select('id')
          .eq('storage_path', storagePath)
          .maybeSingle();

        let photoId: string;

        if (existingPhoto) {
          console.log(`  [skip] photo "${storagePath}" already exists`);
          photoId = existingPhoto.id;
        } else {
          // Upload to storage
          const fileBuffer = fs.readFileSync(filePath);
          const { error: uploadErr } = await supabase.storage
            .from('gallery')
            .upload(storagePath, fileBuffer, {
              contentType: contentType(filename),
              upsert: true,
            });
          if (uploadErr) throw uploadErr;

          // Insert photo row
          const { data: photoRow, error: insertErr } = await supabase
            .from('photos')
            .insert({
              collection_id: collectionId,
              storage_path: storagePath,
              filename,
              sort_order: i,
            })
            .select('id')
            .single();
          if (insertErr) throw insertErr;
          photoId = photoRow.id;
          console.log(`  [ok] photo "${storagePath}"`);
        }

        // Determine cover photo
        if (cover && filename === cover) {
          coverPhotoId = photoId;
        } else if (!cover && i === 0) {
          coverPhotoId = photoId;
        }
      } catch (err: any) {
        console.error(
          `  [err] photo "${storagePath}": ${err.message ?? err}`,
        );
      }
    }

    // Update collection cover_photo_id
    if (coverPhotoId) {
      const { error } = await supabase
        .from('collections')
        .update({ cover_photo_id: coverPhotoId })
        .eq('id', collectionId);
      if (error) {
        console.error(
          `  [err] setting cover for "${slug}": ${error.message}`,
        );
      } else {
        console.log(`  [ok] set cover for "${slug}"`);
      }
    }
  }
}

/* ---------- 4. Moment Photos ---------- */
async function migrateMomentPhotos() {
  console.log('\n=== Migrating moment photos ===');
  const momentsDir = path.join(ROOT, 'public', 'images', 'gallery', 'moments');
  if (!fs.existsSync(momentsDir)) {
    console.log('  [skip] moments directory not found');
    return;
  }

  const images = fs
    .readdirSync(momentsDir)
    .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
    .sort();

  for (let i = 0; i < images.length; i++) {
    const filename = images[i];
    const storagePath = `moments/${filename}`;
    const filePath = path.join(momentsDir, filename);

    try {
      // Idempotent check
      const { data: existing } = await supabase
        .from('photos')
        .select('id')
        .eq('storage_path', storagePath)
        .maybeSingle();

      if (existing) {
        console.log(`  [skip] moment "${storagePath}" already exists`);
        continue;
      }

      // Upload
      const fileBuffer = fs.readFileSync(filePath);
      const { error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(storagePath, fileBuffer, {
          contentType: contentType(filename),
          upsert: true,
        });
      if (uploadErr) throw uploadErr;

      // Insert
      const { error: insertErr } = await supabase.from('photos').insert({
        collection_id: null,
        storage_path: storagePath,
        filename,
        sort_order: i,
      });
      if (insertErr) throw insertErr;
      console.log(`  [ok] moment "${storagePath}"`);
    } catch (err: any) {
      console.error(
        `  [err] moment "${storagePath}": ${err.message ?? err}`,
      );
    }
  }
}

/* ---------- 5. Profile ---------- */
async function migrateProfile() {
  console.log('\n=== Migrating profile ===');

  try {
    // Idempotent check
    const { data: existing } = await supabase
      .from('profile')
      .select('id')
      .maybeSingle();

    if (existing) {
      console.log('  [skip] profile already exists');
      return;
    }

    // Upload profile photo
    const profileImgPath = path.join(ROOT, 'public', 'images', 'profile.jpg');
    if (fs.existsSync(profileImgPath)) {
      const buf = fs.readFileSync(profileImgPath);
      const { error: uploadErr } = await supabase.storage
        .from('profile')
        .upload('profile.jpg', buf, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      if (uploadErr) {
        console.error(`  [warn] profile photo upload: ${uploadErr.message}`);
      } else {
        console.log('  [ok] uploaded profile.jpg');
      }
    }

    // Get public URL for photo
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile').getPublicUrl('profile.jpg');

    const { error } = await supabase.from('profile').insert({
      name: 'Samuel Toh',
      bio: 'Dedicated to building AI products that make life easier.',
      photo_url: publicUrl,
      email: 'alexsui122@gmail.com',
      social: {
        github: 'https://github.com/alexsui',
        linkedin:
          'https://www.linkedin.com/in/samuel-toh-1510031a1/',
      },
      cta: { label: 'About me', href: '/about' },
      highlights: [
        {
          text: 'Built 3+ production AI agents, driving first paying customers at Tenfold AI',
        },
        {
          text: 'Published in IEEE TKDE',
          url: 'https://ieeexplore.ieee.org/document/11048721',
          label: 'IEEE TKDE',
        },
        {
          text: 'AWS Certified Developer — Associate',
          url: 'https://www.credly.com/badges/bec746af-8370-46eb-883d-517a2b227fb0/public_url',
          label: 'Credly',
        },
      ],
    });

    if (error) throw error;
    console.log('  [ok] profile inserted');
  } catch (err: any) {
    console.error(`  [err] profile: ${err.message ?? err}`);
  }
}

/* ---------- 6. About Sections ---------- */
async function migrateAboutSections() {
  console.log('\n=== Migrating about sections ===');

  // We check idempotency by counting existing rows.
  const { count } = await supabase
    .from('about_sections')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log(`  [skip] about_sections already has ${count} rows`);
    return;
  }

  const rows: Array<{
    type: string;
    title: string;
    subtitle?: string | null;
    date_start?: string | null;
    date_end?: string | null;
    url?: string | null;
    content: Record<string, any>;
    sort_order: number;
  }> = [];

  let order = 0;

  /* --- Skills (type: skill_group) --- */
  const skills: Record<string, string[]> = {
    'AI/LLM': [
      'RAG',
      'Prompt Engineering',
      'Context Engineering',
      'AI Agents',
      'Agent Evaluation',
    ],
    'Cloud & Infrastructure': ['AWS', 'Docker'],
    'ML/DL': ['PyTorch', 'Scikit-learn'],
    'Agent Frameworks': ['LangGraph', 'LangChain', 'LangSmith'],
    Languages: ['Python', 'SQL'],
  };

  for (const [group, items] of Object.entries(skills)) {
    rows.push({
      type: 'skill_group',
      title: group,
      subtitle: null,
      date_start: null,
      date_end: null,
      url: null,
      content: { skills: items },
      sort_order: order++,
    });
  }

  /* --- Experience --- */
  rows.push({
    type: 'experience',
    title: 'Tenfold AI',
    subtitle: 'AI / LLM Engineer',
    date_start: 'Apr 2025',
    date_end: 'Present',
    url: 'https://tenfoldai.io/',
    content: {
      location: 'Taipei, Taiwan',
      bullets: [
        "Led development of 3+ production AI agents (Agentic RAG, multi-turn conversational AI, document review workflow), driving the acquisition of the company's first paying customers",
        'Established end-to-end LLM evaluation pipeline: offline testing with LLM-generated QA datasets and LLM-as-a-Judge, improving RAG answer accuracy from 0.65 to 0.80; online production monitoring via LangSmith reducing error rate from 5% to <1%',
        'Applied Deep Agent architecture and Context Engineering across production agents with dynamic tool-call limits; combined with prompt caching to reduce API costs by 60-75%',
        'Built purpose-built AWS infrastructure for AI agents with CDK: automated multi-jurisdiction data pipelines and agent file system, enabling agents to autonomously operate on uploaded documents',
      ],
    },
    sort_order: order++,
  });

  rows.push({
    type: 'experience',
    title: 'E.SUN Bank',
    subtitle: 'Machine Learning Research Intern',
    date_start: 'Oct 2022',
    date_end: 'Aug 2023',
    url: 'https://www.esunbank.com/zh-tw/about',
    content: {
      location: 'Taipei, Taiwan',
      bullets: [
        'Researched Self-Supervised Learning for feature extraction on structured financial time series data (10M+ transaction records)',
        'Designed SSL approaches combining denoising autoencoder with contrastive learning, achieving 91% improvement in feature utilization and 10% boost in downstream model performance',
        'Delivered two research presentations on findings',
      ],
    },
    sort_order: order++,
  });

  /* --- Education --- */
  rows.push({
    type: 'education',
    title: 'National Yang Ming Chiao Tung University',
    subtitle: 'M.S. in Information Management and Finance - Data Science Track',
    date_start: 'Sep 2022',
    date_end: 'Jul 2024',
    url: 'https://www.nycu.edu.tw/nycu/en/index',
    content: {
      gpa: '4.27 / 4.3',
      bullets: [
        'Academic Excellence Award Recipient',
        'Coursework: Machine Learning, Deep Learning, Data Mining, NLP',
      ],
    },
    sort_order: order++,
  });

  rows.push({
    type: 'education',
    title: 'National Cheng Kung University',
    subtitle: 'B.S. in Transportation and Communication Management Science',
    date_start: 'Sep 2018',
    date_end: 'Jun 2022',
    url: 'https://web.ncku.edu.tw/index.php?Lang=en',
    content: {
      gpa: '3.3 / 4.3',
      bullets: [],
    },
    sort_order: order++,
  });

  /* --- Publications --- */
  rows.push({
    type: 'publication',
    title:
      'FairCDSR: Fairness-Aware Cross-Domain Sequential Recommendation via Multi-Interest Transfer and Contrastive Learning',
    subtitle:
      'IEEE Transactions on Knowledge and Data Engineering (TKDE) | JCR Q1 | Impact Factor: 10.4',
    date_start: null,
    date_end: null,
    url: 'https://ieeexplore.ieee.org/document/11048721',
    content: {
      bullets: [
        'Achieved 10% improvement in recommendation accuracy using Transformer-based cross-domain modeling',
        'Reduced demographic bias by 70% through novel transfer and contrastive learning techniques',
      ],
    },
    sort_order: order++,
  });

  /* --- Achievements --- */
  const achievements = [
    'Phi Tau Phi Scholastic Honor Society Member (Top 3% academic performance)',
    'AI CUP 2023 Honorable Mention: Top 10% (16th/150 teams) in Multimodal Pathological Voice Classification',
    'AWS Certified Developer -- Associate (Jan 2026)',
  ];

  for (const ach of achievements) {
    rows.push({
      type: 'achievement',
      title: ach,
      subtitle: null,
      date_start: null,
      date_end: null,
      url: null,
      content: {},
      sort_order: order++,
    });
  }

  /* --- Interests --- */
  rows.push({
    type: 'interest',
    title: 'Photography',
    subtitle: null,
    date_start: null,
    date_end: null,
    url: null,
    content: {
      description:
        'I enjoy capturing natural scenery, street life, and people — finding beauty in everyday moments.',
    },
    sort_order: order++,
  });

  // Insert all rows
  const { error } = await supabase.from('about_sections').insert(rows);
  if (error) {
    console.error(`  [err] about_sections: ${error.message}`);
  } else {
    console.log(`  [ok] inserted ${rows.length} about_sections rows`);
  }
}

/* ---------- Verify ---------- */
async function verifyCounts() {
  console.log('\n=== Verification ===');
  const tables = ['posts', 'collections', 'photos', 'profile', 'about_sections'];
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`  ${table}: error - ${error.message}`);
    } else {
      console.log(`  ${table}: ${count} rows`);
    }
  }
}

/* ---------- Main ---------- */
async function main() {
  console.log('Starting migration...');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Root dir: ${ROOT}`);

  await migratePosts();
  const collections = await migrateCollections();
  await migrateCollectionPhotos(collections);
  await migrateMomentPhotos();
  await migrateProfile();
  await migrateAboutSections();
  await verifyCounts();

  console.log('\nMigration complete!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
