export type AgentState = 'idle' | 'walking' | 'talking' | 'thinking' | 'waving' | 'sleeping' | 'pointing'

interface Props {
  state: AgentState
  onClick: () => void
  chatOpen?: boolean
}

export default function AgentCharacter({ state, onClick, chatOpen }: Props) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={chatOpen ? 'Close chat' : 'Chat with Folio'}
      aria-haspopup="dialog"
      aria-expanded={chatOpen}
      className={`agent-trigger agent-trigger--${state} ${chatOpen ? 'agent-trigger--open' : ''}`}
    >
      <div className="agent-avatar">
        <img
          src="/Assets/character/me/2.webp"
          alt="Parth"
          className="agent-avatar-img"
          draggable={false}
        />
        <div className="agent-avatar-shadow" />
      </div>
    </button>
  )
}
