// /app/post/[id]/page.jsx
import { redirect } from 'next/navigation';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { FIREBASE_COLLECTIONS } from '@/lib/collections';
import { serverDb } from '@/lib/firebase-server';

// Server-side redirect from old ID-based URLs to new slug-based URLs
export default async function RedirectPage({ params }) {
  const { id } = await params;
  
  try {
    // Search for post by ID
    const postsQuery = query(collection(serverDb, FIREBASE_COLLECTIONS.POSTS), where('__name__', '==', id));
    const querySnapshot = await getDocs(postsQuery);

    if (!querySnapshot.empty) {
      const post = querySnapshot.docs[0].data();
      
      // If post has slug, redirect to new URL
      if (post.slug) {
        redirect(`/post/${post.slug}`);
      } else {
        // If no slug, show temporary page or redirect to home
        redirect('/');
      }
    } else {
      // Post not found, redirect to home
      redirect('/');
    }
  } catch (error) {
    console.error('Error during redirect:', error);
    redirect('/');
  }
}