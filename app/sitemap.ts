import { collection, getDocs } from 'firebase/firestore';
import { serverDb } from '@/lib/firebase-server';
import { FIREBASE_COLLECTIONS } from '@/lib/collections';

// Revalidar sitemap a cada 6 horas
export const revalidate = 21600;

export default async function sitemap() {
  const postsCollection = collection(serverDb, FIREBASE_COLLECTIONS.POSTS);
  const postSnapshot = await getDocs(postsCollection);
  
  const posts = postSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      slug: data.slug,
      createdAt: data.createdAt,
    };
  });

  const baseUrl = 'https://blog-do-eliezer.vercel.app';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic post pages
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/post/${post.slug || post.id}`,
    lastModified: post.createdAt?.toDate?.() || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}