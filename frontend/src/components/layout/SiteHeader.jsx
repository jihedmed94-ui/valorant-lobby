import { Link } from 'react-router-dom';
import discordIcon from '../../assets/discord.png';

function BrandLogo() {
  return (
    <svg className="brand-logo" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="brandAccent" x1="8" x2="56" y1="8" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff4655" />
          <stop offset="1" stopColor="#ff7f6b" />
        </linearGradient>
      </defs>
      <path fill="url(#brandAccent)" d="M15 10h14l3 19 3-19h14L37 54H27L15 10Z" />
      <path fill="rgba(255,255,255,0.18)" d="M26 15h12l-2 10h-8l-2-10Zm3 16h6l-3 16-3-16Z" />
    </svg>
  );
}

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
        <span className="brand-mark">
          <BrandLogo />
        </span>
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
