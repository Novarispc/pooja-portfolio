import { readContent } from "@/lib/content";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const c = await readContent();

  return (
    <main>
      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "var(--nav-surface)" }}
      >
        <a href="#hero" className="font-display italic text-xl" style={{ color: "var(--nav-text)" }}>
          {c.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.avatarUrl} alt="" className="inline-block w-8 h-8 rounded-full object-cover mr-2 align-middle" />
          ) : null}
          PRK
        </a>
        <div className="flex items-center gap-8">
          <ul className="hidden md:flex gap-8 text-xs tracking-widest uppercase" style={{ color: "var(--nav-mute)" }}>
            {["about", "expertise", "projects", "portfolio", "experience", "education", "milestones", "contact"].map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="hover:text-white transition-colors">
                  {id === "milestones" ? "milestone" : id}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="pt-40 pb-24 px-8 max-w-6xl mx-auto">
        <span className="eyebrow mb-4 block">{c.hero.coord}</span>
        <h1 className="font-display italic text-5xl md:text-7xl leading-[1.05] mb-6" style={{ color: "var(--text-head)" }}>
          {c.hero.name.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h1>
        <p className="text-lg mb-2" style={{ color: "var(--sage)" }}>
          {c.hero.role}
        </p>
        <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: "var(--text-mute)" }}>
          {c.hero.tagline}
        </p>
        <p className="max-w-xl mb-8" style={{ color: "var(--text-body)" }}>
          {c.hero.intro}
        </p>
        <div className="flex gap-4">
          <a href="#projects" className="btn btn-primary">
            View Projects
          </a>
          <a href="#contact" className="btn btn-outline">
            Get in Touch
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-8" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-4 block">About</span>
          <h2 className="font-display italic text-4xl mb-6" style={{ color: "var(--text-head)" }}>
            {c.about.title.split("\n").map((l, i) => (
              <span key={i}>
                {l}
                <br />
              </span>
            ))}
          </h2>
          <blockquote className="font-display italic text-xl border-l-2 pl-6 mb-8" style={{ borderColor: "var(--clay)", color: "var(--sage)" }}>
            &ldquo;{c.about.quote}&rdquo;
          </blockquote>
          {c.about.paragraphs.map((p, i) => (
            <p key={i} className="mb-4" style={{ color: "var(--text-body)" }}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* EXPERTISE */}
      <section id="expertise" className="py-24 px-8 max-w-6xl mx-auto">
        <span className="eyebrow mb-4 block">Expertise</span>
        <h2 className="font-display italic text-4xl mb-10" style={{ color: "var(--text-head)" }}>
          What I bring to a project
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {c.expertise.map((e, i) => (
            <div key={i} className="card p-5">
              <h3 className="font-display italic text-base mb-1" style={{ color: "var(--text-head)" }}>
                {e.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-mute)" }}>
                {e.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="py-24 px-8" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-6xl mx-auto">
          <span className="eyebrow mb-4 block">Projects</span>
          <h2 className="font-display italic text-4xl mb-10" style={{ color: "var(--text-head)" }}>
            Selected work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.projects.map((p, i) => (
              <div key={i} className="card card-projects p-5">
                <span className="tag-badge font-mono text-[10px] uppercase tracking-wider px-2 py-1 inline-block mb-3 rounded" style={{ background: "var(--sage-pale)", color: "var(--sage)" }}>
                  {p.tag}
                </span>
                <h3 className="font-display italic text-lg mb-1" style={{ color: "var(--text-head)" }}>
                  {p.name}
                </h3>
                <p className="font-mono text-xs mb-2" style={{ color: "var(--text-mute)" }}>
                  {p.loc}
                </p>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--clay)" }}>
                  {p.role}
                </p>
                <p className="text-sm" style={{ color: "var(--text-body)" }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MY PORTFOLIO — title, description, and file uploads per project */}
      <section id="portfolio" className="py-24 px-8 max-w-6xl mx-auto">
        <span className="eyebrow mb-4 block">Portfolio</span>
        <h2 className="font-display italic text-4xl mb-3" style={{ color: "var(--text-head)" }}>
          My Portfolio
        </h2>
        <p className="max-w-xl mb-10 text-sm" style={{ color: "var(--text-mute)" }}>
          Supporting drawings, reports, photographs and documents for individual projects.
        </p>
        {c.portfolioProjects.length === 0 ? (
          <p className="text-sm italic" style={{ color: "var(--text-mute)" }}>
            No portfolio projects added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.portfolioProjects.map((p) => (
              <div key={p.id} className="card card-portfolio p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display italic text-lg" style={{ color: "var(--text-head)" }}>
                    {p.title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "var(--clay)", color: "#fff" }}>
                    {p.files.length} file{p.files.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {p.desc && (
                  <p className="text-sm mb-3" style={{ color: "var(--text-mute)" }}>
                    {p.desc}
                  </p>
                )}
                {p.files.length === 0 ? (
                  <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>
                    No files yet
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {p.files.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="file-pill font-mono text-[10px] uppercase px-2.5 py-1.5">
                        {f.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="py-24 px-8" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-4 block">Experience</span>
          <h2 className="font-display italic text-4xl mb-10" style={{ color: "var(--text-head)" }}>
            Professional journey
          </h2>
          <div className="flex flex-col gap-8">
            {c.experience.map((e, i) => (
              <div key={i} className="pl-6 border-l-2" style={{ borderColor: "var(--sage-pale)" }}>
                <p className="font-mono text-xs" style={{ color: "var(--clay)" }}>
                  {e.date}
                </p>
                <h3 className="font-display italic text-xl" style={{ color: "var(--text-head)" }}>
                  {e.role}
                </h3>
                <p className="text-sm mb-2" style={{ color: "var(--sage-mid)" }}>
                  {e.company}
                </p>
                <p className="text-sm" style={{ color: "var(--text-body)" }}>
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" className="py-24 px-8 max-w-4xl mx-auto">
        <span className="eyebrow mb-4 block">Education</span>
        <h2 className="font-display italic text-4xl mb-10" style={{ color: "var(--text-head)" }}>
          Academic formation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {c.education.map((e, i) => (
            <div key={i} className="card p-8">
              <span className="text-2xl block mb-3">{e.flag}</span>
              <p className="font-display italic text-3xl" style={{ color: "var(--text-head)" }}>
                {e.deg}
              </p>
              <p className="text-sm mb-3" style={{ color: "var(--sage-mid)" }}>
                {e.sub}
              </p>
              <p className="text-sm" style={{ color: "var(--text-body)" }}>
                {e.inst}
              </p>
              <p className="font-mono text-xs mt-1" style={{ color: "var(--text-mute)" }}>
                {e.meta}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section className="py-24 px-8" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-4 block">Tools</span>
          <h2 className="font-display italic text-4xl mb-10" style={{ color: "var(--text-head)" }}>
            Software proficiency
          </h2>
          <div className="flex flex-col gap-6">
            {c.tools.map((g, i) => (
              <div key={i}>
                <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--clay)" }}>
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-2">
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
      </section>

      {/* PERSONAL MILESTONES — title, description, and image */}
      <section id="milestones" className="py-24 px-8 max-w-4xl mx-auto">
        <span className="eyebrow mb-4 block">Journey</span>
        <h2 className="font-display italic text-4xl mb-10" style={{ color: "var(--text-head)" }}>
          Personal Milestones
        </h2>
        {c.milestones.length === 0 ? (
          <p className="text-sm italic" style={{ color: "var(--text-mute)" }}>
            No milestones added yet.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {c.milestones.map((m, i) => (
              <div key={i} className="card card-milestone p-6 flex justify-between gap-6">
                <div>
                  {m.date && (
                    <p className="font-mono text-xs uppercase mb-1" style={{ color: "var(--clay)" }}>
                      {m.date}
                    </p>
                  )}
                  <h3 className="font-display italic text-xl mb-1" style={{ color: "var(--text-head)" }}>
                    {m.title}
                  </h3>
                  {m.desc && (
                    <p className="text-sm" style={{ color: "var(--text-body)" }}>
                      {m.desc}
                    </p>
                  )}
                </div>
                {m.img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.img} alt="" className="w-28 h-20 object-cover rounded flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-8" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-4xl mx-auto">
          <span className="eyebrow mb-4 block">Contact</span>
          <h2 className="font-display italic text-4xl mb-4" style={{ color: "var(--text-head)" }}>
            {c.contact.title}
          </h2>
          <p className="max-w-lg mb-8" style={{ color: "var(--text-body)" }}>
            {c.contact.intro}
          </p>
          <div className="flex flex-col gap-3 text-sm">
            <a href={`mailto:${c.contact.email}`} className="contact-link" style={{ color: "var(--sage)" }}>
              {c.contact.email}
            </a>
            <a href={c.contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="contact-link" style={{ color: "var(--sage)" }}>
              {c.contact.linkedinName} — LinkedIn ↗
            </a>
            <span style={{ color: "var(--text-mute)" }}>{c.contact.location}</span>
          </div>
        </div>
      </section>

      <footer className="px-8 py-6 flex justify-between flex-wrap gap-2" style={{ background: "var(--nav-surface)", color: "var(--nav-mute)" }}>
        <p className="font-mono text-xs">{c.footer.copyright}</p>
        <p className="font-mono text-xs">
          <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
        </p>
      </footer>
    </main>
  );
}
