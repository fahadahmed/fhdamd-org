import { actions } from 'astro:actions'
import './header.css'

export default function Header() {
  return (
    <div className="header">
      <div><strong>PDF-Craft</strong></div>
      <form action={actions.user.signOutUser}>
        <button type="submit">Logout</button>
      </form>
    </div>
  )
}