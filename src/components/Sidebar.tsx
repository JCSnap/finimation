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
    <nav className="w-56 min-w-56 h-full bg-gray-900 text-gray-200 flex flex-col overflow-y-auto">
      <div className="px-4 py-5 border-b border-gray-700">
        <span className="text-lg font-bold tracking-tight text-white">finimation</span>
      </div>
      <div className="flex-1 py-4 space-y-4">
        {Object.entries(grouped).map(([category, metas]) => (
          <div key={category}>
            <p className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
              {category}
            </p>
            <ul>
              {metas.map((meta) => (
                <li key={meta.id}>
                  <NavLink
                    to={`/${meta.id}`}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm rounded-r-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`
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
