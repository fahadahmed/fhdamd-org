import { Heading } from '../../ui';
import './howItWorks.css'

export default function HowItWorks() {
  return <div className="how-it-works">
    <Heading variant='section'>How It Works</Heading>
    <img src="/icons/diagram-how-it-works.svg" alt="How it works" className="responsive-image" />
  </div>;
}