import axios from 'axios';
import { todoistConfig } from '../config/oauth.js';

class TodoistService {
  constructor() {
    this.baseUrl = 'https://api.todoist.com/rest/v2';
  }

  getApiToken() {
    return todoistConfig.apiToken;
  }

  isConfigured() {
    return !!todoistConfig.apiToken;
  }

  async getTasks() {
    try {
      const apiToken = this.getApiToken();
      if (!apiToken) {
        throw new Error('Todoist API token not configured');
      }

      const response = await axios.get(`${this.baseUrl}/tasks`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });

      // Return all tasks - filtering will be done on the client side
      return response.data;
    } catch (error) {
      console.error('Error fetching Todoist tasks:', error.message);
      throw error;
    }
  }

  async updateTaskDueDate(taskId, dueDate) {
    try {
      const apiToken = this.getApiToken();
      if (!apiToken) {
        throw new Error('Todoist API token not configured');
      }

      // dueDate should be in ISO 8601 format with timezone
      const response = await axios.post(
        `${this.baseUrl}/tasks/${taskId}`,
        {
          due_datetime: dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
      throw error;
    }
  }

  async clearTaskDueDate(taskId) {
    try {
      const apiToken = this.getApiToken();
      if (!apiToken) {
        throw new Error('Todoist API token not configured');
      }

      // Setting due_string to "no date" removes the due date
      const response = await axios.post(
        `${this.baseUrl}/tasks/${taskId}`,
        {
          due_string: 'no date',
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error clearing task due date:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new TodoistService();
