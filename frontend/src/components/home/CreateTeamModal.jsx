import Modal from '../common/Modal';

export default function CreateTeamModal({ isOpen, onClose, form, onChange, onSubmit, error, mode = 'create' }) {
  const isRegisterMode = mode === 'register';

  return (
    <Modal isOpen={isOpen} title={isRegisterMode ? 'REGISTER TEAM' : 'CREATE TEAM PAGE'} onClose={onClose} cyan>
      <label htmlFor="teamNameInput">TEAM NAME</label>
      <input id="teamNameInput" name="name" value={form.name} onChange={onChange} type="text" placeholder="Team Name" />

      <div className="row">
        <div className="field">
          <label htmlFor="teamTagInput">TAG</label>
          <input id="teamTagInput" name="tag" value={form.tag} onChange={onChange} type="text" placeholder="VLT" />
        </div>
        {!isRegisterMode ? (
          <div className="field">
            <label htmlFor="teamLookingInput">LOOKING FOR</label>
            <input
              id="teamLookingInput"
              name="lookingFor"
              value={form.lookingFor}
              onChange={onChange}
              type="text"
              placeholder="Duelist / IGL / Flex"
            />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="teamDescriptionInput">VALORANT ID</label>
            <input
              id="teamDescriptionInput"
              name="description"
              value={form.description}
              onChange={onChange}
              type="text"
              placeholder="Player#1234"
            />
          </div>
        )}
      </div>

      <label htmlFor="teamContactInput">CONTACT</label>
      <input id="teamContactInput" name="contact" value={form.contact} onChange={onChange} type="text" placeholder="Discord / Phone / Instagram" />

      {!isRegisterMode ? (
        <>
          <label htmlFor="teamDescriptionInput">DESCRIPTION</label>
          <input
            id="teamDescriptionInput"
            name="description"
            value={form.description}
            onChange={onChange}
            type="text"
            placeholder="Competitive Tunisian roster looking for serious players."
          />
        </>
      ) : null}

      {error ? <p className="error-text is-visible">{error}</p> : null}

      <button className="pub-btn pub-btn-cyan" type="button" onClick={onSubmit}>
        {isRegisterMode ? 'REGISTER TEAM' : 'CREATE TEAM PAGE'}
      </button>
    </Modal>
  );
}
