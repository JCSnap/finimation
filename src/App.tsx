import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Layout } from './components/Layout'
import { registry } from './registry'

export default function App() {
  const first = registry[0]

  return (
    <HashRouter>
      <Layout>
        <Routes>
          {registry.map((mod) => (
            <Route
              key={mod.meta.id}
              path={`/${mod.meta.id}`}
              element={<ModuleView mod={mod} />}
            />
          ))}
          {first && <Route path="*" element={<Navigate to={`/${first.meta.id}`} replace />} />}
          {!first && (
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center h-full text-gray-400">
                  No modules registered yet.
                </div>
              }
            />
          )}
        </Routes>
      </Layout>
    </HashRouter>
  )
}

function ModuleView({ mod }: { mod: (typeof registry)[number] }) {
  const Component = mod.component
  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-96 min-w-80 h-full overflow-y-auto border-r border-gray-200 bg-white px-6 py-6 prose prose-sm max-w-none">
        <NotesPanel notes={mod.notes} />
      </div>
      <div className="flex-1 h-full overflow-y-auto px-6 py-6">
        <Component />
      </div>
    </div>
  )
}

function NotesPanel({ notes }: { notes: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
      {notes}
    </ReactMarkdown>
  )
}
