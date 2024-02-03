import { getVideoPath } from '@/lib/bilibili';
import { type NextRequest, NextResponse } from 'next/server';

export const GET = async (
  _: NextRequest,
  { params: { bvid, cid } }: { params: { bvid: string; cid: string } },
) => NextResponse.redirect(await getVideoPath(bvid, cid), 302);
