"use client";

import { useEffect, useRef, useState } from "react";
import {
  Save,
  Loader2,
  RotateCcw,
  Eye,
  Code,
  Info,
  Mail,
  KeyRound,
  PartyPopper,
  Box,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/animate-ui/components/animate/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EmailTemplate = {
  subject: string;
  html: string;
  isCustom: boolean;
};

type Templates = Record<string, EmailTemplate>;

const EMAIL_TYPES = [
  "model_trained",
  "headshots_ready",
  "welcome",
  "confirm_email",
  "reset_password",
] as const;

type EmailTypeKey = (typeof EMAIL_TYPES)[number];

const EMAIL_META: Record<
  EmailTypeKey,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    variables?: { name: string; description: string }[];
  }
> = {
  model_trained: {
    label: "Model Trained",
    description: "Sent when a user's AI model finishes training.",
    icon: Box,
  },
  headshots_ready: {
    label: "Headshots Ready",
    description: "Sent when generated headshots are ready to download.",
    icon: ImageIcon,
  },
  welcome: {
    label: "Welcome",
    description: "Sent to new users after email confirmation or OAuth sign-up.",
    icon: PartyPopper,
  },
  confirm_email: {
    label: "Confirm Email",
    description: "Sent during sign-up to verify the user's email address.",
    icon: Mail,
    variables: [
      {
        name: "{{confirm_url}}",
        description:
          "The unique confirmation link. Replaced at send-time with the actual URL.",
      },
    ],
  },
  reset_password: {
    label: "Reset Password",
    description: "Sent when a user requests a password reset.",
    icon: KeyRound,
    variables: [
      {
        name: "{{reset_url}}",
        description:
          "The unique password-reset link. Replaced at send-time with the actual URL.",
      },
    ],
  },
};

export default function EmailsContent({
  isTestAdmin = false,
}: {
  isTestAdmin?: boolean;
}) {
  const [templates, setTemplates] = useState<Templates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [resettingType, setResettingType] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [htmlEdits, setHtmlEdits] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<Record<string, "preview" | "code">>(
    () =>
      Object.fromEntries(
        EMAIL_TYPES.map((t) => [t, "preview" as const]),
      ) as Record<string, "preview" | "code">,
  );

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      if (!res.ok) throw new Error("Failed to load");
      const data: Templates = await res.json();
      setTemplates(data);
      setSubjects(
        Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v.subject]),
        ),
      );
      setHtmlEdits(
        Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.html])),
      );
    } catch {
      toast.error("Failed to load email templates");
    } finally {
      setIsLoading(false);
    }
  }

  /** Validate that custom HTML contains all required variables for the type. */
  function validateVariables(type: string, html: string): string | null {
    const meta = EMAIL_META[type as EmailTypeKey];
    if (!meta?.variables) return null;

    const missing = meta.variables.filter((v) => !html.includes(v.name));

    if (missing.length > 0) {
      return `Missing required variable${missing.length > 1 ? "s" : ""}: ${missing.map((v) => v.name).join(", ")}`;
    }
    return null;
  }

  async function handleSave(type: string) {
    // Validate required variables
    const validationError = validateVariables(type, htmlEdits[type] || "");
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSavingType(type);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject: subjects[type],
          html: htmlEdits[type],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast.success(
        `${EMAIL_META[type as EmailTypeKey]?.label || type} template saved`,
      );
      await fetchTemplates();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save template",
      );
    } finally {
      setSavingType(null);
    }
  }

  async function handleReset(type: string) {
    setResettingType(type);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) throw new Error("Failed to reset");

      toast.success(
        `${EMAIL_META[type as EmailTypeKey]?.label || type} template reset to default`,
      );
      await fetchTemplates();
    } catch {
      toast.error("Failed to reset template");
    } finally {
      setResettingType(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!templates) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">
        Failed to load email templates.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full max-w-4xl space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-black">Manage Emails</h2>
          <p className="text-muted-foreground mt-1">
            Customise the notification emails sent to your users. Edit the
            subject line and HTML, or reset any template back to its default.
          </p>
        </div>

        <Tabs defaultValue="model_trained">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList>
              {EMAIL_TYPES.map((type) => {
                const meta = EMAIL_META[type];
                const Icon = meta.icon;
                return (
                  <TabsTrigger key={type} value={type}>
                    <Icon className="mr-1.5 h-3.5 w-3.5" />
                    {meta.label}
                    {templates[type]?.isCustom && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContents>
            {EMAIL_TYPES.map((type) => {
              const meta = EMAIL_META[type];
              return (
                <TabsContent key={type} value={type}>
                  <div className="space-y-5 pt-4">
                    {/* Description + variable info */}
                    <div className="rounded-xl border border-gray-200/60 bg-gray-50/50 px-4 py-3 overflow-visible">
                      <p className="text-sm text-gray-600">
                        {meta.description}
                      </p>
                      {meta.variables && meta.variables.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {meta.variables.map((v) => (
                            <Tooltip key={v.name}>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 cursor-help">
                                  <code className="font-mono">{v.name}</code>
                                  <Info className="h-3 w-3 text-blue-400" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-xs text-xs bg-white text-gray-700 border border-gray-200 shadow-md"
                              >
                                {v.description}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          <span className="text-xs text-gray-400 self-center">
                            — required in custom HTML
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <Input
                        value={subjects[type] || ""}
                        onChange={(e) =>
                          setSubjects((s) => ({
                            ...s,
                            [type]: e.target.value,
                          }))
                        }
                        placeholder="Email subject line..."
                      />
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Template
                      </label>
                      <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5">
                        <button
                          onClick={() =>
                            setViewMode((m) => ({
                              ...m,
                              [type]: "preview",
                            }))
                          }
                          className={`flex items-center gap-1 rounded-md hover:cursor-pointer px-2.5 py-1 text-xs font-medium transition-colors ${
                            viewMode[type] === "preview"
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <button
                          onClick={() =>
                            setViewMode((m) => ({ ...m, [type]: "code" }))
                          }
                          className={`flex items-center gap-1 rounded-md hover:cursor-pointer px-2.5 py-1 text-xs font-medium transition-colors ${
                            viewMode[type] === "code"
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Code className="h-3 w-3" />
                          HTML
                        </button>
                      </div>
                    </div>

                    {/* Preview / Editor */}
                    {viewMode[type] === "preview" ? (
                      <EmailPreview html={htmlEdits[type] || ""} />
                    ) : (
                      <textarea
                        value={htmlEdits[type] || ""}
                        onChange={(e) =>
                          setHtmlEdits((h) => ({
                            ...h,
                            [type]: e.target.value,
                          }))
                        }
                        className="h-96 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
                        spellCheck={false}
                      />
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleSave(type)}
                        disabled={isTestAdmin || savingType === type}
                        size="sm"
                      >
                        {savingType === type ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Save Template
                      </Button>

                      {templates[type]?.isCustom && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReset(type)}
                          disabled={isTestAdmin || resettingType === type}
                        >
                          {resettingType === type ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Reset to Default
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </TabsContents>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function EmailPreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <iframe
        ref={iframeRef}
        title="Email preview"
        className="h-125 w-full bg-white"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
