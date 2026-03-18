import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Calculation } from '@/entities/Calculation';

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);

    const calculations = await repo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return NextResponse.json({ history: calculations });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
