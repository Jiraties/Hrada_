import { BookOpen, Clock3, ExternalLink, GraduationCap, Users } from 'lucide-react'

import { skillName } from '@/data/skills'
import { useI18n, useMessage } from '@/lib/i18n'
import type { LearningStep } from '@/lib/scoring'
import { useLearning } from '@/store/learning'

import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { NumericText } from './ui/NumericText'

export const LearningCourseCard = ({ employeeId, step, title, index }: {
  employeeId: string
  step: LearningStep
  title: string
  index: number
}) => {
  const { t } = useI18n()
  const renderMsg = useMessage()
  const isDone = useLearning((state) => state.completed[employeeId]?.includes(step.id) ?? false)
  const isStarted = useLearning((state) => state.started[employeeId]?.includes(step.id) ?? false)
  const toggleCompleted = useLearning((state) => state.toggleCompleted)
  const toggleStarted = useLearning((state) => state.toggleStarted)
  const workshop = step.type === 'Workshop'
  const CoverIcon = workshop ? Users : BookOpen
  const skill = skillName(step.targetSkill)
  const courseraUrl = `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`

  return (
    <article aria-label={title} className="overflow-hidden rounded-lg border border-line bg-panel-raised/50">
      <header className={`relative overflow-hidden border-b border-line px-4 py-4 ${workshop ? 'bg-workshop-cover text-workshop-cover-text' : 'bg-course-cover text-course-cover-text'}`}>
        <CoverIcon
          size={96}
          strokeWidth={1}
          aria-hidden="true"
          className={`pointer-events-none absolute -right-3 -bottom-5 -rotate-12 ${workshop ? 'text-workshop-cover-text/20' : 'text-course-cover-text/25'}`}
        />
        <div className="relative flex items-center justify-between gap-3">
          <span className={`flex items-center gap-2 text-micro ${workshop ? 'text-workshop-cover-muted' : 'text-course-cover-muted'}`}>
            <span className="num">{index + 1}</span>
            <CoverIcon size={14} aria-hidden="true" />
            {t(workshop ? 'learning.workshopLabel' : 'learning.courseLabel')}
          </span>
          <Badge tone="muted" className="border-current/25 bg-panel/10 text-current">
            {t(isDone ? 'learning.projectDone' : isStarted ? 'learning.projectDoing' : 'learning.projectTodo')}
          </Badge>
        </div>
        <h3 className="relative mt-3 max-w-[85%] text-section font-semibold leading-snug">
          <NumericText>{title}</NumericText>
        </h3>
        <p className={`relative mt-1 text-small ${workshop ? 'text-workshop-cover-muted' : 'text-course-cover-muted'}`}>{skill}</p>
      </header>

      <div className="px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-micro text-haze">
          <span className="flex items-center gap-1.5">
            <Clock3 size={13} aria-hidden="true" />
            <NumericText>{t('common.hours', { count: step.durationHours })}</NumericText>
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap size={14} aria-hidden="true" />
            <NumericText>{t('learning.courseDifficulty', { level: step.difficulty })}</NumericText>
          </span>
        </div>
        <p className="mt-2 text-micro leading-relaxed text-haze">
          <NumericText>{renderMsg(step.rationale)}</NumericText>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <a
            href={courseraUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('learning.courseraAction', { skill })}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-signal px-3.5 py-2 text-small font-medium text-on-signal transition-colors duration-150 hover:bg-signal/95 pointer-coarse:min-h-11"
          >
            {t('learning.goToCoursera')}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <p className="text-micro text-haze">{t('learning.courseDemo')}</p>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        {!isDone ? (
          <Button variant="ghost" className="px-0" onClick={() => toggleStarted(employeeId, step.id)}>
            {t(isStarted ? 'learning.unmarkStarted' : 'learning.startLearning')}
          </Button>
        ) : <span className="text-micro text-haze">{t('learning.courseCompleted')}</span>}
        <Button
          variant="secondary"
          onClick={() => toggleCompleted(employeeId, step.id)}
          aria-label={t(isDone ? 'learning.reopenCourseAction' : 'learning.markDone', { title })}
        >
          {t(isDone ? 'learning.reopenCourse' : 'learning.completeCourse')}
        </Button>
      </footer>
    </article>
  )
}
