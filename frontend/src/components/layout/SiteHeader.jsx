import { Link } from 'react-router-dom';
import discordIcon from '../../assets/discord.png';

function InboxIcon() {
  return (
    <svg className="community-icon inbox-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 5h16a1 1 0 0 1 1 1v9a3 3 0 0 1-3 3h-3.2a2 2 0 0 1-1.6-.8L12 16l-1.2 1.2a2 2 0 0 1-1.6.8H6a3 3 0 0 1-3-3V6a1 1 0 0 1 1-1Zm1 2v8a1 1 0 0 0 1 1h3.2l2.1-2.1a1 1 0 0 1 1.4 0l2.1 2.1H18a1 1 0 0 0 1-1V7H5Z"
      />
    </svg>
  );
}

export default function SiteHeader({ pendingRequests }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark">V</span>
        <span className="brand-copy">
          VALORANT <b>LOBBY</b><em>TN</em>
        </span>
      </Link>
      <nav className="site-nav">
        <Link className={`community-btn nav-with-badge ${pendingRequests ? 'inbox-alert' : ''}`} to="/?inbox=1">
          <InboxIcon />
          INBOX
          {pendingRequests ? <span className="nav-badge">{pendingRequests}</span> : null}
        </Link>
        <a href="https://discord.gg/stRq5y2pdz" target="_blank" rel="noreferrer" className="community-btn">
          <img src={discordIcon} alt="" className="community-icon" />
          JOIN OUR COMMUNITY
        </a>
      </nav>
    </header>
  );
}
