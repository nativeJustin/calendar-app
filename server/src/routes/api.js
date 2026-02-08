import express from 'express';
import googleCalendarService from '../services/googleCalendar.js';
import todoistService from '../services/todoistService.js';

const router = express.Router();

// Get calendar events from all Google accounts
router.get('/calendar/events', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const events = await googleCalendarService.getAllCalendarEvents(startDate, endDate);

    res.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      error: 'Failed to fetch calendar events',
      message: error.message
    });
  }
});

// Update Google Calendar event time
router.post('/calendar/events/:eventId/update', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { accountId, startTime, endTime } = req.body;

    if (!accountId || !startTime) {
      return res.status(400).json({ error: 'accountId and startTime are required' });
    }

    const updatedEvent = await googleCalendarService.updateEventTime(
      accountId, 
      eventId, 
      startTime, 
      endTime
    );

    res.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    
    if (error.message === 'You can only edit events that you created') {
      return res.status(403).json({ 
        error: 'Permission denied',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update event',
      message: error.message 
    });
  }
});

// Get Todoist tasks (filtered)
router.get('/todoist/tasks', async (req, res) => {
  try {
    const tasks = await todoistService.getTasks();
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching Todoist tasks:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

// Get Todoist projects
router.get('/todoist/projects', async (req, res) => {
  try {
    const projects = await todoistService.getProjects();
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

// Get Todoist sections
router.get('/todoist/sections', async (req, res) => {
  try {
    const sections = await todoistService.getSections();
    res.json({ sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      error: 'Failed to fetch sections',
      message: error.message
    });
  }
});

// Create new Todoist task
router.post('/todoist/tasks', async (req, res) => {
  try {
    const { content, due_string, priority, project_id, section_id } = req.body;

    // Validate required fields
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Task content is required' });
    }

    const taskData = { content: content.trim() };

    // Add optional fields if provided
    if (due_string) taskData.due_string = due_string;
    if (priority) taskData.priority = priority;
    if (project_id) taskData.project_id = project_id;
    if (section_id) taskData.section_id = section_id;

    const newTask = await todoistService.createTask(taskData);
    res.json({ task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      error: 'Failed to create task',
      message: error.response?.data?.message || error.message
    });
  }
});

// Update task due date/time
router.post('/todoist/tasks/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { datetime } = req.body;

    if (!datetime) {
      return res.status(400).json({ error: 'datetime is required' });
    }

    const updatedTask = await todoistService.updateTaskDueDate(id, datetime);
    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Error scheduling task:', error);
    res.status(500).json({ error: 'Failed to schedule task' });
  }
});

// Clear task due date/time (unschedule)
router.post('/todoist/tasks/:id/unschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await todoistService.clearTaskDueDate(id);
    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Error unscheduling task:', error);
    res.status(500).json({ error: 'Failed to unschedule task' });
  }
});

export default router;
