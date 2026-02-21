import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotesPanel } from './components/NotesPanel'
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
    <div className="module-view">
      <div className="module-notes-column">
        <NotesPanel title={mod.meta.title} description={mod.meta.description} notes={mod.notes} />
      </div>
      <div className="module-visual-column">
        <Component />
      </div>
    </div>
  )
}
