'use client'
import { useState } from "react";
import './accordion.css'

type AccordionItem = {
  title: string;
  content: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export default function Accordion({ items }: AccordionProps) {

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div className="accordion-item" key={index}>
            <button
              className="accordion-header"
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>+</span>
            </button>

            {isOpen && (
              <div className="accordion-content">
                <p>{item.content}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}