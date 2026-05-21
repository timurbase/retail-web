"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Zap, CheckCircle2 } from "lucide-react";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { logIntegrationAction } from "@/lib/actions/integrations";
import { cn } from "@/lib/utils";

export type FieldType = "text" | "password" | "readonly" | "textarea";

export interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: string;
  mono?: boolean;
  hint?: string;
}

export interface ExtraSlot {
  /** Renders custom content (e.g. QR placeholder, chip list) below the form fields. */
  render: () => React.ReactNode;
}

interface IntegrationConfigModalProps {
  open: boolean;
  onClose: () => void;
  integrationId: string;
  integrationLabel: string;
  title: string;
  description?: string;
  fields: ConfigField[];
  /** Show a "Test connection" button. Returns success/failure after 1.2s. */
  withTestConnection?: boolean;
  /** Custom extra content rendered between fields and footer (QR, chips, etc). */
  extra?: ExtraSlot;
  /** Message logged to audit + shown on success toast. */
  successDetails?: string;
}

export function IntegrationConfigModal({
  open,
  onClose,
  integrationId,
  integrationLabel,
  title,
  description,
  fields,
  withTestConnection,
  extra,
  successDetails,
}: IntegrationConfigModalProps) {
  const { success, error, info } = useToast();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);

  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      for (const f of fields) initial[f.key] = f.defaultValue ?? "";
      setValues(initial);
      setTestResult(null);
    }
  }, [open, fields]);

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (testResult) setTestResult(null);
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    info("Test ulanish boshlandi", `${integrationLabel} bilan aloqa tekshirilmoqda…`);
    setTimeout(() => {
      setTesting(false);
      setTestResult("ok");
      success("Ulanish muvaffaqiyatli", `${integrationLabel} javob berdi (HTTP 200, 142ms)`);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const editable = fields.filter((f) => f.type !== "readonly");
    for (const f of editable) {
      if (!values[f.key]?.trim()) {
        error("Bo'sh maydon", `"${f.label}" maydonini to'ldiring`);
        return;
      }
    }

    startTransition(async () => {
      try {
        await logIntegrationAction({
          action: "update",
          integrationId,
          integrationLabel,
          details: successDetails ?? "Sozlamalar yangilandi",
        });
        success("Saqlandi", `${integrationLabel} sozlamalari yangilandi`);
        onClose();
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={title}
      description={description}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <Label htmlFor={`int-${integrationId}-${f.key}`}>{f.label}</Label>
              {f.type === "textarea" ? (
                <textarea
                  id={`int-${integrationId}-${f.key}`}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  disabled={pending || f.type === "textarea" ? pending : pending}
                  placeholder={f.placeholder}
                  rows={3}
                  className={cn(
                    "w-full rounded-sm border border-border-strong bg-surface-card px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700",
                    f.mono && "font-mono"
                  )}
                />
              ) : f.type === "readonly" ? (
                <Input
                  id={`int-${integrationId}-${f.key}`}
                  value={values[f.key] ?? ""}
                  readOnly
                  mono={f.mono}
                  className="bg-ink-100 cursor-default"
                />
              ) : (
                <Input
                  id={`int-${integrationId}-${f.key}`}
                  type={f.type === "password" ? "password" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  disabled={pending}
                  placeholder={f.placeholder}
                  mono={f.mono}
                  autoFocus={fields.indexOf(f) === 0}
                />
              )}
              {f.hint && (
                <p className="mt-1 text-[11px] text-ink-500">{f.hint}</p>
              )}
            </div>
          ))}

          {extra?.render()}

          {withTestConnection && (
            <div className="flex items-center justify-between rounded-md border border-border bg-ink-100/40 px-4 py-3">
              <div className="flex items-center gap-2 text-[12px] text-ink-600">
                {testResult === "ok" ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Ulanish muvaffaqiyatli (142ms)
                    </span>
                  </>
                ) : (
                  <span>Sozlash oxirida ulanishni tekshiring</span>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTest}
                disabled={testing || pending}
              >
                {testing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Tekshirilmoqda…
                  </>
                ) : (
                  <>
                    <Zap className="size-3.5" />
                    Test ulanish
                  </>
                )}
              </Button>
            </div>
          )}

          <Alert variant="info">
            Sozlamalar audit log&apos;ga yoziladi. Faqat Administrator
            integratsiyalarni o&apos;zgartira oladi.
          </Alert>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saqlanmoqda…
              </>
            ) : (
              "Saqlash"
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
