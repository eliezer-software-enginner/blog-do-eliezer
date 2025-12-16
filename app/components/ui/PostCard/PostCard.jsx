import styles from './PostCard.module.css';

/**
 * Componente de UI Card reutilizável.
 * 
 * @param {object} props
 * @param {string} props.title - Título do post
 * @param {string} props.content - Resumo do conteúdo
 * @param {Date | string | number} props.date - Data do post
 * @param {string} [props.author] - Nome do autor
 * @param {React.ElementType} [props.as] - Componente de Link (ex: 'a', Link do Next.js). Default: 'a'
 * @param {object} [props.rest] - Outras props passadas para o componente Link (href, to, onClick, etc)
 */
export const PostCard = ({ 
  title, 
  content, 
  date,
  author,
  as: Component = 'a', 
  ...rest 
}) => {
  const formattedDate = new Date(date).toLocaleDateString('pt-BR', { dateStyle: 'long' });

  return (
    <Component className={styles.cardLink} {...rest}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 className={styles.cardTitle}>
            {title}
          </h3>
          <div className={styles.meta}>
            <time>{formattedDate}</time>
            {author && <span className={styles.author}>por {author}</span>}
          </div>
        </div>
        <p className={styles.cardContent}>
          {content}
        </p>
        <div className={styles.readMore}>
          Ler mais <span className={styles.arrow}>→</span>
        </div>
      </div>
    </Component>
  );
};
