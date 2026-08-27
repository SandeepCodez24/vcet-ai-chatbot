import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './Markdown.module.css'

/* Only override what needs it: links (force safe target/rel) and tables (need a
   horizontally-scrollable wrapper). Everything else is styled via plain element
   selectors scoped under .markdown in Markdown.module.css. */
const components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className={styles.tableWrap}>
      <table>{children}</table>
    </div>
  ),
}

/** Renders bot message content as GitHub-flavored markdown (tables, lists, code, etc.). */
const Markdown = ({ children }) => (
  <div className={styles.markdown}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  </div>
)

export default Markdown
