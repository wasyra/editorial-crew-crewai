"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@vetaui/atoms";
import { Banner, EmptyState, Stat } from "@vetaui/molecules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vetaui/organisms";
import { Container, Heading, Text } from "@vetaui/templates";
import {
  Download,
  Newspaper,
  PenLine,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { GenerationProgress } from "@/components/generation-progress";
import { ToneSelect } from "@/components/tone-select";
import { generatePost, checkHealth } from "@/lib/api";
import { useGenerationTimer } from "@/lib/use-generation-timer";
import { useHydrated } from "@/lib/use-hydrated";
import { useMediaQuery } from "@/lib/use-media-query";
import { type EditorialResult, type ToneOption } from "@/lib/types";

const EXAMPLE_TOPICS = [
  "IA generativa en hospitales",
  "Ciberseguridad en la nube",
  "Regulación de IA en la UE",
];

const AGENTS = [
  { icon: Search, name: "Investigador", role: "Tavily · noticias recientes" },
  { icon: PenLine, name: "Redactor", role: "Borrador LinkedIn" },
  { icon: Sparkles, name: "Editor", role: "Feedback + versión final" },
];

function extractFinalPost(finalMd: string): string {
  const marker = "## Post final (LinkedIn)";
  const idx = finalMd.indexOf(marker);
  if (idx >= 0) {
    return finalMd.slice(idx + marker.length).trim();
  }
  return finalMd;
}

function MarkdownBlock({ content }: { content: string }) {
  const html = content
    .replace(/^### (.*)$/gim, "<h3>$1</h3>")
    .replace(/^## (.*)$/gim, "<h2>$1</h2>")
    .replace(/^# (.*)$/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.*)$/gim, "<li>$1</li>")
    .replace(/\n/g, "<br />");

  return (
    <motion.div
      className="editorial-prose text-[var(--veta-fg)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function EditorialRoom() {
  const hydrated = useHydrated();
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const [topic, setTopic] = React.useState("");
  const [tone, setTone] = React.useState<ToneOption>("profesional");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const { elapsed, phase } = useGenerationTimer(loading);
  const [result, setResult] = React.useState<EditorialResult | null>(null);
  const [apiOnline, setApiOnline] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    checkHealth().then(setApiOnline);
  }, []);

  const cancelGenerate = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const runGenerate = async () => {
    if (!topic.trim()) return;
    setError(null);
    setLoading(true);
    setResult(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setResult(
        await generatePost(topic.trim(), tone, controller.signal),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const finalPost = result ? extractFinalPost(result.final) : "";

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.main
      className="editorial-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="editorial-grain" aria-hidden />

      <Container
        as="div"
        size="xl"
        padded={false}
        className="editorial-container relative z-[1]"
      >
        <motion.div className="editorial-page-stack">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="editorial-hero w-full min-w-0"
          >
            <div className="editorial-hero-badges">
              <Badge variant="accent">CrewAI · sequential</Badge>
              {hydrated && apiOnline === true && (
                <Badge variant="success">API :8000</Badge>
              )}
              {hydrated && apiOnline === false && (
                <Badge variant="warning">API offline</Badge>
              )}
            </div>
            <Heading
              as="h1"
              level={1}
              className="editorial-title mt-4 w-full min-w-0 sm:mt-5"
            >
              Sala editorial
            </Heading>
            <Text tone="muted" className="editorial-lead mt-3">
              Investigación, redacción y edición con{" "}
              <span className="font-medium text-[var(--editorial-copper)]">
                tres agentes
              </span>{" "}
              y componentes VetaUI.
            </Text>
          </motion.header>

          <motion.div className="editorial-agents-grid">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.name}
                className="min-w-0"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
              >
                <Card
                  className={`editorial-agent-card h-full w-full${loading && phase === i ? " editorial-agent-card--active" : ""}${loading && phase > i ? " editorial-agent-card--done" : ""}`}
                >
                  <CardContent className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                    <span className="editorial-agent-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11">
                      <agent.icon
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold tracking-tight break-words">
                        {agent.name}
                      </p>
                      <Text
                        tone="muted"
                        className="editorial-agent-role mt-1 text-xs sm:text-sm"
                      >
                        {agent.role}
                      </Text>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Card className="editorial-panel w-full overflow-hidden">
            <CardHeader className="editorial-panel-head border-b border-[var(--veta-border)] px-4 py-4 sm:px-6">
              <CardTitle className="flex min-w-0 items-center gap-2 text-base sm:text-lg">
                <Newspaper
                  className="h-5 w-5 shrink-0 text-[var(--editorial-copper)]"
                  aria-hidden
                />
                <span className="truncate">Nuevo encargo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <motion.div className="editorial-form-stack">
                <motion.div className="editorial-chips">
                  {EXAMPLE_TOPICS.map((ex) => (
                    <Button
                      key={ex}
                      variant="soft"
                      size="sm"
                      type="button"
                      onClick={() => setTopic(ex)}
                    >
                      {ex}
                    </Button>
                  ))}
                </motion.div>

                <motion.div className="editorial-form-grid">
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="topic">Tema</Label>
                    <Input
                      id="topic"
                      className="editorial-input-topic w-full"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ej: IA en hospitales"
                      disabled={loading}
                    />
                  </div>
                  <div className="editorial-tone-field min-w-0 space-y-2">
                    <Label htmlFor="tone">Tono</Label>
                    <ToneSelect
                      value={tone}
                      onChange={setTone}
                      disabled={loading}
                    />
                  </div>
                </motion.div>

                <div className="editorial-actions">
                  <Button
                    size="lg"
                    shape="pill"
                    variant="primary"
                    className="editorial-btn-primary"
                    disabled={!topic.trim() || loading}
                    onClick={runGenerate}
                    leftIcon={<Wand2 className="h-4 w-4 shrink-0" />}
                  >
                    {loading ? "Generación en curso…" : "Generar post"}
                  </Button>
                </div>

              </motion.div>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {loading && (
              <GenerationProgress
                key="generating"
                topic={topic.trim()}
                tone={tone}
                elapsed={elapsed}
                onCancel={cancelGenerate}
              />
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full min-w-0"
              >
                <Banner
                  tone="danger"
                  dismissible
                  onDismiss={() => setError(null)}
                >
                  {error}
                </Banner>
              </motion.div>
            )}

            {result && !loading && (
              <motion.section
                key="results"
                className="w-full min-w-0"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <motion.div className="editorial-stats-grid">
                  <Stat
                    label="Tiempo"
                    value={`${result.elapsed_seconds.toFixed(1)}s`}
                  />
                  <Stat label="Agentes" value="3" />
                  <Stat
                    label="Tema"
                    value={
                      <span className="editorial-stat-topic" title={result.topic}>
                        {result.topic}
                      </span>
                    }
                  />
                </motion.div>

                <Card className="editorial-panel w-full">
                  <Tabs defaultValue="research" className="w-full">
                    <motion.div className="editorial-tabs-scroll border-b border-[var(--veta-border)]">
                      <TabsList className="editorial-tabs-list editorial-panel-head h-auto min-h-[2.75rem] w-full justify-start rounded-none border-0 bg-transparent px-1 sm:w-max sm:min-w-full sm:px-4">
                        <TabsTrigger value="research">Investigación</TabsTrigger>
                        <TabsTrigger value="draft">Borrador</TabsTrigger>
                        <TabsTrigger value="final">Final</TabsTrigger>
                      </TabsList>
                    </motion.div>
                    <div className="editorial-panel-body">
                      <TabsContent value="research" className="mt-0">
                        <MarkdownBlock content={result.research} />
                      </TabsContent>
                      <TabsContent value="draft" className="mt-0">
                        <MarkdownBlock content={result.draft} />
                      </TabsContent>
                      <TabsContent value="final" className="mt-0">
                        <MarkdownBlock content={result.final} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>

                <Card className="editorial-panel mt-5 w-full sm:mt-6">
                  <CardHeader className="px-4 py-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg">
                      Copiar para LinkedIn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-5 sm:px-6 sm:pb-6">
                    <Textarea
                      readOnly
                      value={finalPost}
                      rows={isNarrow ? 8 : 10}
                      className="editorial-textarea min-h-[10rem] w-full"
                    />
                    <div className="editorial-download-row">
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        leftIcon={<Download className="h-4 w-4 shrink-0" />}
                        onClick={() => download("linkedin_post.md", finalPost)}
                      >
                        Descargar post
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        leftIcon={<Download className="h-4 w-4 shrink-0" />}
                        onClick={() =>
                          download(
                            "informe.md",
                            `# ${result.topic}\n\n${result.final}`,
                          )
                        }
                      >
                        Informe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <EmptyState
              className="w-full"
              title="Listo cuando tú lo estés"
              description="Define un tema y pulsa Generar post para ver el pipeline Investigador → Redactor → Editor."
            />
          )}
        </motion.div>
      </Container>
    </motion.main>
  );
}
