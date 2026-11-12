import type { ReactNode } from "react";

interface CsBodyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function CsBody({ children, className, style }: CsBodyProps) {
  return (
    <div className={`cs-body reveal${className ? ` ${className}` : ''}`} style={style}>
      {children}
    </div>
  );
}
