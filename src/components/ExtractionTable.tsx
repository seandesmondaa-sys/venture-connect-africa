import { statusTone, type FieldStatus } from "@/lib/ac-framework";

export type ExtractedField = {
  id: string;
  field_key: string;
  field_label: string;
  value: string | null;
  status: string;
  source_note: string | null;
  verified: boolean;
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusTone(
        status as FieldStatus,
      )}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function ExtractionTable({ fields }: { fields: ExtractedField[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/60 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Field</th>
            <th className="px-4 py-3 font-semibold">Captured information</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.id} className="border-t border-border align-top">
              <td className="w-48 px-4 py-3 font-medium">{field.field_label}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {field.value ?? <span className="italic">Not found</span>}
                {field.source_note ? (
                  <p className="mt-1 text-xs text-muted-foreground/70">{field.source_note}</p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={field.status} />
                {field.verified ? (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-primary">
                    Verified
                  </p>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
