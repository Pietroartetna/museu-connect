import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { StoredImage } from "@/components/StoredImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "datetime"
  | "checkbox"
  | "select"
  | "combo"
  | "image";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
};

type Row = Record<string, unknown> & { id: string };

type CrudSectionProps = {
  table: "rooms" | "artists" | "events" | "galleries" | "site_links";
  queryKey: string;
  title: string;
  description: string;
  select: string;
  orderBy: string;
  ascending?: boolean;
  fields: Field[];
  titleField: string;
  imageField?: string;
  renderExtra?: (row: Row) => React.ReactNode;
};

export function CrudSection({
  table,
  queryKey,
  title,
  description,
  select,
  orderBy,
  ascending = true,
  fields,
  titleField,
  imageField,
  renderExtra,
}: CrudSectionProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: rows } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select(select).order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Elemento eliminato");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: () => toast.error("Eliminazione non riuscita"),
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        if (field.type === "image") continue;
        const raw = values[field.name];
        if (field.type === "checkbox") payload[field.name] = !!raw;
        else if (raw === undefined || raw === "") payload[field.name] = null;
        else if (field.type === "number") payload[field.name] = Number(raw);
        else if (field.type === "datetime") payload[field.name] = new Date(String(raw)).toISOString();
        else payload[field.name] = String(raw).trim();
      }
      if (imageField && file) {
        payload[imageField] = await uploadFile("museo", `${table}/${Date.now()}`, file);
      }
      const { error } = await supabase.from(table).insert(payload as never);
      if (error) throw error;
      toast.success("Elemento creato");
      setValues({});
      setFile(null);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch {
      toast.error("Creazione non riuscita: controlla i campi obbligatori");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <form onSubmit={create} className="grid gap-4 rounded-xl border bg-card p-5 shadow-soft md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={`space-y-1.5 ${field.type === "textarea" ? "md:col-span-2" : ""}`}
          >
            <Label htmlFor={`${table}-${field.name}`}>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                id={`${table}-${field.name}`}
                value={String(values[field.name] ?? "")}
                required={field.required}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              />
            ) : field.type === "select" ? (
              <select
                id={`${table}-${field.name}`}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={String(values[field.name] ?? "")}
                required={field.required}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              >
                <option value="">Seleziona…</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "combo" ? (
              <ComboField
                id={`${table}-${field.name}`}
                required={field.required}
                existing={Array.from(
                  new Set(
                    (rows ?? [])
                      .map((r) => String(r[field.name] ?? "").trim())
                      .filter((v) => v.length > 0),
                  ),
                ).sort()}
                value={String(values[field.name] ?? "")}
                onChange={(v) => setValues({ ...values, [field.name]: v })}
              />
            ) : field.type === "checkbox" ? (
              <div className="flex h-9 items-center">
                <input
                  id={`${table}-${field.name}`}
                  type="checkbox"
                  className="size-4"
                  checked={!!values[field.name]}
                  onChange={(e) => setValues({ ...values, [field.name]: e.target.checked })}
                />
              </div>
            ) : field.type === "image" ? (
              <Input
                id={`${table}-${field.name}`}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            ) : (
              <Input
                id={`${table}-${field.name}`}
                type={
                  field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"
                }
                step={field.type === "number" ? "any" : undefined}
                value={String(values[field.name] ?? "")}
                required={field.required}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2">
          <Button type="submit" disabled={busy}>
            Aggiungi
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {(rows ?? []).map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-4 rounded-lg border bg-card p-3 shadow-soft"
          >
            {imageField ? (
              <StoredImage
                reference={(row[imageField] as string | null) ?? null}
                alt={String(row[titleField] ?? "")}
                className="size-14 shrink-0 rounded-md"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{String(row[titleField] ?? "")}</p>
              {renderExtra ? (
                <div className="text-xs text-muted-foreground">{renderExtra(row)}</div>
              ) : null}
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Elimina"
              onClick={() => remove.mutate(row.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
        {(rows?.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nessun elemento presente.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ComboField({
  id,
  existing,
  value,
  required,
  onChange,
}: {
  id: string;
  existing: string[];
  value: string;
  required?: boolean;
  onChange: (v: string) => void;
}) {
  const [isNew, setIsNew] = useState(existing.length === 0);

  return (
    <div className="space-y-2">
      <select
        id={id}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={isNew ? "__new__" : value}
        onChange={(e) => {
          if (e.target.value === "__new__") {
            setIsNew(true);
            onChange("");
          } else {
            setIsNew(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">Categoria esistente…</option>
        {existing.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="__new__">+ Nuova categoria</option>
      </select>
      {isNew ? (
        <Input
          placeholder="Nome della nuova categoria"
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}
    </div>
  );
}
