import { getReadings } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  const allReadings = getReadings();
  return NextResponse.json({
    data: allReadings,
    totalCount: allReadings.length,
    hasMore: false
  });
}

export async function POST() {
  return NextResponse.json({ error: 'Use GitHub to add readings' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Use GitHub to update readings' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Use GitHub to delete readings' }, { status: 405 });
}