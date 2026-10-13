import { BriefcaseBusiness, Check, Clock3, Users } from 'lucide-react'

import type { Employee } from '@/data/types'
import { useI18n, useName, type TranslationKey } from '@/lib/i18n'
import type { LearningStep } from '@/lib/scoring'
import { PROJECT_PERSONAL_TASKS, useLearning, type ProjectTaskStatus } from '@/store/learning'

import { Badge } from './ui/Badge'
import { NumericText } from './ui/NumericText'

const columns: { status: ProjectTaskStatus; label: TranslationKey }[] = [
  { status: 'todo', label: 'learning.projectTodo' },
  { status: 'doing', label: 'learning.projectDoing' },
  { status: 'done', label: 'learning.projectDone' },
]
const phases: TranslationKey[] = [
  'learning.projectBrief', 'learning.projectDeliver', 'learning.projectReview',
]

export const LearningProjectCard = ({ employee, step, title, index }: {
  employee: Employee
  step: LearningStep
  title: string
  index: number
}) => {
  const { t } = useI18n()
  const name = useName()
  const saved = useLearning((state) => state.projectTasks[step.id])
  const completed = useLearning((state) => state.completed[employee.id]?.includes(step.id) ?? false)
  const started = useLearning((state) => state.started[employee.id]?.includes(step.id) ?? false)
  const setTask = useLearning((state) => state.setProjectTask)
  const tasks = [
    ...PROJECT_PERSONAL_TASKS.map((id, i) => ({
      id, title: t(phases[i]), owner: name(employee), personal: true,
      status: saved?.[id] ?? (completed ? 'done' : started && i === 0 ? 'doing' : 'todo'),
    })),
    { id: 'research', title: t('learning.projectResearch'), owner: t('learning.projectTeammate', { number: 1 }), personal: false, status: saved?.research ?? 'done' },
    { id: 'feedback', title: t('learning.projectFeedback'), owner: t('learning.projectTeammate', { number: 2 }), personal: false, status: saved?.feedback ?? 'doing' },
  ]
  const personalTasks = tasks.filter((task) => task.personal)
  const done = personalTasks.filter((task) => task.status === 'done').length
  const currentPhase = personalTasks.findIndex((task) => task.status !== 'done')

  return (
    <section aria-label={title} className="overflow-hidden rounded-lg border border-line bg-panel-raised/50">
      <header className="border-b border-line px-3.5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-micro text-haze">
            <BriefcaseBusiness size={14} aria-hidden="true" />
            <span className="num">{index + 1}</span>
            {t('learning.projectLabel')}
          </span>
          <Badge tone="muted">{t(completed ? 'learning.projectDone' : started ? 'learning.projectDoing' : 'learning.projectTodo')}</Badge>
        </div>
        <h3 className="mt-2 text-body font-semibold leading-relaxed">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-micro text-haze">
          <span className="flex items-center gap-1.5"><Clock3 size={12} aria-hidden="true" /><NumericText>{t('common.hours', { count: step.durationHours })}</NumericText></span>
          <span className="flex min-w-0 items-center gap-1.5"><Users size={12} className="shrink-0" aria-hidden="true" /><NumericText>{t('learning.projectPersonal', { name: name(employee), done, total: personalTasks.length })}</NumericText></span>
        </div>
      </header>

      <div className="px-3.5 py-3.5">
        <h4 className="text-micro text-haze">{t('learning.projectPlan')}</h4>
        <ol className="mt-2 grid grid-cols-3 gap-2">
          {personalTasks.map((task, i) => (
            <li key={task.id} aria-current={i === currentPhase ? 'step' : undefined}>
              <div className={`mb-2 h-1 rounded-full ${task.status === 'done' ? 'bg-haze' : i === currentPhase ? 'bg-signal' : 'bg-line'}`} />
              <p className="flex items-center gap-1 text-micro text-haze"><NumericText>{t('learning.projectWeek', { week: i + 1 })}</NumericText>{task.status === 'done' && <Check size={12} aria-hidden="true" />}</p>
              <p className="mt-0.5 text-micro leading-relaxed">{task.title}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-line px-3.5 py-3.5">
        <h4 className="text-small font-semibold">{t('learning.projectBoard')}</h4>
        <p className="mt-1 text-micro text-haze">{t('learning.projectDemo')}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {columns.map((column) => {
            const items = tasks.filter((task) => task.status === column.status)
            return (
              <section key={column.status} aria-label={t(column.label)} className="min-w-0 rounded-md bg-panel/70 p-2">
                <h5 className="mb-2 flex items-center justify-between gap-1 text-micro text-haze">
                  <span className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${column.status === 'doing' ? 'bg-signal' : column.status === 'done' ? 'bg-haze' : 'bg-line'}`} />{t(column.label)}</span>
                  <span className="num">{items.length}</span>
                </h5>
                <div className="space-y-2">
                  {items.length === 0 && <p className="py-3 text-micro text-haze">{t('learning.projectEmpty')}</p>}
                  {items.map((task) => (
                    <div key={task.id} className={`rounded-md border bg-panel-raised p-2 ${task.personal ? 'border-signal/40' : 'border-line'}`}>
                      <p className="text-micro leading-relaxed">{task.title}</p>
                      <p className="mt-2 truncate text-micro text-haze" title={task.owner}><NumericText>{task.owner}</NumericText></p>
                      <select
                        aria-label={t('learning.projectStatus', { task: task.title, name: task.owner })}
                        value={task.status}
                        onChange={(event) => setTask(employee.id, step.id, task.id, event.target.value as ProjectTaskStatus)}
                        className="mt-2 w-full min-w-0 rounded border border-line bg-panel px-1 py-1.5 text-micro text-haze pointer-coarse:min-h-11"
                      >
                        {columns.map((option) => <option key={option.status} value={option.status}>{t(option.label)}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
