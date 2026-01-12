// /app/admin/migrate/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { migratePostsWithSlugs } from '../../../scripts/migrate-slugs';
import styles from './page.module.css';

export default function MigratePage() {
  const { user, loading } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  // Proteger rota
  if (loading) {
    return <div style={{ color: 'var(--foreground)', textAlign: 'center', marginTop: '4rem' }}>Carregando...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleMigrate = async () => {
    setIsMigrating(true);
    setResult(null);

    try {
      // Importar e executar a migração
      const { migratePostsWithSlugs } = await import('../../../scripts/migrate-slugs');
      
      // Simular a migração (na prática, isso precisaria ser adaptado para client-side)
      // Por enquanto, vamos criar uma versão client-side simplificada
      const result = await clientSideMigrate();
      setResult(result);
      
    } catch (error) {
      console.error('Erro na migração:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // Versão client-side da migração (simplificada)
  const clientSideMigrate = async () => {
    try {
      const response = await fetch('/api/migrate-slugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro na migração');
      }

      return {
        success: true,
        ...data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          Migração de Slugs
        </h1>
        
        <div className={styles.description}>
          <p>
            Esta ferramenta adiciona slugs (URLs amigáveis) aos posts existentes que ainda não possuem.
            Os slugs são gerados automaticamente a partir dos títulos dos posts.
          </p>
          <p className={styles.warning}>
            ⚠️ Execute esta migração apenas uma vez. Posts com slugs existentes não serão alterados.
          </p>
        </div>

        <button
          onClick={handleMigrate}
          disabled={isMigrating}
          className={styles.button}
        >
          {isMigrating ? (
            <span>
              <span className={styles.spinner} />
              Migrando posts...
            </span>
          ) : (
            'Iniciar Migração'
          )}
        </button>

        {result && (
          <div className={`${styles.result} ${result.success ? styles.success : styles.error}`}>
            <h3>
              {result.success ? '✅ Migração Concluída' : '❌ Erro na Migração'}
            </h3>
            {result.success ? (
              <div>
                <p>📝 Posts migrados: {result.migrated || 0}</p>
                <p>⏭️ Posts pulados: {result.skipped || 0}</p>
                {result.migrated > 0 && (
                  <p className={styles.note}>
                    Agora todos os seus posts têm URLs amigáveis!
                  </p>
                )}
              </div>
            ) : (
              <p>Erro: {result.error}</p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button
            onClick={() => router.push('/')}
            className={styles.backButton}
          >
            ← Voltar para Home
          </button>
          <button
            onClick={() => router.push('/create')}
            className={styles.createButton}
          >
            Criar Novo Post
          </button>
        </div>
      </div>
    </div>
  );
}