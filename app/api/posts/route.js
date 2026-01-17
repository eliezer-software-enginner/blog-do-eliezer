// /app/api/posts/route.js - Cache para posts
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { serverDb } from '@/lib/firebase-server';
import { FIREBASE_COLLECTIONS } from '@/lib/collections';
import { NextResponse } from 'next/server';

// Cache com tag para revalidação manual
export const revalidate = 300;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const postsCollection = collection(serverDb, FIREBASE_COLLECTIONS.POSTS);
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const postSnapshot = await getDocs(q);

    const posts = postSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: posts,
      cachedAt: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      }
    });

  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar posts' },
      { status: 500 }
    );
  }
}