function categoryClass(category) {
  return category.toLowerCase();
}

export default function CommunitySection({ announcements, onViewLobbies }) {
  return (
    <section id="community" className="community-section">
      <div className="section-header">
        <div>
          <p className="section-kicker">Community board</p>
          <h2>UPDATES & ANNOUNCEMENTS</h2>
        </div>
        <button className="section-btn alt" type="button" onClick={onViewLobbies}>
          VIEW LOBBIES
        </button>
      </div>
      <div className="announcement-grid">
        {announcements.map((item) => (
          <article key={item.id} className="announcement-card">
            <span className={`announcement-tag ${categoryClass(item.category)}`}>{item.category}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
