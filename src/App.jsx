import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  ClipboardList,
  Clock,
  BookOpen,
  X,
  Filter,
  SearchX
} from 'lucide-react'

const CATEGORIES = ['Kuliah', 'Praktikum', 'UTS', 'UAS', 'Proyek']

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Belum Selesai' },
  { value: 'completed', label: 'Selesai' }
]

function App() {

  const tasks = useLiveQuery(
    () => db.tasks.orderBy('createdAt').reverse().toArray(),
    []
  ) || []

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // ===== State filter =====
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Kuliah',
    dueDate: ''
  })

  // Statistik (dihitung dari semua tugas, bukan hasil filter)
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending = total - completed

  // ===== Proses filtering =====
  const filteredTasks = tasks.filter(task => {
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && task.completed) ||
      (statusFilter === 'pending' && !task.completed)

    const matchCategory =
      categoryFilter === 'all' || task.category === categoryFilter

    return matchStatus && matchCategory
  })

  const isFiltering = statusFilter !== 'all' || categoryFilter !== 'all'

  const resetFilter = () => {
    setStatusFilter('all')
    setCategoryFilter('all')
  }

  // Input form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // Simpan tugas
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      alert('Nama tugas wajib diisi!')
      return
    }

    if (editingId) {
      await db.tasks.update(editingId, {
        ...form,
        title: form.title.trim()
      })
    } else {
      await db.tasks.add({
        ...form,
        title: form.title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      })
    }

    resetForm()
  }

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: 'Kuliah',
      dueDate: ''
    })

    setEditingId(null)
    setShowForm(false)
  }

  // Edit tugas
  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      category: task.category,
      dueDate: task.dueDate
    })

    setEditingId(task.id)
    setShowForm(true)
  }

  // Hapus tugas
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Apakah Anda yakin ingin menghapus tugas ini?'
    )

    if (confirmDelete) {
      await db.tasks.delete(id)
    }
  }

  // Ubah status
  const handleComplete = async (task) => {
    await db.tasks.update(task.id, {
      completed: !task.completed
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-indigo-600 text-white px-6 py-5 shadow">

        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              TaskMate
            </h1>

            <p className="text-sm text-indigo-100">
              Student Task Management
            </p>
          </div>

          <ClipboardList size={35} />

        </div>

      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Welcome */}
        <section className="mb-7">

          <h2 className="text-2xl font-bold text-slate-800">
            Halo, Mahasiswa! 👋
          </h2>

          <p className="text-slate-500 mt-1">
            Kelola tugas kuliahmu dengan lebih teratur.
          </p>

        </section>

        {/* Statistik */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <StatCard
            title="Total Tugas"
            value={total}
            icon={<BookOpen />}
            color="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Belum Selesai"
            value={pending}
            icon={<Clock />}
            color="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Selesai"
            value={completed}
            icon={<CheckCircle2 />}
            color="bg-green-100 text-green-600"
          />

        </section>

        {/* Daftar Tugas */}
        <section className="bg-white rounded-2xl shadow-sm border p-5">

          <div className="flex justify-between items-center mb-5">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Daftar Tugas
              </h2>

              <p className="text-sm text-slate-500">
                Menampilkan {filteredTasks.length} dari {total} tugas
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Plus size={18} />
              Tambah
            </button>

          </div>

          {/* ===== Filter ===== */}
          <div className="flex flex-col gap-3 mb-5 pb-5 border-b">

            {/* Filter status */}
            <div className="flex flex-wrap items-center gap-2">

              <span className="flex items-center gap-1 text-sm text-slate-500 mr-1">
                <Filter size={15} />
                Status:
              </span>

              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  aria-pressed={statusFilter === opt.value}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    statusFilter === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}

            </div>

            {/* Filter kategori */}
            <div className="flex flex-wrap items-center gap-2">

              <label
                htmlFor="categoryFilter"
                className="text-sm text-slate-500 mr-1"
              >
                Kategori:
              </label>

              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border rounded-xl px-3 py-1.5 bg-white"
              >
                <option value="all">Semua Kategori</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {isFiltering && (
                <button
                  onClick={resetFilter}
                  className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <X size={14} />
                  Reset filter
                </button>
              )}

            </div>

          </div>

          {/* List */}
          <div className="space-y-3">

            {filteredTasks.length === 0 ? (

              <div className="text-center py-12 text-slate-400">

                {isFiltering ? (
                  <>
                    <SearchX
                      size={45}
                      className="mx-auto mb-3"
                    />

                    <p>Tidak ada tugas yang sesuai filter.</p>

                    <button
                      onClick={resetFilter}
                      className="text-sm text-indigo-600 hover:underline mt-1"
                    >
                      Tampilkan semua tugas
                    </button>
                  </>
                ) : (
                  <>
                    <ClipboardList
                      size={45}
                      className="mx-auto mb-3"
                    />

                    <p>Belum ada tugas.</p>

                    <p className="text-sm">
                      Silakan tambahkan tugas pertama.
                    </p>
                  </>
                )}

              </div>

            ) : (

              filteredTasks.map(task => (

                <div
                  key={task.id}
                  className="border rounded-xl p-4 flex items-start justify-between gap-3"
                >

                  <div className="flex items-start gap-3">

                    <button
                      onClick={() => handleComplete(task)}
                      className="mt-1"
                      aria-label="Ubah status tugas"
                    >
                      {task.completed ? (
                        <CheckCircle2
                          className="text-green-500"
                        />
                      ) : (
                        <Circle
                          className="text-slate-400"
                        />
                      )}
                    </button>

                    <div>

                      <h3 className={`font-semibold ${
                        task.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-800'
                      }`}>
                        {task.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">

                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                          {task.category}
                        </span>

                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                          Deadline: {task.dueDate || '-'}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      aria-label="Edit tugas"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      aria-label="Hapus tugas"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </main>

      {/* Modal Form */}
      {showForm && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Tugas' : 'Tambah Tugas'}
              </h2>

              <button onClick={resetForm}>
                <X />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Tugas
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Tugas Pemrograman Web"
                  className="w-full border rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Deskripsi
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Deskripsi tugas..."
                  className="w-full border rounded-xl px-3 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3 py-2"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Deadline
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border rounded-xl py-2"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-2"
                >
                  Simpan
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      <footer className="text-center text-sm text-slate-400 py-6">
        TaskMate PWA © 2026
      </footer>

    </div>
  )
}

// Komponen statistik
function StatCard({ title, value, icon, color }) {

  return (

    <div className="bg-white border rounded-2xl p-5 shadow-sm">

      <div className="flex justify-between items-center">

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>

      </div>

    </div>

  )
}

export default App