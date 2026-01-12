// /app/api/posts/route.js - Cache para posts
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { serverDb } from '@/lib/firebase-server';
import { FIREBASE_COLLECTIONS } from '@/lib/collections';
import { NextResponse } from 'next/server';

// Cache de 5 minutos para API de posts
export const revalidate = 300;

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
    });

  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar posts' },
      { status: 500 }
    );
  }
}