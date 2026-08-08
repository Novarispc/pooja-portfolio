import { readContent } from "@/lib/content";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import HeroScene from "@/components/HeroScene";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const c = await readContent();

  // Hero and Contact each get independent, per-theme primary/secondary
  // gradient colors, configurable in the admin dashboard. These are passed
  // down as raw CSS custom properties only — the actual `background` rule
  // (and which pair applies for the active theme) lives in globals.css
  // (#hero / #contact, gated by [data-theme]), since the light/dark choice
  // is a client-side toggle this server component can't know at render
  // time. A color left unset here simply omits that custom property, so
  // the CSS var() fallback (the section's normal background) takes over —
  // per-theme, independently.
  const heroColorVars = {
    "--hero-primary-light": c.hero.colorPrimaryLight || undefined,
    "--hero-secondary-light": c.hero.colorSecondaryLight || undefined,
    "--hero-primary-dark": c.hero.colorPrimaryDark || undefined,
    "--hero-secondary-dark": c.hero.colorSecondaryDark || undefined,
  } as React.CSSProperties;
  const contactColorVars = {
    "--contact-primary-light": c.contact.colorPrimaryLight || undefined,
    "--contact-secondary-light": c.contact.colorSecondaryLight || undefined,
    "--contact-primary-dark": c.contact.colorPrimaryDark || undefined,
    "--contact-secondary-dark": c.contact.colorSecondaryDark || undefined,
  } as React.CSSProperties;

  return (
    <main>
      <Nav avatarUrl={c.avatarUrl} textColor={c.headerTextColor} />

      {/* HERO */}
      <section id="hero" className="relative pt-36 sm:pt-44 pb-24 sm:pb-28 px-6 sm:px-8 overflow-hidden" style={heroColorVars}>
        <HeroScene />
        <div className="relative max-w-6xl mx-auto">
          <span className="eyebrow mb-5 block">{c.hero.coord}</span>
          <h1 className="font-display italic h-hero mb-7" style={{ color: "var(--text-head)" }}>
            {c.hero.name.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </h1>
          <p className="text-lg sm:text-xl mb-2.5 font-light" style={{ color: "var(--sage)" }}>
            {c.hero.role}
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-7" style={{ color: "var(--text-mute)" }}>
            {c.hero.tagline}
          </p>
          <p className="max-w-xl mb-10 text-[0.98rem] leading-relaxed" style={{ color: "var(--text-body)" }}>
            {c.hero.intro}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#projects" className="btn btn-primary">
              View Projects
            </a>
            <a href="#contact" className="btn btn-outline">
              Get in Touch
            </a>
          </div>
        </div>

        <a
          href="#about"
          aria-label="Scroll to About section"
          className="scroll-cue hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center justify-center w-8 h-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-mute)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v15M6 13l6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* ABOUT */}
      <Reveal as="section" id="about" className="section relative px-6 sm:px-8" style={{ background: "var(--bg-card)" }}>
        <span className="section-edge" />
        <div className={c.avatarUrl ? "max-w-5xl mx-auto" : "max-w-2xl mx-auto"}>
          <span className="eyebrow mb-5 block">About</span>
          <div className={c.avatarUrl ? "grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-start" : ""}>
            {c.avatarUrl && (
              <div className="md:col-span-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatarUrl}
                  alt="Pooja Raviendran Kutty"
                  className="w-full max-w-xs rounded-lg"
                  style={{
                    border: "1px solid var(--border)",
                    aspectRatio: "3/4",
                    objectFit: "cover",
                    boxShadow: "0 20px 44px rgba(var(--shadow-tint), 0.16)",
                  }}
                />
              </div>
            )}
            <div className={c.avatarUrl ? "md:col-span-2" : ""}>
              <h2 className="font-display italic h-section mb-7" style={{ color: "var(--text-head)" }}>
                {c.about.title.split("\n").map((l, i) => (
                  <span key={i}>
                    {l}
                    <br />
                  </span>
                ))}
              </h2>
              <blockquote
                className="font-display italic text-xl sm:text-[1.4rem] leading-snug border-l-2 pl-6 mb-9"
                style={{ borderColor: "var(--clay)", color: "var(--sage)" }}
              >
                &ldquo;{c.about.quote}&rdquo;
              </blockquote>
              <div className="space-y-4">
                {c.about.paragraphs.map((p, i) => (
                  <p key={i} style={{ color: "var(--text-body)" }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* EXPERTISE */}
      <Reveal as="section" id="expertise" className="section px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <span className="eyebrow mb-5 block">Expertise</span>
          <h2 className="font-display italic h-section mb-12" style={{ color: "var(--text-head)" }}>
            What I bring to a project
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {c.expertise.map((e, i) => (
              <div key={i} className="card p-6">
                <h3 className="font-display italic text-lg mb-2" style={{ color: "var(--text-head)" }}>
                  {e.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-mute)" }}>
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* PROJECTS */}
      <Reveal as="section" id="projects" className="section relative px-6 sm:px-8" style={{ background: "var(--bg-card)" }}>
        <span className="section-edge" />
        <div className="max-w-6xl mx-auto">
          <span className="eyebrow mb-5 block">Projects</span>
          <h2 className="font-display italic h-section mb-12" style={{ color: "var(--text-head)" }}>
            Selected work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.projects.map((p, i) => (
              <div key={i} className="card card-projects p-6 flex flex-col">
                <span
                  className="tag-badge font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 inline-block mb-4 rounded self-start"
                  style={{ background: "var(--sage-pale)", color: "var(--sage)" }}
                >
                  {p.tag}
                </span>
                <h3 className="font-display italic text-lg mb-1.5" style={{ color: "var(--text-head)" }}>
                  {p.name}
                </h3>
                <p className="font-mono text-xs mb-2.5" style={{ color: "var(--text-mute)" }}>
                  {p.loc}
                </p>
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--clay)" }}>
                  {p.role}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* MY PORTFOLIO — title, description, and file uploads per project */}
      <Reveal as="section" id="portfolio" className="section px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <span className="eyebrow mb-5 block">Portfolio</span>
          <h2 className="font-display italic h-section mb-4" style={{ color: "var(--text-head)" }}>
            My Portfolio
          </h2>
          <p className="max-w-xl mb-12 text-sm leading-relaxed" style={{ color: "var(--text-mute)" }}>
            Supporting drawings, reports, photographs and documents for individual projects.
          </p>
          {c.portfolioProjects.length === 0 ? (
            <p className="text-sm italic" style={{ color: "var(--text-mute)" }}>
              No portfolio projects added yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {c.portfolioProjects.map((p) => (
                <div key={p.id} className="card card-portfolio p-6 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h3 className="font-display italic text-lg" style={{ color: "var(--text-head)" }}>
                      {p.title}
                    </h3>
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: "var(--clay)", color: "#fff" }}
                    >
                      {p.files.length} file{p.files.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {p.desc && (
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-mute)" }}>
                      {p.desc}
                    </p>
                  )}
                  {p.files.length === 0 ? (
                    <p className="font-mono text-[10px] uppercase tracking-wider mt-auto" style={{ color: "var(--text-mute)" }}>
                      No files yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-auto pt-1">
                      {p.files.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="file-pill font-mono text-[10px] uppercase px-3 py-1.5">
                          {f.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* EXPERIENCE */}
      <Reveal as="section" id="experience" className="section relative px-6 sm:px-8" style={{ background: "var(--bg-card)" }}>
        <span className="section-edge" />
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-5 block">Experience</span>
          <h2 className="font-display italic h-section mb-12" style={{ color: "var(--text-head)" }}>
            Professional journey
          </h2>
          <div className="flex flex-col gap-9">
            {c.experience.map((e, i) => (
              <div key={i} className="pl-6 sm:pl-7 border-l-2" style={{ borderColor: "var(--sage-pale)" }}>
                <p className="font-mono text-xs mb-1.5" style={{ color: "var(--clay)" }}>
                  {e.date}
                </p>
                <h3 className="font-display italic text-xl sm:text-[1.4rem] mb-1" style={{ color: "var(--text-head)" }}>
                  {e.role}
                </h3>
                <p className="text-sm mb-2.5" style={{ color: "var(--sage-mid)" }}>
                  {e.company}
                </p>
                <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--text-body)" }}>
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* EDUCATION */}
      <Reveal as="section" id="education" className="section px-6 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-5 block">Education</span>
          <h2 className="font-display italic h-section mb-12" style={{ color: "var(--text-head)" }}>
            Academic formation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {c.education.map((e, i) => (
              <div key={i} className="card p-8">
                <span className="text-2xl block mb-4">{e.flag}</span>
                <p className="font-display italic text-3xl mb-2" style={{ color: "var(--text-head)" }}>
                  {e.deg}
                </p>
                <p className="text-sm mb-4" style={{ color: "var(--sage-mid)" }}>
                  {e.sub}
                </p>
                <p className="text-sm" style={{ color: "var(--text-body)" }}>
                  {e.inst}
                </p>
                <p className="font-mono text-xs mt-1.5" style={{ color: "var(--text-mute)" }}>
                  {e.meta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* TOOLS */}
      <Reveal as="section" className="section relative px-6 sm:px-8" style={{ background: "var(--bg-card)" }}>
        <span className="section-edge" />
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-5 block">Tools</span>
          <h2 className="font-display italic h-section mb-12" style={{ color: "var(--text-head)" }}>
            Software proficiency
          </h2>
          <div className="flex flex-col gap-7">
            {c.tools.map((g, i) => (
              <div key={i}>
                <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--clay)" }}>
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {g.pills.map((p, j) => (
                    <span key={j} className="tool-pill text-sm px-4 py-1.5 rounded-full">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* PERSONAL MILESTONES — title, description, and image */}
      <Reveal as="section" id="milestones" className="section px-6 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-5 block">Journey</span>
          <h2 className="font-display italic h-section mb-12" style={{ color: "var(--text-head)" }}>
            Personal Milestones
          </h2>
          {c.milestones.length === 0 ? (
            <p className="text-sm italic" style={{ color: "var(--text-mute)" }}>
              No milestones added yet.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {c.milestones.map((m, i) => (
                <div key={i} className="card card-milestone p-6 flex flex-col sm:flex-row justify-between gap-6">
                  <div>
                    {m.date && (
                      <p className="font-mono text-xs uppercase mb-1.5" style={{ color: "var(--clay)" }}>
                        {m.date}
                      </p>
                    )}
                    <h3 className="font-display italic text-xl mb-1.5" style={{ color: "var(--text-head)" }}>
                      {m.title}
                    </h3>
                    {m.desc && (
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
                        {m.desc}
                      </p>
                    )}
                  </div>
                  {m.img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.img} alt="" className="w-full sm:w-28 h-40 sm:h-20 object-cover rounded flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* CONTACT */}
      <Reveal as="section" id="contact" className="section relative px-6 sm:px-8" style={contactColorVars}>
        <span className="section-edge" />
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-5 block">Contact</span>
          <h2 className="font-display italic h-section mb-5" style={{ color: "var(--text-head)" }}>
            {c.contact.title}
          </h2>
          <p className="max-w-lg mb-10 leading-relaxed" style={{ color: "var(--text-body)" }}>
            {c.contact.intro}
          </p>
          <div className="flex flex-col gap-3.5 text-sm">
            <a href={`mailto:${c.contact.email}`} className="contact-link" style={{ color: "var(--sage)" }}>
              {c.contact.email}
            </a>
            <a href={c.contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="contact-link" style={{ color: "var(--sage)" }}>
              {c.contact.linkedinName} — LinkedIn ↗
            </a>
            <span style={{ color: "var(--text-mute)" }}>{c.contact.location}</span>
          </div>
        </div>
      </Reveal>

      <footer
        className="px-6 sm:px-8 py-7 flex flex-col sm:flex-row justify-between items-center sm:items-center gap-3 text-center sm:text-left"
        style={{
          background: "var(--nav-surface)",
          color: c.footerTextColor || "var(--nav-mute)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p className="font-mono text-xs">{c.footer.copyright}</p>
        <p className="font-mono text-xs">
          <a href={`mailto:${c.contact.email}`} className="contact-link">
            {c.contact.email}
          </a>
        </p>
      </footer>
    </main>
  );
}
