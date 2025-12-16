// /app/create/page.js
'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { useAuth } from '../context/AuthContext';
import styles from './page.module.css';

export default function CreatePostPage() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Protect Route
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Por favor, preencha o título e o conteúdo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const postsCollection = collection(db, 'posts');
      await addDoc(postsCollection, {
        title,
        content,
        createdAt: serverTimestamp(),
        authorId: user.uid,
        authorName: user.displayName,
      });

      router.push('/');
    } catch (error) {
      console.error('Erro ao adicionar documento: ', error);
      alert('Ocorreu um erro ao criar o post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
     return <div style={{ color: 'var(--foreground)', textAlign: 'center', marginTop: '4rem' }}>Carregando...</div>;
  }

  if (!user) return null; // Avoid flicker before redirect

  return (
    <div className={styles.wrapper}>
      <Link 
        href="/" 
        className={styles.backLink}
      >
        <span className={styles.arrow}>←</span> 
        Voltar para a lista
      </Link>
      
      <div className={styles.card}>
        <h1 className={styles.title}>
          Criar Novo Post
        </h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              Título
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
              className={styles.input}
              placeholder="Digite um título cativante..."
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="content" className={styles.label}>
                Conteúdo
              </label>
              <span className={styles.badge}>Markdown Suportado</span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              required
              rows={12}
              className={styles.textarea}
              placeholder="# Meu Subtítulo&#10;&#10;Escreva seu texto aqui..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.button}
          >
            {isSubmitting ? (
              <span>
                <span className={styles.spinner} />
                Publicando...
              </span>
            ) : (
              'Publicar Post'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
