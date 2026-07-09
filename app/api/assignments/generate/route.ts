import { NextRequest, NextResponse } from 'next/server';
import {
  AssignmentGenerateRequest,
  AssignmentResponse,
} from '@/types/assignments';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssignmentGenerateRequest;
    
    // Forward request to Express backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/assignments/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[POST /api/assignments/generate] Backend error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate assignment' },
        { status: response.status }
      );
    }

    const data: AssignmentResponse = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[POST /api/assignments/generate] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
