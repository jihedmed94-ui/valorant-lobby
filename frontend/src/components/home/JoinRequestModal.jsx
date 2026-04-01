import Modal from '../common/Modal';
import { RANKS } from '../../lib/constants';

export default function JoinRequestModal({ isOpen, onClose, form, onChange, onSubmit, lobbyName, error }) {
  return (
    <Modal isOpen={isOpen} title="JOIN REQUEST" onClose={onClose} cyan>
      <p className="mini-label">{lobbyName || 'ACTIVE LOBBY'}</p>

      <label htmlFor="joinRequestRiotId">RIOT ID</label>
      <input id="joinRequestRiotId" name="riotId" value={form.riotId} onChange={onChange} type="text" placeholder="Player#1234" />

      <div className="row">
        <div className="field">
          <label htmlFor="joinRequestRank">RANK</label>
          <select id="joinRequestRank" name="rank" value={form.rank} onChange={onChange}>
            <option value="">SELECT RANK</option>
            {RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="joinRequestContact">CONTACT</label>
          <input id="joinRequestContact" name="contact" value={form.contact} onChange={onChange} type="text" placeholder="Discord / Phone" />
        </div>
      </div>

      {error ? <p className="error-text is-visible">{error}</p> : null}

      <button className="pub-btn pub-btn-cyan" type="button" onClick={onSubmit}>
        SEND REQUEST
      </button>
    </Modal>
  );
}
