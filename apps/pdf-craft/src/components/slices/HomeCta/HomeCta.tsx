import { Button } from '../..'
import './homeCta.css'

export default function HomeCta() {
  return (
    <div className="home-cta">
      <div>
        <h1 className="cta-heading">Simple PDF Tools</h1>
        <p className="cta-byline">Merge PDFs and convert images to PDF in seconds. Pay only<br />for what you use, no subscriptions required.</p>
      </div>
      <div className="button-container">
        <Button kind="primary" type="linkButton" url="/signin" size="xl" text="Get Started" />
        <Button kind="tertiary" type="linkButton" url="/signup" text="Already have an account? Login" />
      </div>
    </div>
  )
}