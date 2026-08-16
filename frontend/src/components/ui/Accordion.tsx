'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface AccordionItem {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="divide-y divide-champagne/60 border-y border-champagne/60">
      {items.map((item, i) => (
        <AccordionRow key={i} item={item} />
      ))}
    </div>
  );
}

function AccordionRow({ item }: { item: AccordionItem }) {
  const [open, setOpen] = useState(item.defaultOpen ?? false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-cocoa">{item.title}</span>
        {open ? (
          <Minus className="h-4 w-4 text-gold" />
        ) : (
          <Plus className="h-4 w-4 text-clay" />
        )}
      </button>
      {open && (
        <div className="animate-fade-in pb-5 text-sm leading-relaxed text-clay">{item.content}</div>
      )}
    </div>
  );
}
