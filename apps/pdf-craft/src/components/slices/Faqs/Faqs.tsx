import { Accordion, Heading } from "../../ui";
import { type Faq } from "../../../utils"
import './faqs.css';

type FaqsProps = {
  items: Faq[];
};

export default function Faqs({ items }: FaqsProps) {
  return <div className="faqs-section">
    <Heading variant='section'>Frequently Asked Questions (FAQs)</Heading>
    <Accordion items={items} />
  </div>;
}