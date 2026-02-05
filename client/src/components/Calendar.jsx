import { useRef, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import MobileWeekView from './MobileWeekView'
import axios from 'axios'
import './Calendar.css'

const ZOOM_PRESETS = {
  full: {
    label: 'Full Day',
    min: '00:00:00',
    max: '24:00:00',
    slotDuration: '01:00:00',
    slotLabelInterval: '02:00:00'
  },
  waking: {
    label: 'Waking Hours',
    min: '05:00:00',
    max: '23:00:00',
    slotDuration: '01:00:00',
    slotLabelInterval: '02:00:00'
  },
  work: {
    label: 'Work Hours',
    min: '07:00:00',
    max: '19:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00'
  }
}

function Calendar({ events, loading, error, onTaskDrop, onEventsChange }) {
  console.log('Calendar: Component rendering, isMobile:', window.innerWidth <= 768)

  const calendarRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [zoomPreset, setZoomPreset] = useState('waking')
  const [calendarReady, setCalendarReady] = useState(false)
  const hasSignaledReady = useRef(false)

  // Debug: Log when calendar is mounted and check droppable status
  useEffect(() => {
    // Wait longer to ensure both FullCalendar ref is populated AND TaskPanel has initialized
    // TaskPanel initializes at 1000ms, so we wait 1500ms to be safe
    const timeoutId = setTimeout(() => {
      if (calendarRef.current) {
        console.log('Calendar: Component mounted with ref')
        const calendarApi = calendarRef.current.getApi()
        if (calendarApi) {
          console.log('Calendar: Droppable enabled:', calendarApi.getOption('droppable'))
          console.log('Calendar: Drop handler set:', !!calendarApi.getOption('drop'))
          console.log('Calendar: Editable:', calendarApi.getOption('editable'))

          // Manually signal that calendar is ready for external drops
          console.log('Calendar: Ready to receive external draggables')
          setCalendarReady(true)

          // Signal to window that calendar is ready (for TaskPanel to use)
          window.calendarReady = true
        }
      } else {
        console.warn('Calendar: ref.current is STILL null after 1500ms - this should not happen')
      }
    }, 1500)

    return () => {
      clearTimeout(timeoutId)
      window.calendarReady = false
    }
  }, []) // Empty dependency array - run once on mount

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDrop = async (info) => {
    console.log('=== CALENDAR DROP EVENT TRIGGERED ===')
    console.log('Drop info:', info)
    console.log('Dragged element:', info.draggedEl)
    console.log('Drop date:', info.date)

    const taskId = info.draggedEl.getAttribute('data-task-id')
    console.log('Task ID from dragged element:', taskId)

    if (taskId) {
      const datetime = info.date.toISOString()
      console.log('Scheduling task', taskId, 'at', datetime)
      await onTaskDrop(taskId, datetime)
    } else {
      console.error('No task ID found on dragged element')
    }
  }

  const handleEventReceive = (info) => {
    // This is called when an external event is dropped
    console.log('=== EVENT RECEIVE TRIGGERED ===')
    console.log('Received event:', info.event)
    info.event.remove() // Remove the temporary event, we'll refetch
  }

  const handleEventDrop = async (info) => {
    // This is called when an existing calendar event is moved
    const { event } = info

    if (event.extendedProps.type === 'task') {
      // Handle Todoist task rescheduling
      const taskId = event.extendedProps.taskId
      const newDateTime = event.start.toISOString()

      try {
        await onTaskDrop(taskId, newDateTime)
      } catch (error) {
        console.error('Failed to reschedule task:', error)
        info.revert() // Revert the drag if it failed
      }
    } else if (event.extendedProps.type === 'calendar') {
      // Handle Google Calendar event rescheduling
      const eventId = event.extendedProps.eventId
      const accountId = event.extendedProps.accountId
      const organizer = event.extendedProps.organizer
      const accountEmail = event.extendedProps.accountEmail

      // Check if user is the organizer
      const isOrganizer = organizer && 
        (organizer.self || organizer.email?.toLowerCase() === accountEmail?.toLowerCase())

      if (!isOrganizer) {
        alert('You can only edit events that you created')
        info.revert()
        return
      }

      const newStartTime = event.start.toISOString()
      const newEndTime = event.end ? event.end.toISOString() : null

      try {
        await axios.post(`/api/calendar/events/${eventId}/update`, {
          accountId,
          startTime: newStartTime,
          endTime: newEndTime
        })

        // Refresh events to show the update
        if (onEventsChange) {
          await onEventsChange()
        }
      } catch (error) {
        console.error('Failed to update calendar event:', error)
        const errorMessage = error.response?.data?.message || 'Failed to update event'
        alert(errorMessage)
        info.revert() // Revert the drag if it failed
      }
    }
  }

  const handleEventDragStart = (info) => {
    // Set up drag data for dropping onto task panel
    const { event } = info
    if (event.extendedProps.type === 'task') {
      const dragData = JSON.stringify({
        extendedProps: {
          type: 'task',
          taskId: event.extendedProps.taskId
        }
      })
      // Store in a data attribute that can be accessed
      info.el.setAttribute('data-event-info', dragData)
    }
  }

  const handleEventDragStop = (info) => {
    // Check if dropped on task panel
    const { event, jsEvent } = info
    const taskPanel = document.querySelector('.task-panel')

    if (taskPanel && event.extendedProps.type === 'task') {
      const rect = taskPanel.getBoundingClientRect()
      const x = jsEvent.clientX
      const y = jsEvent.clientY

      // Check if mouse is over task panel
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        // Dropped on task panel - trigger unschedule
        const taskId = event.extendedProps.taskId

        // Unschedule the task
        if (window.unscheduleTask) {
          window.unscheduleTask(taskId)
        }

        // Remove the event from calendar
        info.event.remove()
      }
    }
  }

  const handleViewDidMount = (info) => {
    console.log('Calendar: viewDidMount callback - FullCalendar is fully rendered')
    console.log('Calendar: View type:', info.view.type)

    // Only signal ready once to avoid multiple TaskPanel reinitializations
    if (!hasSignaledReady.current) {
      console.log('Calendar: Signaling ready for first time')
      window.calendarReady = true
      setCalendarReady(true)
      hasSignaledReady.current = true

      // Debug: Check if drop handlers are set
      if (calendarRef.current) {
        const api = calendarRef.current.getApi()
        console.log('Calendar API droppable:', api.getOption('droppable'))
        console.log('Calendar API drop handler:', api.getOption('drop'))
      }

      // Add native drop event listener for debugging
      const calendarEl = document.querySelector('.fc')
      if (calendarEl) {
        calendarEl.addEventListener('drop', (e) => {
          console.log('!!! NATIVE DROP EVENT ON CALENDAR !!!', e)
        })
        calendarEl.addEventListener('dragover', (e) => {
          console.log('Native dragover on calendar')
        })
        console.log('Calendar: Added native drop/dragover listeners for debugging')
      }
    }
  }

  if (loading) {
    return <div className="calendar-container loading">Loading calendar...</div>
  }

  if (error) {
    return <div className="calendar-container error">Error: {error}</div>
  }

  // Use custom mobile view on mobile devices
  if (isMobile) {
    return (
      <div className="calendar-container">
        <MobileWeekView 
          events={events} 
          onTaskDrop={onTaskDrop}
          onEventsChange={onEventsChange}
        />
      </div>
    )
  }

  const currentPreset = ZOOM_PRESETS[zoomPreset]

  // Use FullCalendar on desktop
  return (
    <div className="calendar-container" data-zoom={zoomPreset}>
      <div className="calendar-zoom-controls">
        {Object.entries(ZOOM_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            className={`zoom-btn ${zoomPreset === key ? 'active' : ''}`}
            onClick={() => setZoomPreset(key)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        editable={true}
        droppable={true}
        dropAccept=".task-item"
        drop={handleDrop}
        eventReceive={handleEventReceive}
        eventDrop={handleEventDrop}
        eventDurationEditable={false}
        height="100%"
        slotMinTime={currentPreset.min}
        slotMaxTime={currentPreset.max}
        slotDuration={currentPreset.slotDuration}
        slotLabelInterval={currentPreset.slotLabelInterval}
        allDaySlot={true}
        nowIndicator={true}
        dayMaxEvents={true}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        eventClassNames={(arg) => {
          if (arg.event.extendedProps.type === 'task') {
            return ['task-event-calendar']
          }
          return []
        }}
        eventAllow={(dropInfo, draggedEvent) => {
          // Allow both task and calendar events to be moved
          const eventType = draggedEvent?.extendedProps?.type
          if (eventType === 'task') {
            return true
          }
          if (eventType === 'calendar') {
            // Check if user is organizer
            const organizer = draggedEvent.extendedProps.organizer
            const accountEmail = draggedEvent.extendedProps.accountEmail
            return organizer && (organizer.self || organizer.email?.toLowerCase() === accountEmail?.toLowerCase())
          }
          return false
        }}
        eventStartEditable={true}
        eventDragStart={handleEventDragStart}
        eventDragStop={handleEventDragStop}
        viewDidMount={handleViewDidMount}
      />
    </div>
  )
}

export default Calendar
