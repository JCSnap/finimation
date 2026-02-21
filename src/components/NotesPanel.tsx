import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface NotesPanelProps {
  title: string
  description: string
  notes: string
}

export function NotesPanel({ title, description, notes }: NotesPanelProps) {
  return (
    <section className="notes-pane">
      <div className="notes-card">
        <header className="notes-header">
          <p className="notes-eyebrow">Study Notes</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </header>
        <article className="note-article">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              table: ({ children }) => (
                <div className="notes-table-wrap">
                  <table>{children}</table>
                </div>
              ),
              pre: ({ children }) => <pre className="notes-code-block">{children}</pre>,
            }}
          >
            {notes}
          </ReactMarkdown>
        </article>
      </div>
    </section>
  )
}
