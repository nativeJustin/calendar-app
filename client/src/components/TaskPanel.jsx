import { useEffect, useRef } from 'react'
import { Draggable } from '@fullcalendar/interaction'
import './TaskPanel.css'

function TaskPanel({
  tasks,
  loading,
  error,
  showAllDayTasks,
  setShowAllDayTasks,
  showCompletedTasks,
  setShowCompletedTasks,
  onTaskUnschedule
}) {
  const isMobile = window.innerWidth <= 768
  const draggableInstances = useRef([])

  useEffect(() => {
    // Cleanup old draggable instances
    draggableInstances.current.forEach(instance => {
      if (instance && instance.destroy) {
        instance.destroy()
      }
    })
    draggableInstances.current = []

    // Initialize FullCalendar draggable only on desktop
    if (!isMobile) {
      const initDraggables = () => {
        const calendarEl = document.querySelector('.fc')
        console.log('TaskPanel: Calendar found:', !!calendarEl)

        if (!calendarEl) {
          console.warn('TaskPanel: Calendar not ready yet')
          return
        }

        // Create ONE Draggable on the task list container with itemSelector
        const taskList = document.querySelector('.task-list')
        if (!taskList) {
          console.error('TaskPanel: Could not find .task-list container')
          return
        }

        console.log('TaskPanel: Creating Draggable with itemSelector')

        try {
          const draggableInstance = new Draggable(taskList, {
            itemSelector: '.task-item',
            eventData: function(eventEl) {
              const taskId = eventEl.getAttribute('data-task-id')
              const taskTitle = eventEl.querySelector('.task-title')?.textContent || 'Task'
              console.log('TaskPanel: eventData called for task:', taskId)
              return {
                title: taskTitle,
                duration: '01:00',
                extendedProps: { taskId, type: 'task' }
              }
            }
          })
          draggableInstances.current.push(draggableInstance)
        } catch (error) {
          console.error('TaskPanel: Error creating draggable:', error)
        }
      }

      const handleCalendarReady = () => {
        console.log('TaskPanel: Received calendarReady event')
        setTimeout(initDraggables, 100)
      }

      window.addEventListener('calendarReady', handleCalendarReady)
      const timeoutId = setTimeout(initDraggables, 300)

      return () => {
        window.removeEventListener('calendarReady', handleCalendarReady)
        clearTimeout(timeoutId)
        draggableInstances.current.forEach(instance => instance?.destroy?.())
        draggableInstances.current = []
      }
    }
  }, [tasks, isMobile])

  const handleDragStart = (e, taskId) => {
    if (isMobile) {
      e.dataTransfer.setData('taskId', taskId)
      e.dataTransfer.effectAllowed = 'move'
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    // Add visual feedback
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e) => {
    // Remove visual feedback
    if (e.currentTarget === e.target) {
      e.currentTarget.classList.remove('drag-over')
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')

    // Check if this is a calendar event being dropped (from FullCalendar)
    const eventData = e.dataTransfer.getData('text/plain')

    try {
      // Try to parse as JSON (FullCalendar format)
      if (eventData) {
        const data = JSON.parse(eventData)
        if (data.extendedProps?.type === 'task') {
          const taskId = data.extendedProps.taskId
          await onTaskUnschedule(taskId)
        }
      }
    } catch (err) {
      // Not JSON, might be from mobile drag - ignore
      console.log('Drop event not from calendar task')
    }
  }

  const formatDueDate = (due) => {
    if (!due) return 'No due date'
    const date = new Date(due.datetime || due.date)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: due.datetime ? 'numeric' : undefined,
      minute: due.datetime ? '2-digit' : undefined
    })
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 4: return '#d1453b' // p1
      case 3: return '#eb8909' // p2
      case 2: return '#246fe0' // p3
      default: return '#666'   // p4
    }
  }

  if (loading) {
    return <div className="task-panel loading">Loading tasks...</div>
  }

  if (error) {
    return <div className="task-panel error">Error: {error}</div>
  }

  return (
    <div
      className="task-panel"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="task-panel-header">
        <h2>Schedule Inbox</h2>
        <div className="task-filters">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showAllDayTasks}
              onChange={(e) => setShowAllDayTasks(e.target.checked)}
            />
            <span>Show all-day tasks</span>
          </label>
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showCompletedTasks}
              onChange={(e) => setShowCompletedTasks(e.target.checked)}
            />
            <span>Show completed</span>
          </label>
        </div>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="no-tasks">No tasks to display</div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`task-item ${task.due?.datetime ? 'scheduled' : ''}`}
              data-task-id={task.id}
              draggable={isMobile}
              onDragStart={(e) => handleDragStart(e, task.id)}
              style={{ borderLeftColor: getPriorityColor(task.priority) }}
            >
              <div className="task-content">
                <div className="task-title">
                  {task.due?.datetime && <span className="scheduled-indicator">📅 </span>}
                  {task.content}
                </div>
                <div className="task-meta">
                  <span className="task-due">{formatDueDate(task.due)}</span>
                  {task.project_id && (
                    <span className="task-project">Project</span>
                  )}
                </div>
              </div>
              <div className="drag-handle">⋮⋮</div>
            </div>
          ))
        )}
      </div>

      <div className="task-panel-footer">
        <small>Drag tasks to calendar to schedule • Drag back here to unschedule</small>
      </div>
    </div>
  )
}

export default TaskPanel
