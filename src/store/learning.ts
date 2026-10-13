import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { persistedStorage } from './storage'

/**
 * Learning Path progress per person. Two states rather than one, because
 * §10.11 measures started (Employee Engagement in Development Plan) and
 * completed (Skill Completion Rate) as different things.
 */
export type ProjectTaskStatus = 'todo' | 'doing' | 'done'
export const PROJECT_PERSONAL_TASKS = ['brief', 'deliver', 'review'] as const

interface LearningState {
  projectTasks: Record<string, Record<string, ProjectTaskStatus>>
  setProjectTask: (employeeId: string, stepId: string, taskId: string, status: ProjectTaskStatus) => void
  started: Record<string, string[]>
  completed: Record<string, string[]>
  toggleStarted: (employeeId: string, stepId: string) => void
  toggleCompleted: (employeeId: string, stepId: string) => void
  reset: () => void
}

const toggle = (list: string[] = [], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

export const useLearning = create<LearningState>()(
  persist(
    (set) => ({
      projectTasks: {},
      setProjectTask: (employeeId, stepId, taskId, status) =>
        set((state) => {
          const wasDone = (state.completed[employeeId] ?? []).includes(stepId)
          const wasStarted = (state.started[employeeId] ?? []).includes(stepId)
          const defaults = Object.fromEntries(PROJECT_PERSONAL_TASKS.map((id, index) =>
            [id, wasDone ? 'done' : wasStarted && index === 0 ? 'doing' : 'todo'],
          )) as Record<string, ProjectTaskStatus>
          const tasks = { ...defaults, ...state.projectTasks[stepId], [taskId]: status }
          const done = PROJECT_PERSONAL_TASKS.every((id) => tasks[id] === 'done')
          const started = PROJECT_PERSONAL_TASKS.some((id) => tasks[id] !== 'todo')
          const update = (list: string[] = [], include: boolean) =>
            include ? [...new Set([...list, stepId])] : list.filter((id) => id !== stepId)
          return {
            projectTasks: { ...state.projectTasks, [stepId]: tasks },
            completed: { ...state.completed, [employeeId]: update(state.completed[employeeId], done) },
            started: { ...state.started, [employeeId]: update(state.started[employeeId], started) },
          }
        }),
      started: {},
      completed: {},
      toggleStarted: (employeeId, stepId) =>
        set((state) => ({
          started: { ...state.started, [employeeId]: toggle(state.started[employeeId], stepId) },
        })),
      /** Completing a step implies it was started. */
      toggleCompleted: (employeeId, stepId) =>
        set((state) => {
          const completed = toggle(state.completed[employeeId], stepId)
          const nowComplete = completed.includes(stepId)
          const started = nowComplete
            ? [...new Set([...(state.started[employeeId] ?? []), stepId])]
            : (state.started[employeeId] ?? [])
          return {
            completed: { ...state.completed, [employeeId]: completed },
            started: { ...state.started, [employeeId]: started },
          }
        }),
      reset: () => set({ started: {}, completed: {}, projectTasks: {} }),
    }),
    { name: 'hrada-learning', storage: persistedStorage<LearningState>() },
  ),
)
