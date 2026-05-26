export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-cream">
      <div className="container-site flex min-h-[100dvh] items-center">
        <div className="max-w-2xl space-y-10 py-32">
          <p className="eyebrow">A tool of The UpHer Room</p>

          <h1 className="display text-6xl text-ink sm:text-7xl md:text-8xl">
            alchemy
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-muted">
            A bias-blind strategic partnership platform. Mission first.
            Identity revealed at the meeting.
          </p>

          <div className="flex items-center gap-3 pt-4">
            <span className="alias-code rounded-full bg-primary-bg px-3 py-1 text-xs text-primary-fg">
              Partner Violet-42
            </span>
            <span className="text-xs text-muted">— example alias</span>
          </div>
        </div>
      </div>
    </main>
  );
}
