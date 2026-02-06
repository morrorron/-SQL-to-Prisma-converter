"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Github, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SAMPLE_SQL, sqlToPrismaSchema } from "@/lib/sql-to-prisma";
import { useToast } from "@/hooks/use-toast";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type PrimaryKeyStrategy = "autoIncrement" | "cuid";

export default function HomePage() {
  const [sql, setSql] = useState(SAMPLE_SQL);
  const [pkStrategy, setPkStrategy] = useState<PrimaryKeyStrategy>("autoIncrement");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const prisma = useMemo(() => {
    const baseSchema = sqlToPrismaSchema(sql);
    if (!baseSchema) return "";

    if (pkStrategy === "autoIncrement") return baseSchema;

    // Replace default id strategy for String models when cuid is selected.
    return baseSchema.replace(/@default\(autoincrement\(\)\)/g, "@default(cuid())");
  }, [sql, pkStrategy]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prisma || "");
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Your Prisma schema is ready to paste into schema.prisma."
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access. Please copy manually."
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-400/60">
              <span className="text-xs font-semibold tracking-tight text-sky-300">
                SQL
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-100">
                SQL to Prisma
              </span>
              <span className="text-[11px] text-slate-400">
                Paste CREATE TABLE → get Prisma schema
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-[11px] text-slate-400 md:flex">
              <span className="rounded-full bg-slate-900/80 px-2 py-1 font-mono">
                100% client-side
              </span>
              <span className="rounded-full bg-slate-900/80 px-2 py-1 font-mono">
                App Router · TS
              </span>
            </div>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="View source on GitHub"
              >
                <Github className="h-4 w-4 text-slate-300" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-6 pt-4 md:pt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-sm font-semibold tracking-tight text-slate-100">
              SQL → Prisma Schema Converter
            </h1>
            <p className="text-[11px] text-slate-400">
              Your SQL never leaves the browser. Instant conversion from raw CREATE TABLE
              statements to modern Prisma models.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Primary key strategy</span>
            <Select
              value={pkStrategy}
              onValueChange={(value) => setPkStrategy(value as PrimaryKeyStrategy)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="autoIncrement">
                  Int autoincrement()
                </SelectItem>
                <SelectItem value="cuid">
                  String cuid()
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="split-pane flex-1">
          {/* Left: SQL input */}
          <Card className="flex min-h-[320px] flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>Input · SQL</CardTitle>
              <CardDescription>
                Paste your <code className="font-mono text-[11px]">CREATE TABLE</code>{" "}
                statements here. Multiple tables are supported.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
              <MonacoEditor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={sql}
                onChange={(value) => setSql(value ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  lineNumbers: "on",
                  folding: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  tabSize: 2
                }}
              />
            </CardContent>
          </Card>

          {/* Right: Prisma output */}
          <Card className="flex min-h-[320px] flex-col overflow-hidden">
            <CardHeader className="flex items-center justify-between space-y-0">
              <div>
                <CardTitle>Output · Prisma schema</CardTitle>
                <CardDescription>
                  Drop this straight into your{" "}
                  <code className="font-mono text-[11px]">schema.prisma</code> file.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-[11px]"
                onClick={handleCopy}
                disabled={!prisma}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy schema
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
              <MonacoEditor
                height="100%"
                defaultLanguage="prisma"
                theme="vs-dark"
                value={prisma}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  lineNumbers: "on",
                  folding: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  tabSize: 2
                }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

