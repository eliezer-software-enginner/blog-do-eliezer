import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST() {
  try {
    // Força revalidação completa
    revalidatePath('/');
    revalidatePath('/api/posts');
    revalidateTag('posts');
    revalidateTag('homepage');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache force-cleaned successfully',
      revalidated: ['/', '/api/posts', 'posts', 'homepage']
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Force cache clear error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}