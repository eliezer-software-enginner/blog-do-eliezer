// /app/post/[slug]/page.jsx
import { query, collection, where, getDocs } from 'firebase/firestore';
import { FIREBASE_COLLECTIONS } from '@/lib/collections';
import Link from 'next/link';
import { serverDb } from '../../../lib/firebase-server';
import { ArticleViewer } from '../../components/ui/ArticleViewer/ArticleViewer';
import styles from './page.module.css';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const postsQuery = query(collection(serverDb, FIREBASE_COLLECTIONS.POSTS), where('slug', '==', slug));
    const querySnapshot = await getDocs(postsQuery);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const post = { id: doc.id, ...doc.data() };

      const description = post.content 
        ? post.content.replace(/[#*`\[\]]/g, '').substring(0, 160) + '...'
        : 'Leia este artigo no Blog do Eliezer';

      return {
        title: post.title,
        description: description,
        keywords: ['blog', 'programação', 'web', 'desenvolvimento', post.title],
        openGraph: {
          title: post.title,
          description: description,
          type: 'article',
          publishedTime: post.createdAt?.toDate?.() || new Date(),
          authors: [post.authorName || 'Blog do Eliezer'],
          images: [
            {
              url: '/og-image.jpg',
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: post.title,
          description: description,
          images: ['/og-image.jpg'],
        },
      };
    }
  } catch (error) {
    console.error('Erro ao gerar metadados:', error);
  }

  return {
    title: 'Post não encontrado',
    description: 'O conteúdo que você procura não existe ou foi removido.',
  };
}

// Server-side data fetching
async function getPost(slug) {
  try {
    const postsQuery = query(collection(serverDb, FIREBASE_COLLECTIONS.POSTS), where('slug', '==', slug));
    const querySnapshot = await getDocs(postsQuery);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className={styles.error}>
        <h1 className={styles.errorTitle}>Post não encontrado</h1>
        <p>O conteúdo que você procura não existe ou foi removido.</p>
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
          ← Voltar para Home
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Link 
        href="/" 
        className={styles.backLink}
      >
        <span className={styles.arrow}>←</span> 
        Voltar para Home
      </Link>
      
      <article>
        <header className={styles.header}>
          <div className={styles.meta}>
            <time className={styles.date}>
              {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('pt-BR', { dateStyle: 'long' }) : 'Data desconhecida'}
            </time>
            {post.authorName && (
              <span className={styles.author}>
                por <strong>{post.authorName}</strong>
              </span>
            )}
          </div>
          <h1 className={styles.title}>
            {post.title}
          </h1>
        </header>
        
        <ArticleViewer content={post.content} />
      </article>
    </div>
  );
}