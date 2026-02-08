import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export function useTodoistTasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [sections, setSections] = useState([])
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

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get('/api/todoist/projects')
      setProjects(response.data.projects)
    } catch (err) {
      console.error('Error fetching projects:', err)
    }
  }, [])

  const fetchSections = useCallback(async () => {
    try {
      const response = await axios.get('/api/todoist/sections')
      setSections(response.data.sections)
    } catch (err) {
      console.error('Error fetching sections:', err)
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

  const createTask = useCallback(async (taskData) => {
    try {
      const response = await axios.post('/api/todoist/tasks', taskData)
      return response.data.task
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchProjects()
    fetchSections()
  }, [fetchTasks, fetchProjects, fetchSections])

  return { tasks, projects, sections, loading, error, refetch: fetchTasks, scheduleTask, unscheduleTask, createTask }
}
