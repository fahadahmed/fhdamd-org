import { Accordion } from "../../ui";
import { type Faq } from "../../../utils"
import './faqs.css';

type FaqsProps = {
  items: Faq[];
};

export default function Faqs({ items }: FaqsProps) {
  return <div className="faqs-section">
    <h2>Frequently Asked Questions (FAQs)</h2>
    <Accordion items={items} />
  </div>;
}