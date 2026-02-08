import { useState, useEffect, useCallback } from 'react'
import Calendar from './components/Calendar'
import TaskPanel from './components/TaskPanel'
import SetupGuide from './components/SetupGuide'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import { useTodoistTasks } from './hooks/useTodoistTasks'
import './App.css'

function App() {
  const [showAllDayTasks, setShowAllDayTasks] = useState(false)
  const [showCompletedTasks, setShowCompletedTasks] = useState(false)

  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useCalendarEvents()
  const { tasks, projects, sections, loading: tasksLoading, error: tasksError, refetch: refetchTasks, scheduleTask, unscheduleTask, createTask } = useTodoistTasks()

  // Expose unschedule function globally for Calendar component
  useEffect(() => {
    window.unscheduleTask = handleTaskUnschedule
    return () => {
      delete window.unscheduleTask
    }
  }, [])

  const filteredTasks = tasks.filter(task => {
    if (!showCompletedTasks && task.is_completed) return false
    if (!showAllDayTasks && task.due?.date && !task.due?.datetime) return false
    return true
  })

  const handleTaskDrop = async (taskId, newDateTime) => {
    try {
      await scheduleTask(taskId, newDateTime)
      await refetchTasks()
      await refetchEvents()
    } catch (error) {
      console.error('Failed to schedule task:', error)
      alert('Failed to schedule task. Please try again.')
    }
  }

  const handleTaskUnschedule = useCallback(async (taskId) => {
    try {
      await unscheduleTask(taskId)
      await refetchTasks()
      await refetchEvents()
    } catch (error) {
      console.error('Failed to unschedule task:', error)
      alert('Failed to unschedule task. Please try again.')
    }
  }, [unscheduleTask, refetchTasks, refetchEvents])

  const handleTaskCreate = useCallback(async (taskData) => {
    try {
      await createTask(taskData)
      await refetchTasks()
      await refetchEvents() // Also refresh calendar in case task has due date
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error // Let TaskPanel handle error display
    }
  }, [createTask, refetchTasks, refetchEvents])

  const handleEventsChange = useCallback(async () => {
    await refetchEvents()
    await refetchTasks()
  }, [refetchEvents, refetchTasks])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Master Calendar</h1>
      </header>

      <SetupGuide />

      <div className="app-content">
        <TaskPanel
          tasks={filteredTasks}
          projects={projects}
          sections={sections}
          loading={tasksLoading}
          error={tasksError}
          showAllDayTasks={showAllDayTasks}
          setShowAllDayTasks={setShowAllDayTasks}
          showCompletedTasks={showCompletedTasks}
          setShowCompletedTasks={setShowCompletedTasks}
          onTaskUnschedule={handleTaskUnschedule}
          onCreateTask={handleTaskCreate}
        />

        <Calendar
          events={events}
          loading={eventsLoading}
          error={eventsError}
          onTaskDrop={handleTaskDrop}
          onEventsChange={handleEventsChange}
        />
      </div>
    </div>
  )
}

export default App
