'use client';

import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import img from '@/app/assets/user_4.png';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { PostCard } from './components/ui/PostCard/PostCard';
import styles from './page.module.css';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        const postSnapshot = await getDocs(q);

        const postsList = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar posts: ', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.profileWrapper}>
          <Image
            src={img}
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
        {loading ? (
          <div className={styles.grid}>
            {/* Loading Skeleton Mockup */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: '16rem',
                  borderRadius: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
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
                href={`/post/${post.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
