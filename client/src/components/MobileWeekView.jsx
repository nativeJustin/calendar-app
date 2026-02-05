import { useState, useEffect } from 'react'
import './MobileWeekView.css'

function MobileWeekView({ events, onTaskDrop }) {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()))

  useEffect(() => {
    // Update week when component mounts
    setCurrentWeek(getWeekDates(new Date()))
  }, [])

  function getWeekDates(date) {
    const current = new Date(date)
    const day = current.getDay()
    const diff = current.getDate() - day
    const sunday = new Date(current.setDate(diff))

    const week = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + i)
      week.push(date)
    }
    return week
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek[0])
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(getWeekDates(newDate))
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek[0])
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(getWeekDates(newDate))
  }

  const goToToday = () => {
    setCurrentWeek(getWeekDates(new Date()))
  }

  const formatWeekRange = () => {
    const start = currentWeek[0]
    const end = currentWeek[6]
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const handleDayDrop = (date, e) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      // Set time to 9 AM by default
      const datetime = new Date(date)
      datetime.setHours(9, 0, 0, 0)
      onTaskDrop(taskId, datetime.toISOString())
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="mobile-week-view">
      <div className="mobile-week-header">
        <button onClick={goToPreviousWeek} className="nav-btn">←</button>
        <div className="week-info">
          <div className="week-range">{formatWeekRange()}</div>
          <button onClick={goToToday} className="today-btn">Today</button>
        </div>
        <button onClick={goToNextWeek} className="nav-btn">→</button>
      </div>

      <div className="mobile-week-days">
        {currentWeek.map((date, index) => {
          const dayEvents = getEventsForDate(date)
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
          const dayNumber = date.getDate()

          return (
            <div
              key={index}
              className={`mobile-day-row ${isToday(date) ? 'today' : ''}`}
              onDrop={(e) => handleDayDrop(date, e)}
              onDragOver={handleDragOver}
            >
              <div className="day-header">
                <span className="day-name">{dayName}</span>
                <span className="day-number">{dayNumber}</span>
              </div>
              <div className="day-events">
                {dayEvents.length === 0 ? (
                  <div className="no-events">Drop tasks here</div>
                ) : (
                  dayEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className={`mobile-event ${event.extendedProps?.type === 'task' ? 'task-event' : ''}`}
                      style={{ backgroundColor: event.backgroundColor }}
                    >
                      <span className="event-time">
                        {event.allDay ? 'All day' : new Date(event.start).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="event-title">{event.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MobileWeekView
