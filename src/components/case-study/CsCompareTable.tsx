import { motion, useReducedMotion } from 'framer-motion';

interface CsCompareTableProps {
  columns: string[];
  rows: { feature: string; values: (string | boolean)[] }[];
  title?: string;
}

const row = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

export default function CsCompareTable({ columns, rows, title }: CsCompareTableProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="cs-compare-table-wrap"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
    >
      {title && <p className="cs-compare-table-title">{title}</p>}
      <div className="cs-compare-table-scroll">
        <table className="cs-compare-table" aria-label={title || "Project comparison"}>
          <thead>
            <tr>
              <th scope="col" className="cs-ct-feature-col"><span className="sr-only">Feature</span></th>
              {columns.map(col => (
                <th scope="col" key={col} className="cs-ct-col-head">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <motion.tr key={r.feature} variants={reduceMotion ? undefined : row}>
                <th scope="row" className="cs-ct-feature">{r.feature}</th>
                {r.values.map((v, i) => (
                  <td key={i} className="cs-ct-cell" data-label={columns[i]}>
                    {typeof v === 'boolean' ? (
                      v ? (
                        <svg className="cs-ct-check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Yes" role="img">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg className="cs-ct-cross" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="No" role="img">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      )
                    ) : (
                      <span>{v}</span>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
