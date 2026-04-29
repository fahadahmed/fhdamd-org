import './emptystate.css'

export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="empty-state-container">
      {children}
    </div>
  )
}