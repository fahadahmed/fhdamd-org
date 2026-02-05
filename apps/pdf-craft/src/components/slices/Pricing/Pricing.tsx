import { Button } from '../../ui';
import './pricing.css'

export default function Pricing() {
  return <div className="pricing">
    <h2 className='pricing-heading'>Simple Pricing</h2>
    <p className='pricing-byline'>Buy credits once, use them anytime. No subscriptions, no expiry.</p>
    <div className="pricing-cards">
      <div className="pricing-card">
        <h3>$1.49</h3>
        <p><small>5 credits<br />$0.30 per credit</small></p>
        <Button kind="secondary" type="linkButton" url="/signup" text="Buy Credits" />
        <ul>
          <li>1 operation</li>
          <li>Credits never expire</li>
          <li>No subscriptions needed</li>
          <li>Prices in USD</li>
        </ul>
      </div>
      <div className="pricing-card">
        <h3>$4.99</h3>
        <p><small>20 credits<br />$0.25 per credit</small></p>
        <Button kind="primary" type="linkButton" url="/signup" text="Buy Credits" />
        <ul>
          <li>5 operations</li>
          <li>Credits never expire</li>
          <li>No subscriptions needed</li>
          <li>Prices in USD</li>
        </ul>
      </div>
      <div className="pricing-card">
        <h3>$9.99</h3>
        <p><small>50 credits<br />$0.20 per credit</small></p>
        <Button kind="secondary" type="linkButton" url="/signup" text="Buy Credits" />
        <ul>
          <li>10 operations</li>
          <li>Credits never expire</li>
          <li>No subscriptions needed</li>
          <li>Prices in USD</li>
        </ul>
      </div>
    </div>
  </div>;
}