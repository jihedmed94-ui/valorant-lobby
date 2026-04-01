import Modal from '../common/Modal';

export default function RequestsModal({ isOpen, onClose, requests, onApprove, onReject, onCopyCode }) {
  return (
    <Modal isOpen={isOpen} title="REQUESTS INBOX" onClose={onClose} wide>
      <div className="requests-layout">
        <div>
          <p className="mini-label">INCOMING</p>
          <div className="request-list">
            {requests.incoming.length ? (
              requests.incoming.map((request) => (
                <article key={request.id} className="request-card">
                  <h4>{request.riotId}</h4>
                  <p>{request.lobbyName}</p>
                  <p>RANK: {request.rank}</p>
                  <p>CONTACT: {request.contact}</p>
                  <div className="request-card-actions">
                    <button className="request-btn approved" type="button" onClick={() => onApprove(request.id)}>
                      APPROVE
                    </button>
                    <button className="request-btn pending" type="button" onClick={() => onReject(request.id)}>
                      REJECT
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>NO REQUESTS</h3>
                <p>Incoming approvals will appear here.</p>
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="mini-label">YOUR REQUESTS</p>
          <div className="request-list">
            {requests.outgoing.length ? (
              requests.outgoing.map((request) => (
                <article key={request.id} className="request-card">
                  <h4>{request.lobbyName}</h4>
                  <p>{request.riotId} / {request.rank}</p>
                  <p>{request.contact}</p>
                  <span className={`request-status ${request.status.toLowerCase()}`}>{request.status}</span>
                  {request.status === 'APPROVED' && request.partyCode ? (
                    <div className="request-card-actions">
                      <button className="request-btn approved" type="button" onClick={() => onCopyCode(request.partyCode)}>
                        COPY CODE
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>NO HISTORY</h3>
                <p>Your sent requests will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
