import { google } from 'googleapis';
import { googleConfig } from '../config/oauth.js';
import tokenStore from './tokenStore.js';

class GoogleCalendarService {
  createOAuth2Client() {
    return new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri
    );
  }

  async getAuthUrl(state) {
    const oauth2Client = this.createOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: googleConfig.scopes,
      state: state,
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  async getTokensFromCode(code) {
    const oauth2Client = this.createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  async getUserEmail(tokens) {
    const oauth2Client = this.createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data.email;
  }

  async getCalendarEvents(accountId, startDate, endDate) {
    try {
      const tokens = await tokenStore.getGoogleTokens(accountId);
      if (!tokens) {
        throw new Error('No tokens found for account');
      }

      const oauth2Client = this.createOAuth2Client();
      oauth2Client.setCredentials(tokens);

      // Set up refresh token handler
      oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
          tokens.refresh_token = newTokens.refresh_token;
        }
        tokens.access_token = newTokens.access_token;
        await tokenStore.saveGoogleTokens(accountId, tokens, tokens.email);
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error(`Error fetching calendar events for account ${accountId}:`, error.message);
      throw error;
    }
  }

  async getAllCalendarEvents(startDate, endDate) {
    const accounts = await tokenStore.getAllGoogleAccounts();

    if (accounts.length === 0) {
      console.log('No Google accounts connected');
      return [];
    }

    const eventsPromises = accounts.map(async (account) => {
      try {
        const events = await this.getCalendarEvents(account.id, startDate, endDate);
        return events.map(event => ({
          ...event,
          accountId: account.id,
          accountEmail: account.email
        }));
      } catch (error) {
        console.error(`Error fetching events for ${account.email}:`, error.message);
        return [];
      }
    });

    const eventsArrays = await Promise.all(eventsPromises);
    return eventsArrays.flat();
  }

  async updateEventTime(accountId, eventId, newStartTime, newEndTime) {
    try {
      const tokens = await tokenStore.getGoogleTokens(accountId);
      if (!tokens) {
        throw new Error('No tokens found for account');
      }

      const oauth2Client = this.createOAuth2Client();
      oauth2Client.setCredentials(tokens);

      // Set up refresh token handler
      oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
          tokens.refresh_token = newTokens.refresh_token;
        }
        tokens.access_token = newTokens.access_token;
        await tokenStore.saveGoogleTokens(accountId, tokens, tokens.email);
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // First, get the current event to check if user is organizer
      const existingEvent = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      console.log('Event data:', JSON.stringify(existingEvent.data, null, 2));
      console.log('Organizer:', existingEvent.data.organizer);
      console.log('Creator:', existingEvent.data.creator);

      // Check if the user is the organizer
      const userEmail = await this.getUserEmail(tokens);
      console.log('User email:', userEmail);
      
      const organizerEmail = existingEvent.data.organizer?.email;
      const isOrganizer = existingEvent.data.organizer?.self === true;

      console.log('Organizer email:', organizerEmail);
      console.log('Is organizer (self field):', isOrganizer);

      if (!isOrganizer && organizerEmail && organizerEmail.toLowerCase() !== userEmail.toLowerCase()) {
        throw new Error('You can only edit events that you created');
      }

      // Calculate duration from original event
      const originalStart = new Date(existingEvent.data.start.dateTime || existingEvent.data.start.date);
      const originalEnd = new Date(existingEvent.data.end.dateTime || existingEvent.data.end.date);
      const duration = originalEnd - originalStart;

      // If no end time provided, calculate it based on original duration
      let endTime = newEndTime;
      if (!endTime) {
        const startDate = new Date(newStartTime);
        endTime = new Date(startDate.getTime() + duration).toISOString();
      }

      // Update the event
      const updatedEvent = {
        ...existingEvent.data,
        start: existingEvent.data.start.dateTime 
          ? { dateTime: newStartTime }
          : { date: newStartTime.split('T')[0] },
        end: existingEvent.data.end.dateTime
          ? { dateTime: endTime }
          : { date: endTime.split('T')[0] }
      };

      console.log('Attempting to update event with:', {
        calendarId: 'primary',
        eventId: eventId,
        start: updatedEvent.start,
        end: updatedEvent.end
      });

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: updatedEvent
      });

      console.log('Successfully updated event');
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${eventId} for account ${accountId}:`);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', error);
      throw error;
    }
  }

  async createEvent(accountId, eventData) {
    try {
      const tokens = await tokenStore.getGoogleTokens(accountId);
      if (!tokens) {
        throw new Error('No tokens found for account');
      }

      const oauth2Client = this.createOAuth2Client();
      oauth2Client.setCredentials(tokens);

      // Set up token refresh handler
      oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
          tokens.refresh_token = newTokens.refresh_token;
        }
        tokens.access_token = newTokens.access_token;
        await tokenStore.saveGoogleTokens(accountId, tokens, tokens.email);
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Build event payload
      const event = {
        summary: eventData.title,
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timeZone
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timeZone
        }
      };

      // Add optional description
      if (eventData.description) {
        event.description = eventData.description;
      }

      console.log('Creating event:', event);

      // Insert the event into primary calendar
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event
      });

      console.log('Successfully created event:', response.data.id);
      return response.data;
    } catch (error) {
      console.error(`Error creating event for account ${accountId}:`);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
}

export default new GoogleCalendarService();
