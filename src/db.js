import Dexie from 'dexie'

export const db = new Dexie('TaskMateDB')

db.version(1).stores({
  tasks: '++id, title, category, dueDate, completed, createdAt'
})