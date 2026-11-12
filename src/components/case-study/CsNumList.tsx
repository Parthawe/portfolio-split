import type { ReactNode } from "react";

interface CsNumListProps {
  items: ReactNode[];
}

export default function CsNumList({ items }: CsNumListProps) {
  return (
    <ol className="cs-num-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}
