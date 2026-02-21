import { Link } from 'react-router-dom'
import { registry } from '../registry'
import type { ModuleMeta } from '../types/module'

function groupByCategory(modules: { meta: ModuleMeta }[]) {
  return modules.reduce<Record<string, ModuleMeta[]>>((acc, mod) => {
    const category = mod.meta.category
    if (!acc[category]) acc[category] = []
    acc[category].push(mod.meta)
    return acc
  }, {})
}

export function HomePage() {
  const grouped = groupByCategory(registry)
  const totalModules = registry.length
  const totalCategories = Object.keys(grouped).length

  return (
    <div className="home-shell">
      <section className="home-hero">
        <p className="home-kicker">finimation</p>
        <h1>Explore Interactive Finance Concepts</h1>
        <p>
          Learn by changing assumptions and watching the math react in real time.
          Pick a section below to start with core intuition, then move into advanced labs.
        </p>
        <div className="home-stats">
          <span>{totalCategories} sections</span>
          <span>{totalModules} interactive modules</span>
        </div>
      </section>

      <section className="home-grid">
        {Object.entries(grouped).map(([category, modules]) => (
          <article key={category} className="home-card">
            <h2>{category}</h2>
            <p>{modules.length} module{modules.length > 1 ? 's' : ''}</p>
            <ul>
              {modules.map((mod) => (
                <li key={mod.id}>
                  <Link to={`/${mod.id}`}>{mod.title}</Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}
