import { getQuotes } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(getQuotes());
}

export async function POST() {
  return NextResponse.json({ error: 'Use GitHub to add quotes' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Use GitHub to update quotes' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Use GitHub to delete quotes' }, { status: 405 });
}