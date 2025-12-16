'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, logOut } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Blog do Eliezer
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          
          {user ? (
            <>
              <Link href="/create" className={styles.navLink}>
                Criar Post
              </Link>
              <button 
                onClick={logOut} 
                className={styles.navLink} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Sair
              </button>
              {/* Optional: User Avatar */}
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--primary)' }}
                />
              )}
            </>
          ) : (
            <Link href="/login" className={styles.navLink} style={{ color: 'var(--primary)' }}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
