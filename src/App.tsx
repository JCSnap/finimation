import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './components/HomePage'
import { NotesPanel } from './components/NotesPanel'
import { registry } from './registry'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {registry.map((mod) => (
            <Route
              key={mod.meta.id}
              path={`/${mod.meta.id}`}
              element={<ModuleView mod={mod} />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
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
