import type { SizeTable as SizeTableData } from "@/lib/size-guide";

export function SizeTable({ table }: { table: SizeTableData }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em]">{table.title}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="bg-ink text-paper">
              {table.columns.map((c) => (
                <th key={c} scope="col" className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={String(row[0])} className="border-b border-line even:bg-soft">
                {row.map((cell, i) => (
                  <td key={i} className={i === 0 ? "px-3 py-2.5 font-semibold" : "px-3 py-2.5 tabular-nums"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
