// /app/page.jsx - Server-side com ISR
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { FIREBASE_COLLECTIONS } from '@/lib/collections';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { PostCard } from './components/ui/PostCard/PostCard';
import { serverDb } from '@/lib/firebase-server';

// Revalidação a cada 1 hora (3600 segundos)
export const revalidate = 3600;

async function getPosts() {
  try {
    const postsCollection = collection(serverDb, FIREBASE_COLLECTIONS.POSTS);
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const postSnapshot = await getDocs(q);

    return postSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.profileWrapper}>
          <Image
            src="/user_4.png"
            alt='Eliezer Assunção de Paulo'
            width={150}
            height={150}
            className={styles.profileImage}
            priority
          />
        </div>
        <h1 className={styles.title}>Eliezer Assunção de Paulo</h1>
        <h2 className={styles.role}>Programador Web</h2>
        <p className={styles.subtitle}>
          Compartilhando ideias, códigos e experiências no mundo do
          desenvolvimento.
        </p>
      </section>

      {/* Posts Grid */}
      <section>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhum post encontrado.</p>
            <Link href='/create' className={styles.createButton}>
              Criar o Primeiro Post
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                content={post.content || ''}
                date={
                  post.createdAt?.toDate
                    ? post.createdAt.toDate()
                    : post.createdAt || new Date()
                }
                author={post.authorName}
                as={Link}
                href={`/post/${post.slug || post.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}