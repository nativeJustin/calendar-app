import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export function useTodoistTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api/todoist/tasks')
      setTasks(response.data.tasks)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      console.error('Full error:', err.response?.data)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const scheduleTask = useCallback(async (taskId, datetime) => {
    try {
      await axios.post(`/api/todoist/tasks/${taskId}/schedule`, { datetime })
    } catch (err) {
      console.error('Error scheduling task:', err)
      throw err
    }
  }, [])

  const unscheduleTask = useCallback(async (taskId) => {
    try {
      await axios.post(`/api/todoist/tasks/${taskId}/unschedule`)
    } catch (err) {
      console.error('Error unscheduling task:', err)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, error, refetch: fetchTasks, scheduleTask, unscheduleTask }
}
