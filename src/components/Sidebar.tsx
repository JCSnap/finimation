import { NavLink } from 'react-router-dom'
import { registry } from '../registry'
import type { ModuleMeta } from '../types/module'

function groupByCategory(modules: { meta: ModuleMeta }[]) {
  return modules.reduce<Record<string, ModuleMeta[]>>((acc, mod) => {
    const cat = mod.meta.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(mod.meta)
    return acc
  }, {})
}

export function Sidebar() {
  const grouped = groupByCategory(registry)

  return (
    <nav className="app-sidebar">
      <div className="sidebar-brand">
        <p className="sidebar-eyebrow">Interactive Finance Lab</p>
        <span>finimation</span>
      </div>
      <div className="sidebar-home">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
          Home
        </NavLink>
      </div>
      <div className="sidebar-groups">
        {Object.entries(grouped).map(([category, metas]) => (
          <div key={category} className="sidebar-group">
            <p>{category}</p>
            <ul>
              {metas.map((meta) => (
                <li key={meta.id}>
                  <NavLink
                    to={`/${meta.id}`}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'is-active' : ''}`
                    }
                  >
                    {meta.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
