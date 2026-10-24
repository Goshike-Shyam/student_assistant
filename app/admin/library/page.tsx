'use client'

import { useEffect, useState } from 'react'

type AdminLibraryItem = {
  id: string
  itemType: string
  grade: string
  board: string
  subjectId: string
  subjectLabel: string
  topic: string
  isVisible: boolean
  isFeatured: boolean
  isImported: boolean
  importFileName?: string | null
  adminNote?: string | null
  viewCount: number
  contentPreview: string
  createdAt: string
}

type ConfigState = {
  scope: string
  auto_save_research: string
  auto_save_practice: string
}

const DEFAULT_CONFIG: ConfigState = {
  scope: 'OWN_GRADE_BOARD',
  auto_save_research: 'true',
  auto_save_practice: 'true',
}

export default function AdminLibraryPage() {
  const [items, setItems] = useState<AdminLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG)
  const [savingConfig, setSavingConfig] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [tab, setTab] = useState('')
  const [grade, setGrade] = useState('')
  const [board, setBoard] = useState('')
  const [subject, setSubject] = useState('')
  const [search, setSearch] = useState('')
  const [visibility, setVisibility] = useState('')

  const [showImport, setShowImport] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMsg, setImportMsg] = useState('')
  const [importMeta, setImportMeta] = useState({
    grade: '',
    board: '',
    subjectId: '',
    topic: '',
    itemType: 'RESEARCH',
  })

  useEffect(() => {
    void loadItems()
  }, [tab, grade, board, subject, search, visibility, page])

  async function loadItems() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (tab) params.set('tab', tab)
      if (grade) params.set('grade', grade)
      if (board) params.set('board', board)
      if (subject) params.set('subject', subject)
      if (search) params.set('search', search)
      if (visibility) params.set('visibility', visibility)

      const response = await fetch(`/api/admin/library?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) return

      setItems(data.items || [])
      setTotal(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setConfig({
        scope: data.config?.scope || DEFAULT_CONFIG.scope,
        auto_save_research: data.config?.auto_save_research || DEFAULT_CONFIG.auto_save_research,
        auto_save_practice: data.config?.auto_save_practice || DEFAULT_CONFIG.auto_save_practice,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function patchItem(id: string, patch: Record<string, unknown>) {
    setSavingId(id)
    try {
      await fetch('/api/admin/library', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } as AdminLibraryItem : item)))
    } finally {
      setSavingId(null)
    }
  }

  async function deleteItem(id: string, topic: string) {
    if (!window.confirm(`Delete "${topic}" from library?`)) return

    setSavingId(id)
    try {
      await fetch('/api/admin/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setItems((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setSavingId(null)
    }
  }

  async function saveConfig(configKey: string, configValue: string) {
    setSavingConfig(true)
    try {
      await fetch('/api/admin/library', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configKey, configValue }),
      })
      setConfig((prev) => ({ ...prev, [configKey]: configValue }))
    } finally {
      setSavingConfig(false)
    }
  }

  async function handleImport() {
    if (!importFile) return
    setImporting(true)
    setImportMsg('')

    try {
      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('metadata', JSON.stringify(importMeta))

      const response = await fetch('/api/admin/library', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        setImportMsg(data.error || 'Import failed')
        return
      }

      setImportMsg('Imported successfully')
      setShowImport(false)
      setImportFile(null)
      await loadItems()
    } catch {
      setImportMsg('Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <header className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Study Library Admin</h1>
        <p className="mt-1 text-sm text-slate-600">{total} items across research and practice collections.</p>
      </header>

      <section className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <h2 className="text-sm font-bold text-emerald-900">Global Visibility Config</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            aria-label="Student visibility scope"
            value={config.scope}
            onChange={(event) => setConfig((prev) => ({ ...prev, scope: event.target.value }))}
            className="min-h-[44px] rounded-lg border border-emerald-300 bg-white px-3 text-sm"
          >
            <option value="OWN_GRADE_BOARD">Own grade + board</option>
            <option value="OWN_BOARD_ALL_GRADES">Own board, all grades</option>
            <option value="ALL_GRADES">All grades and boards</option>
          </select>
          <button
            type="button"
            disabled={savingConfig}
            onClick={() => saveConfig('scope', config.scope)}
            className="min-h-[44px] rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save scope
          </button>

          <label className="ml-2 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 text-sm">
            <input
              aria-label="Toggle auto save research"
              type="checkbox"
              checked={config.auto_save_research === 'true'}
              onChange={(event) => void saveConfig('auto_save_research', String(event.target.checked))}
            />
            Auto-save research
          </label>

          <label className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 text-sm">
            <input
              aria-label="Toggle auto save practice"
              type="checkbox"
              checked={config.auto_save_practice === 'true'}
              onChange={(event) => void saveConfig('auto_save_practice', String(event.target.checked))}
            />
            Auto-save practice
          </label>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImport((prev) => !prev)}
            className="min-h-[44px] rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white"
          >
            {showImport ? 'Close import' : 'Bulk import PDF/doc'}
          </button>

          <select
            aria-label="Filter type"
            value={tab}
            onChange={(event) => setTab(event.target.value)}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All types</option>
            <option value="RESEARCH">Research</option>
            <option value="PRACTICE">Practice</option>
          </select>

          <select
            aria-label="Filter visibility"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          <input
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            placeholder="Grade"
            aria-label="Filter by grade"
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm"
          />

          <input
            value={board}
            onChange={(event) => setBoard(event.target.value)}
            placeholder="Board"
            aria-label="Filter by board"
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm"
          />

          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject ID"
            aria-label="Filter by subject"
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search topic"
            aria-label="Search by topic"
            className="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-3 text-sm"
          />
        </div>

        {showImport ? (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <input
                placeholder="Grade"
                aria-label="Import grade"
                value={importMeta.grade}
                onChange={(event) => setImportMeta((prev) => ({ ...prev, grade: event.target.value }))}
                className="min-h-[44px] rounded-lg border border-indigo-300 px-3 text-sm"
              />
              <input
                placeholder="Board"
                aria-label="Import board"
                value={importMeta.board}
                onChange={(event) => setImportMeta((prev) => ({ ...prev, board: event.target.value }))}
                className="min-h-[44px] rounded-lg border border-indigo-300 px-3 text-sm"
              />
              <input
                placeholder="Subject ID"
                aria-label="Import subject id"
                value={importMeta.subjectId}
                onChange={(event) => setImportMeta((prev) => ({ ...prev, subjectId: event.target.value }))}
                className="min-h-[44px] rounded-lg border border-indigo-300 px-3 text-sm"
              />
              <input
                placeholder="Topic"
                aria-label="Import topic"
                value={importMeta.topic}
                onChange={(event) => setImportMeta((prev) => ({ ...prev, topic: event.target.value }))}
                className="min-h-[44px] rounded-lg border border-indigo-300 px-3 text-sm md:col-span-2"
              />
              <select
                aria-label="Import item type"
                value={importMeta.itemType}
                onChange={(event) => setImportMeta((prev) => ({ ...prev, itemType: event.target.value }))}
                className="min-h-[44px] rounded-lg border border-indigo-300 bg-white px-3 text-sm"
              >
                <option value="RESEARCH">Research</option>
                <option value="PRACTICE">Practice</option>
              </select>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                aria-label="Select file to import"
                onChange={(event) => setImportFile(event.target.files?.[0] || null)}
                className="min-h-[44px] rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm md:col-span-3"
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                disabled={importing || !importFile}
                onClick={() => void handleImport()}
                className="min-h-[44px] rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
              {importMsg ? <p className="text-sm text-slate-700">{importMsg}</p> : null}
            </div>
          </div>
        ) : null}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
        ) : (
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-3">Topic</th>
                <th className="px-3 py-3">Grade/Board</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Preview</th>
                <th className="px-3 py-3">Views</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Featured</th>
                <th className="px-3 py-3">Visible</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-900">{item.isFeatured ? '★ ' : ''}{item.isImported ? '📄 ' : ''}{item.topic}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{item.grade} · {item.board}</td>
                  <td className="px-3 py-3 text-slate-600">{item.subjectLabel}</td>
                  <td className="px-3 py-3 text-slate-600">{item.itemType}</td>
                  <td className="max-w-[260px] px-3 py-3 text-slate-600">{item.contentPreview}</td>
                  <td className="px-3 py-3 text-slate-600">{item.viewCount}</td>
                  <td className="px-3 py-3 text-slate-600">{new Date(item.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Feature ${item.topic}`}
                      checked={item.isFeatured}
                      disabled={savingId === item.id}
                      onChange={() => void patchItem(item.id, { isFeatured: !item.isFeatured })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Visible ${item.topic}`}
                      checked={item.isVisible}
                      disabled={savingId === item.id}
                      onChange={() => void patchItem(item.id, { isVisible: !item.isVisible })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => void deleteItem(item.id, item.topic)}
                      disabled={savingId === item.id}
                      className="min-h-[44px] rounded-lg bg-rose-100 px-3 text-sm font-semibold text-rose-800 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {totalPages > 1 ? (
        <nav className="mt-4 flex items-center justify-center gap-2" aria-label="Admin library pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">{page} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      ) : null}
    </main>
  )
}
