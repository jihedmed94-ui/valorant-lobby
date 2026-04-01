import { PRO_CITY_RANKS, RANKS, SERVERS } from '../../lib/constants';
import Modal from '../common/Modal';

export default function CreateLobbyModal({ isOpen, onClose, form, onChange, onSubmit, error }) {
  const needsProPassword = PRO_CITY_RANKS.includes(form.rank);
  const isSubmitDisabled =
    !form.name.trim() ||
    !form.code.trim() ||
    !form.server ||
    !form.rank ||
    (needsProPassword && !form.proPassword.trim());

  return (
    <Modal isOpen={isOpen} title="CREATE NEW LOBBY" onClose={onClose}>
      <label htmlFor="pName">RIOT ID</label>
      <input id="pName" name="name" value={form.name} onChange={onChange} type="text" placeholder="Gamer#1234" />

      <label htmlFor="pCode">PARTY CODE</label>
      <input id="pCode" name="code" value={form.code} onChange={onChange} type="text" placeholder="ABC12" />

      <div className="row">
        <div className="field">
          <label htmlFor="pHave">WE ARE</label>
          <select id="pHave" name="have" value={form.have} onChange={onChange}>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} Player{value > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pNeed">NEED</label>
          <select id="pNeed" name="need" value={form.need} onChange={onChange}>
            {[0, 1, 2, 3, 4].map((value) => (
              <option key={value} value={value}>
                {value === 0 ? 'Full Team' : `Need ${value}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="pServer">SERVER</label>
          <select id="pServer" name="server" value={form.server} onChange={onChange}>
            {SERVERS.map((server) => (
              <option key={server} value={server}>
                {server}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pRank">RANK</label>
          <select id="pRank" name="rank" value={form.rank} onChange={onChange}>
            {RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>
      </div>

      {needsProPassword ? (
        <>
          <label htmlFor="pProPassword">PRO CITY PASSWORD</label>
          <input
            id="pProPassword"
            name="proPassword"
            value={form.proPassword}
            onChange={onChange}
            type="password"
            placeholder="Enter Pro City password"
          />
        </>
      ) : null}

      {error ? <p className="error-text is-visible">{error}</p> : null}

      <button className="pub-btn" type="button" onClick={onSubmit} disabled={isSubmitDisabled}>
        PUBLISH LOBBY
      </button>
    </Modal>
  );
}
