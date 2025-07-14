import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEW_API_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEW_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 