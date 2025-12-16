import ReactMarkdown from 'react-markdown';
import styles from './ArticleViewer.module.css';

/**
 * Componente para renderizar conteúdo Markdown com estilos padrão.
 * 
 * @param {object} props
 * @param {string} props.content - String contendo Markdown
 */
export const ArticleViewer = ({ content }) => {
  return (
    <div className={styles.content}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};
