import { ExternalLink, GitBranch, Heart, ShieldCheck, Sparkles, Star, Waves } from "lucide-react";
import { useLatestCommit, useVersionMetadata } from "./lib/metadata/hooks";
import { appLinks, buildInfo } from "./lib/metadata/static";

export function App() {
  const version = useVersionMetadata();
  const latestCommit = useLatestCommit();

  const commitLabel = latestCommit.data?.shortSha ?? version.data?.commit.slice(0, 12) ?? buildInfo.commit;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
          <a
            className="flex items-center gap-3 font-semibold"
            href={appLinks.pagesUrl}
            aria-label="Podcast Polisher"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-teal text-white shadow-soft">
              <Waves aria-hidden="true" size={22} />
            </span>
            <span>Podcast Polisher WASM</span>
          </a>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Project links">
            <a className="icon-link" href={appLinks.repositoryUrl} target="_blank" rel="noreferrer">
              <Star aria-hidden="true" size={18} />
              <span>Star on GitHub</span>
              <ExternalLink aria-hidden="true" size={14} />
            </a>
            <a className="icon-link support" href={appLinks.supportUrl} target="_blank" rel="noreferrer">
              <Heart aria-hidden="true" size={18} />
              <span>Support via PayPal</span>
              <ExternalLink aria-hidden="true" size={14} />
            </a>
          </nav>
        </header>

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-center">
          <section className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-md border border-teal/20 bg-panel px-3 py-2 text-sm font-semibold text-teal">
              <ShieldCheck aria-hidden="true" size={16} />
              Files stay in your browser
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-black leading-none sm:text-6xl lg:text-7xl">
                Polish a podcast without uploading it.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/76">
                A static GitHub Pages app for podcast cleanup: denoise, speech-focused filtering, compression,
                true-peak limiting, and EBU R128 loudness normalization in one local browser workflow.
              </p>
            </div>

            <dl className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              <Metric label="Target" value="-16 LUFS" />
              <Metric label="Privacy" value="No upload" />
              <Metric label="Runtime" value="Static" />
            </dl>
          </section>

          <section
            className="rounded-lg border border-ink/10 bg-panel p-4 shadow-soft sm:p-5"
            aria-label="App status"
          >
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Processing workbench</h2>
                  <p className="mt-1 text-sm leading-6 text-ink/70">
                    The audio pipeline module is being attached in the next commit. This shell is already
                    Pages-ready.
                  </p>
                </div>
                <Sparkles className="text-coral" aria-hidden="true" />
              </div>

              <div className="waveform" aria-hidden="true">
                {Array.from({ length: 48 }, (_, index) => (
                  <span key={index} style={{ height: `${28 + ((index * 17) % 68)}%` }} />
                ))}
              </div>

              <div className="grid gap-3 rounded-md bg-paper p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink/70">Version</span>
                  <strong>{version.data?.version ?? buildInfo.version}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-ink/70">
                    <GitBranch aria-hidden="true" size={15} />
                    Commit
                  </span>
                  <a
                    className="font-semibold text-teal underline-offset-4 hover:underline"
                    href={`${appLinks.repositoryUrl}/commit/${latestCommit.data?.sha ?? version.data?.commit ?? buildInfo.commit}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {commitLabel}
                  </a>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink/70">Pages URL</span>
                  <a
                    className="font-semibold text-teal underline-offset-4 hover:underline"
                    href={appLinks.pagesUrl}
                  >
                    {new URL(appLinks.pagesUrl).hostname}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-panel p-4">
      <dt className="text-xs font-bold uppercase tracking-wide text-ink/55">{label}</dt>
      <dd className="mt-2 text-2xl font-black">{value}</dd>
    </div>
  );
}
