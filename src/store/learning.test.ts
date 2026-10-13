import { beforeEach, describe, expect, it } from 'vitest'

import { PROJECT_PERSONAL_TASKS, useLearning } from './learning'

describe('project progress in the learning path', () => {
  beforeEach(() => useLearning.getState().reset())

  it('completes only after the employee finishes all their tasks, and reopens when a task moves back', () => {
    const { setProjectTask } = useLearning.getState()
    setProjectTask('employee', 'employee-real-project', 'brief', 'doing')
    expect(useLearning.getState().started.employee).toContain('employee-real-project')
    expect(useLearning.getState().completed.employee).not.toContain('employee-real-project')

    for (const task of PROJECT_PERSONAL_TASKS) {
      setProjectTask('employee', 'employee-real-project', task, 'done')
    }
    expect(useLearning.getState().completed.employee).toContain('employee-real-project')
    setProjectTask('employee', 'employee-real-project', 'review', 'doing')
    expect(useLearning.getState().completed.employee).not.toContain('employee-real-project')
    expect(useLearning.getState().started.employee).toContain('employee-real-project')
  })

  it('keeps teammate progress separate from personal completion and isolates employees', () => {
    const { setProjectTask } = useLearning.getState()
    setProjectTask('employee', 'employee-real-project', 'feedback', 'done')
    expect(useLearning.getState().started.employee).toEqual([])
    expect(useLearning.getState().completed.employee).toEqual([])
    setProjectTask('other', 'other-real-project', 'brief', 'doing')
    expect(useLearning.getState().projectTasks['employee-real-project'].brief).toBe('todo')
    expect(useLearning.getState().projectTasks['other-real-project'].brief).toBe('doing')
  })

  it('preserves existing completed project progress when the board is first used', () => {
    const { toggleCompleted, setProjectTask } = useLearning.getState()
    toggleCompleted('employee', 'employee-real-project')
    setProjectTask('employee', 'employee-real-project', 'feedback', 'todo')
    expect(useLearning.getState().completed.employee).toContain('employee-real-project')
    expect(useLearning.getState().projectTasks['employee-real-project'].review).toBe('done')
  })
})
