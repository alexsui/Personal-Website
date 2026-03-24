import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadFile, StorageBucket } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const bucket = formData.get('bucket') as StorageBucket;
  const pathPrefix = formData.get('path') as string;
  const files = formData.getAll('files') as File[];

  if (!bucket || !files.length) {
    return NextResponse.json(
      { error: 'Missing bucket or files' },
      { status: 400 }
    );
  }

  const validBuckets: StorageBucket[] = ['gallery', 'covers', 'profile'];
  if (!validBuckets.includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
  }

  const results: Array<{ filename: string; url: string; storagePath: string }> = [];
  const errors: Array<{ filename: string; error: string }> = [];

  for (const file of files) {
    try {
      const storagePath = pathPrefix
        ? `${pathPrefix}/${file.name}`
        : file.name;

      const url = await uploadFile(bucket, storagePath, file);
      results.push({ filename: file.name, url, storagePath });
    } catch (err) {
      errors.push({
        filename: file.name,
        error: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  }

  return NextResponse.json({ results, errors });
}
