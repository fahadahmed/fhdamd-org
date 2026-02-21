import { Heading } from '../../ui'
import './testimonials.css'
export default function Testimonials() {
  return (
    <div className="testimonials-slice">
      <img src="/icons/icon-testimonials.svg" alt="Stars" />
      <Heading variant="section">What our people are saying about us?</Heading>
      <div className="testimonials-container">
        <div className="testimonial-card">
          <img src="/icons/icon-user.svg" alt="User Profile" />
          <div>
            <p>“Finally, a PDF tool that’s honest about pricing. I pay only when I actually use it — no subscriptions, no surprises.”</p>
            <h4>- Samia Akhtar, Senior Claims Consultant.</h4>
          </div>
        </div>
        <div className="testimonial-card">
          <img src="/icons/icon-user.svg" alt="User Profile" />
          <div>
            <p>“The credit-based pay-per-use model is incredibly transparent. I know exactly what each action costs before I click.”</p>
            <h4>- Brendan Lawrie, Partner - Big 4 Consultancy.</h4>
          </div>
        </div>
        <div className="testimonial-card">
          <img src="/icons/icon-user.svg" alt="User Profile" />
          <div>
            <p>“Most PDF tools feel bloated. This one does exactly what it promises, charges fairly, and gets out of the way.”</p>
            <h4>- Sean Kempen, Real Estate Agent.</h4>
          </div>
        </div>
        <div className="testimonial-card">
          <img src="/icons/icon-user.svg" alt="User Profile" />
          <div>
            <p>“Clean interface, no learning curve. I merged and converted my files in seconds without reading a single guide.”</p>
            <h4>- Patricia Widjojo, Paralegal</h4>
          </div>
        </div>
      </div>
    </div>
  )
}