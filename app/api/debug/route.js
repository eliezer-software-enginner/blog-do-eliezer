import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { serverDb } from '@/lib/firebase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar diferentes coleções possíveis
    const collections = [
      'apps/meu-blog/posts',
      'posts',
      'blog/posts',
      'meu-blog/posts'
    ];
    
    const results = {};
    
    for (const collectionPath of collections) {
      try {
        const postsCollection = collection(serverDb, collectionPath);
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        const postSnapshot = await getDocs(q);
        
        const posts = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || 'Sem título',
          slug: doc.data().slug || 'Sem slug',
          ...doc.data(),
        }));
        
        // Procurar pelo post "Vagas sendo canceladas"
        const targetPost = posts.find(p => 
          p.title && p.title.toLowerCase().includes('vagas sendo canceladas')
        );
        
        results[collectionPath] = {
          total: posts.length,
          hasTargetPost: !!targetPost,
          targetPost: targetPost || null,
          postTitles: posts.map(p => p.title)
        };
        
      } catch (error) {
        results[collectionPath] = {
          error: error.message,
          total: 0
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      collections: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro na API de debug:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
