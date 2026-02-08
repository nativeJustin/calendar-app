import { useState } from 'react';
import './EventCreationForm.css';

function EventCreationForm({ googleAccounts, onCreateEvent }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
    accountId: ''
  });
  const [formError, setFormError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate title
    if (!formData.title.trim()) {
      setFormError('Event title is required');
      return;
    }

    // Validate start time
    if (!formData.startTime) {
      setFormError('Start time is required');
      return;
    }

    // Auto-calculate end time if not provided (1 hour duration)
    let endTime = formData.endTime;
    if (!endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
      endTime = end.toISOString().slice(0, 16); // Format for datetime-local
    }

    // Validate end time is after start time
    if (new Date(endTime) <= new Date(formData.startTime)) {
      setFormError('End time must be after start time');
      return;
    }

    // Select account: use specified, first available, or error
    const accountId = formData.accountId || googleAccounts[0]?.id;
    if (!accountId) {
      setFormError('No Google account connected');
      return;
    }

    // Auto-detect browser timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    setIsCreating(true);
    try {
      const eventData = {
        accountId,
        title: formData.title.trim(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        timeZone
      };

      if (formData.description.trim()) {
        eventData.description = formData.description.trim();
      }

      await onCreateEvent(eventData);

      // Reset form and close on success
      setFormData({ title: '', startTime: '', endTime: '', description: '', accountId: '' });
      setShowCreateForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.error || 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setFormData({ title: '', startTime: '', endTime: '', description: '', accountId: '' });
    setFormError(null);
    setShowCreateForm(false);
  };

  return (
    <div className="event-creation-section">
      <button
        className="create-event-btn"
        onClick={() => setShowCreateForm(!showCreateForm)}
      >
        {showCreateForm ? '− Cancel' : '+ Create Event'}
      </button>

      {showCreateForm && (
        <form className="create-event-form" onSubmit={handleCreateEvent}>
          <input
            type="text"
            className="event-input"
            placeholder="Event title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={isCreating}
            autoFocus
            required
          />

          <input
            type="datetime-local"
            className="event-input"
            placeholder="Start time *"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            disabled={isCreating}
            required
          />

          <input
            type="datetime-local"
            className="event-input"
            placeholder="End time (optional - defaults to 1 hour)"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            disabled={isCreating}
          />

          <textarea
            className="event-input event-textarea"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isCreating}
            rows="3"
          />

          {googleAccounts.length > 1 && (
            <select
              className="event-select"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              disabled={isCreating}
            >
              <option value="">Account: {googleAccounts[0]?.email}</option>
              {googleAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  Account: {account.email}
                </option>
              ))}
            </select>
          )}

          {formError && <div className="form-error">{formError}</div>}

          <button type="submit" className="create-submit-btn" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      )}
    </div>
  );
}

export default EventCreationForm;
