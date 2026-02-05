import { useState, useEffect } from 'react'
import axios from 'axios'
import './SetupGuide.css'

function SetupGuide() {
  const [googleAccounts, setGoogleAccounts] = useState([])
  const [todoistConnected, setTodoistConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    checkConnections()
  }, [])

  const checkConnections = async () => {
    try {
      setLoading(true)

      // Check Google accounts
      const googleRes = await axios.get('/api/google/accounts')
      setGoogleAccounts(googleRes.data.accounts || [])

      // Check Todoist connection
      const todoistRes = await axios.get('/api/todoist/status')
      setTodoistConnected(todoistRes.data.connected)
    } catch (error) {
      console.error('Error checking connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectGoogle = () => {
    window.open('/api/google/auth', '_blank', 'width=600,height=700')
    // Refresh after a delay to catch new connection
    setTimeout(checkConnections, 3000)
  }

  const connectTodoist = () => {
    const instructions = `
To connect Todoist:

1. Go to: https://todoist.com/app/settings/integrations/developer
2. Scroll down to "API token" section
3. Copy your API token
4. Add it to your server/.env file:
   TODOIST_API_TOKEN=your_token_here
5. Restart the backend server
6. Refresh this page

The backend will need to be restarted after adding the token.
    `.trim()

    alert(instructions)
  }

  const removeGoogleAccount = async (accountId) => {
    try {
      await axios.delete(`/api/google/accounts/${accountId}`)
      checkConnections()
    } catch (error) {
      console.error('Error removing account:', error)
      alert('Failed to remove account')
    }
  }

  const allConnected = googleAccounts.length > 0 && todoistConnected

  // Auto-expand if not all connected
  useEffect(() => {
    if (!allConnected) {
      setIsExpanded(true)
    }
  }, [allConnected])

  if (loading) {
    return <div className="setup-guide">Loading...</div>
  }

  return (
    <div className={`setup-guide ${allConnected && !isExpanded ? 'collapsed' : ''}`}>
      <div
        className="setup-header"
        onClick={() => allConnected && setIsExpanded(!isExpanded)}
        style={{ cursor: allConnected ? 'pointer' : 'default' }}
      >
        <h3>Setup & Connections</h3>
        <div className="setup-header-right">
          {allConnected && <span className="status-badge connected">All Connected</span>}
          {allConnected && (
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="connection-section">
          <div className="connection-item">
            <div className="connection-info">
              <h4>Google Calendar</h4>
              {googleAccounts.length === 0 ? (
                <p className="status-text">Not connected</p>
              ) : (
                <div className="connected-accounts">
                  {googleAccounts.map(account => (
                    <div key={account.id} className="account-tag">
                      <span>{account.email}</span>
                      <button
                        onClick={() => removeGoogleAccount(account.id)}
                        className="remove-btn"
                        title="Remove account"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={connectGoogle} className="connect-btn">
              {googleAccounts.length > 0 ? 'Add Another' : 'Connect'}
            </button>
          </div>

          <div className="connection-item">
            <div className="connection-info">
              <h4>Todoist</h4>
              <p className="status-text">
                {todoistConnected ? (
                  <span className="connected-text">API token configured</span>
                ) : (
                  'API token not configured'
                )}
              </p>
            </div>
            {!todoistConnected && (
              <button onClick={connectTodoist} className="connect-btn setup-btn">
                Setup Instructions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SetupGuide
