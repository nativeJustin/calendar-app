import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export function useCalendarEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true)
      setError(null)

      // Default to current month if no dates provided
      if (!startDate || !endDate) {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        startDate = start.toISOString()
        endDate = end.toISOString()
      }

      // Fetch both Google Calendar events and Todoist tasks
      const [calendarResponse, tasksResponse] = await Promise.all([
        axios.get('/api/calendar/events', { params: { startDate, endDate } }),
        axios.get('/api/todoist/tasks')
      ])

      // Transform Google Calendar events
      const calendarEvents = calendarResponse.data.events.map(event => ({
        id: `gcal-${event.id}`,
        title: event.summary || '(No title)',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime,
        backgroundColor: getColorForAccount(event.accountEmail),
        borderColor: getColorForAccount(event.accountEmail),
        extendedProps: {
          type: 'calendar',
          eventId: event.id, // Original event ID without prefix
          accountId: event.accountId, // Account ID for API calls
          accountEmail: event.accountEmail,
          description: event.description,
          location: event.location,
          organizer: event.organizer, // Include organizer info
          creator: event.creator // Include creator info
        }
      }))

      // Transform Todoist tasks with due dates into calendar events
      const taskEvents = tasksResponse.data.tasks
        .filter(task => task.due?.datetime) // Only tasks with specific times
        .map(task => {
          const dueDate = new Date(task.due.datetime)
          const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000) // 1 hour duration

          return {
            id: `task-${task.id}`,
            title: `✓ ${task.content}`,
            start: task.due.datetime,
            end: endDate.toISOString(),
            allDay: false,
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            editable: true, // Make task events draggable
            extendedProps: {
              type: 'task',
              taskId: task.id,
              priority: task.priority,
              projectId: task.project_id
            }
          }
        })

      // Combine both event types
      setEvents([...calendarEvents, ...taskEvents])
    } catch (err) {
      console.error('Error fetching events:', err)
      console.error('Full error:', err.response?.data)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

// Generate consistent colors for different accounts
function getColorForAccount(email) {
  const colors = ['#3788d8', '#e67c73', '#33b679', '#f4b400', '#8e24aa']
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
