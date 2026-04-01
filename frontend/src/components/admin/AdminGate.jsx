export default function AdminGate({ credentials, onChange, onUnlock, error, authMessage }) {
  return (
    <section id="adminGate" className="hero">
      <div className="hero-copy hero-copy-wide">
        <p className="eyebrow">Tournament control</p>
        <h1>
          TOURNAMENT <span className="val-text">ADMIN</span>
        </h1>
        <p className="hero-text">
          Sign in with your Gmail and admin password to manage tournaments, registrations, reports, and announcements.
        </p>
        <div className="gate-form">
          <label htmlFor="adminEmailInput">ADMIN GMAIL</label>
          <input
            id="adminEmailInput"
            name="email"
            type="email"
            value={credentials.email}
            onChange={onChange}
            placeholder="admin@gmail.com"
          />
          <label htmlFor="adminPasswordInput">ADMIN PASSWORD</label>
          <input
            id="adminPasswordInput"
            name="password"
            type="password"
            value={credentials.password}
            onChange={onChange}
            placeholder="Enter admin password"
          />
          {authMessage ? (
            <p className="mini-label" style={{ marginTop: 10, color: '#ffd36b' }}>
              {authMessage}
            </p>
          ) : null}
          <p className="error-text" style={{ display: error ? 'block' : 'none' }}>
            WRONG EMAIL, PASSWORD, OR FIREBASE AUTH STATE.
          </p>
        </div>
        <div className="hero-actions">
          <button className="hero-btn primary" type="button" onClick={onUnlock}>
            UNLOCK PANEL
          </button>
        </div>
      </div>
    </section>
  );
}
