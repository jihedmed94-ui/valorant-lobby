export default function Modal({ isOpen, title, onClose, children, wide = false, cyan = false }) {
  if (!isOpen) {
    return null;
  }

  const className = ['modal-card', wide ? 'modal-card-wide' : '', cyan ? 'modal-card-cyan' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="modal-overlay is-open" onClick={onClose}>
      <div className={className} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="x-close" type="button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
