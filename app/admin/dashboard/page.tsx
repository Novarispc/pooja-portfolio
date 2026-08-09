"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/lib/content";

type Toast = { section: string; msg: string } | null;

export default function DashboardPage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "theme">("content");
  const [open, setOpen] = useState<string>("hero");
  const [toast, setToast] = useState<Toast>(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then(setContent);
  }, []);

  function flash(section: string, msg = "Saved ✓") {
    setToast({ section, msg });
    setTimeout(() => setToast(null), 1800);
  }

  async function save(publish = true) {
    if (!content) return;
    setSaving(true);
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, publish }),
    });
    setSaving(false);
    if (res.ok) {
      const saved = await res.json();
      setContent(saved);
      flash(open, publish ? "Published ✓" : "Draft saved ✓");
    } else {
      flash(open, "Save failed");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function uploadFile(file: File): Promise<{ url: string; name: string; type: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  }

  async function loadHistory() {
    const res = await fetch("/api/backup?list=1");
    const data = await res.json();
    setHistory(data.history || []);
  }

  async function restoreSnapshot(file: string) {
    if (!confirm(`Restore snapshot "${file}"? This replaces current content.`)) return;
    const res = await fetch(`/api/backup?snapshot=${encodeURIComponent(file)}`);
    const data = await res.json();
    setContent(data);
    flash("data", "Snapshot loaded — click Publish to apply");
  }

  async function exportBackup() {
    const res = await fetch("/api/backup");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importBackup(file: File) {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        setContent(await res.json());
        flash("data", "Imported ✓");
      } else {
        flash("data", "Import failed");
      }
    } catch {
      flash("data", "Invalid JSON file");
    }
  }

  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <p style={{ color: "var(--text-mute)" }}>Loading dashboard…</p>
      </main>
    );
  }

  const set = (patch: Partial<SiteContent>) => setContent({ ...content, ...patch });

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: "var(--nav-surface)", color: "var(--nav-text)" }}
      >
        <h1 className="font-display italic text-xl">Content Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">
            {content.meta?.status === "published" ? "● Published" : "○ Draft"}
          </span>
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="font-mono text-[10px] uppercase tracking-wider border px-3 py-1.5 rounded"
            style={{ borderColor: "var(--nav-mute)" }}
          >
            Save Draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded text-white"
            style={{ background: "var(--sage)" }}
          >
            {saving ? "Saving…" : "Publish"}
          </button>
          <a href="/" target="_blank" className="font-mono text-[10px] uppercase tracking-wider underline opacity-80">
            View site ↗
          </a>
          <button onClick={logout} className="font-mono text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100">
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-6 flex gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        {(
          [
            ["content", "Content"],
            ["theme", "Theme & Colors"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 -mb-px border-b-2 transition-colors"
            style={{
              color: activeTab === id ? "var(--sage)" : "var(--text-mute)",
              borderColor: activeTab === id ? "var(--sage)" : "transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6" style={{ display: activeTab === "content" ? "block" : "none" }}>
        <Section id="hero" title="Profile & Hero" open={open} setOpen={setOpen} toast={toast}>
          <Field label="Coordinate / location line" value={content.hero.coord} onChange={(v) => set({ hero: { ...content.hero, coord: v } })} />
          <TextArea label="Full name (new line = stacked)" value={content.hero.name} rows={3} onChange={(v) => set({ hero: { ...content.hero, name: v } })} />
          <Field label="Role / title" value={content.hero.role} onChange={(v) => set({ hero: { ...content.hero, role: v } })} />
          <Field label="Tagline" value={content.hero.tagline} onChange={(v) => set({ hero: { ...content.hero, tagline: v } })} />
          <TextArea label="Intro paragraph" value={content.hero.intro} rows={4} onChange={(v) => set({ hero: { ...content.hero, intro: v } })} />
          <p className="text-[11px]" style={{ color: "var(--text-mute)" }}>
            Background colors have moved to the <strong>Theme &amp; Colors</strong> tab above.
          </p>
        </Section>

        <Section id="about" title="About Section" open={open} setOpen={setOpen} toast={toast}>
          <TextArea label="Section title" value={content.about.title} rows={2} onChange={(v) => set({ about: { ...content.about, title: v } })} />
          <TextArea label="Pull quote" value={content.about.quote} rows={2} onChange={(v) => set({ about: { ...content.about, quote: v } })} />
          <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 mt-2" style={{ color: "var(--text-mute)" }}>
            Body paragraphs
          </label>
          {content.about.paragraphs.map((p, i) => (
            <ItemBox key={i} index={i} total={content.about.paragraphs.length}
              onRemove={() => {
                set({ about: { ...content.about, paragraphs: content.about.paragraphs.filter((_, j) => j !== i) } });
                flash("about", "Removed — click Publish to save");
              }}>
              <TextArea label="" value={p} rows={3}
                onChange={(v) => {
                  const next = [...content.about.paragraphs]; next[i] = v;
                  set({ about: { ...content.about, paragraphs: next } });
                }} />
            </ItemBox>
          ))}
          <AddButton onClick={() => set({ about: { ...content.about, paragraphs: [...content.about.paragraphs, ""] } })}>+ Add paragraph</AddButton>
        </Section>

        <Section id="avatar" title="Profile Photo" open={open} setOpen={setOpen} toast={toast}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "var(--sage-pale)" }}>
              {content.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={content.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display italic" style={{ color: "var(--sage)" }}>PRK</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const uploaded = await uploadFile(file);
                set({ avatarUrl: uploaded.url });
                flash("avatar", "Photo uploaded — Publish to go live");
              }}
            />
          </div>
          {content.avatarUrl && (
            <button className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--clay)" }}
              onClick={() => {
                set({ avatarUrl: null });
                flash("avatar", "Removed — click Publish to save");
              }}>
              Remove photo
            </button>
          )}
        </Section>

        <Section id="expertise" title="Expertise Cards" open={open} setOpen={setOpen} toast={toast}>
          {content.expertise.map((item, i) => (
            <ItemBox key={i} index={i} total={content.expertise.length}
              onRemove={() => {
                set({ expertise: content.expertise.filter((_, j) => j !== i) });
                flash("expertise", "Removed — click Publish to save");
              }}>
              <Field label="Title" value={item.title} onChange={(v) => { const next = [...content.expertise]; next[i] = { ...item, title: v }; set({ expertise: next }); }} />
              <TextArea label="Description" value={item.desc} rows={2} onChange={(v) => { const next = [...content.expertise]; next[i] = { ...item, desc: v }; set({ expertise: next }); }} />
            </ItemBox>
          ))}
          <AddButton onClick={() => set({ expertise: [...content.expertise, { title: "", desc: "" }] })}>+ Add card</AddButton>
        </Section>

        <Section id="projects" title="Projects" open={open} setOpen={setOpen} toast={toast}>
          {content.projects.map((item, i) => (
            <ItemBox key={i} index={i} total={content.projects.length}
              onRemove={() => {
                set({ projects: content.projects.filter((_, j) => j !== i) });
                flash("projects", "Removed — click Publish to save");
              }}>
              <Field label="Project name" value={item.name} onChange={(v) => { const next = [...content.projects]; next[i] = { ...item, name: v }; set({ projects: next }); }} />
              <Field label="Tag / type" value={item.tag} onChange={(v) => { const next = [...content.projects]; next[i] = { ...item, tag: v }; set({ projects: next }); }} />
              <Field label="Location" value={item.loc} onChange={(v) => { const next = [...content.projects]; next[i] = { ...item, loc: v }; set({ projects: next }); }} />
              <Field label="Your role" value={item.role} onChange={(v) => { const next = [...content.projects]; next[i] = { ...item, role: v }; set({ projects: next }); }} />
              <TextArea label="Description" value={item.desc} rows={3} onChange={(v) => { const next = [...content.projects]; next[i] = { ...item, desc: v }; set({ projects: next }); }} />
            </ItemBox>
          ))}
          <AddButton onClick={() => set({ projects: [...content.projects, { name: "", tag: "", loc: "", role: "", desc: "" }] })}>+ Add project</AddButton>
        </Section>

        <Section id="portfolioFiles" title="Portfolio Projects (files)" open={open} setOpen={setOpen} toast={toast}>
          {content.portfolioProjects.map((item, i) => (
            <ItemBox key={item.id} index={i} total={content.portfolioProjects.length}
              onRemove={() => {
                set({ portfolioProjects: content.portfolioProjects.filter((_, j) => j !== i) });
                flash("portfolioFiles", "Removed — click Publish to save");
              }}>
              <Field label="Title" value={item.title} onChange={(v) => { const next = [...content.portfolioProjects]; next[i] = { ...item, title: v }; set({ portfolioProjects: next }); }} />
              <TextArea label="Description" value={item.desc} rows={2} onChange={(v) => { const next = [...content.portfolioProjects]; next[i] = { ...item, desc: v }; set({ portfolioProjects: next }); }} />
              <label className="block font-mono text-[10px] uppercase tracking-widest mt-2 mb-1" style={{ color: "var(--text-mute)" }}>
                Files ({item.files.length})
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {item.files.map((f, fi) => (
                  <span key={fi} className="text-xs px-2 py-1 border rounded flex items-center gap-1" style={{ borderColor: "var(--border)" }}>
                    {f.name}
                    <button className="opacity-60 hover:opacity-100" onClick={() => {
                      const nextFiles = item.files.filter((_, j) => j !== fi);
                      const next = [...content.portfolioProjects]; next[i] = { ...item, files: nextFiles };
                      set({ portfolioProjects: next });
                    }}>×</button>
                  </span>
                ))}
              </div>
              <input type="file" multiple onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                const uploaded = await Promise.all(files.map(uploadFile));
                const next = [...content.portfolioProjects];
                next[i] = { ...item, files: [...item.files, ...uploaded] };
                set({ portfolioProjects: next });
                flash("portfolioFiles", "Files uploaded ✓");
              }} />
            </ItemBox>
          ))}
          <AddButton onClick={() => set({ portfolioProjects: [...content.portfolioProjects, { id: "pf-" + Date.now(), title: "New Project", desc: "", files: [] }] })}>
            + Add Project
          </AddButton>
        </Section>

        <Section id="experience" title="Experience Timeline" open={open} setOpen={setOpen} toast={toast}>
          {content.experience.map((item, i) => (
            <ItemBox key={i} index={i} total={content.experience.length}
              onRemove={() => {
                set({ experience: content.experience.filter((_, j) => j !== i) });
                flash("experience", "Removed — click Publish to save");
              }}>
              <Field label="Date range" value={item.date} onChange={(v) => { const next = [...content.experience]; next[i] = { ...item, date: v }; set({ experience: next }); }} />
              <Field label="Role" value={item.role} onChange={(v) => { const next = [...content.experience]; next[i] = { ...item, role: v }; set({ experience: next }); }} />
              <Field label="Company · location" value={item.company} onChange={(v) => { const next = [...content.experience]; next[i] = { ...item, company: v }; set({ experience: next }); }} />
              <TextArea label="Description" value={item.desc} rows={3} onChange={(v) => { const next = [...content.experience]; next[i] = { ...item, desc: v }; set({ experience: next }); }} />
            </ItemBox>
          ))}
          <AddButton onClick={() => set({ experience: [...content.experience, { date: "", role: "", company: "", desc: "" }] })}>+ Add role</AddButton>
        </Section>

        <Section id="education" title="Education" open={open} setOpen={setOpen} toast={toast}>
          {content.education.map((item, i) => (
            <ItemBox key={i} index={i} total={content.education.length}
              onRemove={() => {
                set({ education: content.education.filter((_, j) => j !== i) });
                flash("education", "Removed — click Publish to save");
              }}>
              <Field label="Flag (emoji)" value={item.flag} onChange={(v) => { const next = [...content.education]; next[i] = { ...item, flag: v }; set({ education: next }); }} />
              <Field label="Degree (short)" value={item.deg} onChange={(v) => { const next = [...content.education]; next[i] = { ...item, deg: v }; set({ education: next }); }} />
              <Field label="Degree (full)" value={item.sub} onChange={(v) => { const next = [...content.education]; next[i] = { ...item, sub: v }; set({ education: next }); }} />
              <Field label="Institution" value={item.inst} onChange={(v) => { const next = [...content.education]; next[i] = { ...item, inst: v }; set({ education: next }); }} />
              <Field label="Location · year" value={item.meta} onChange={(v) => { const next = [...content.education]; next[i] = { ...item, meta: v }; set({ education: next }); }} />
            </ItemBox>
          ))}
          <AddButton onClick={() => set({ education: [...content.education, { flag: "🌐", deg: "", sub: "", inst: "", meta: "" }] })}>+ Add entry</AddButton>
        </Section>

        <Section id="tools" title="Software Tools" open={open} setOpen={setOpen} toast={toast}>
          {content.tools.map((group, i) => (
            <ItemBox key={i} index={i} total={content.tools.length}
              onRemove={() => {
                set({ tools: content.tools.filter((_, j) => j !== i) });
                flash("tools", "Removed — click Publish to save");
              }}>
              <Field label="Group label" value={group.label} onChange={(v) => { const next = [...content.tools]; next[i] = { ...group, label: v }; set({ tools: next }); }} />
              <Field label="Tools (comma separated)" value={group.pills.join(", ")}
                onChange={(v) => { const next = [...content.tools]; next[i] = { ...group, pills: v.split(",").map((s) => s.trim()).filter(Boolean) }; set({ tools: next }); }} />
            </ItemBox>
          ))}
          <AddButton onClick={() => set({ tools: [...content.tools, { label: "", pills: [] }] })}>+ Add group</AddButton>
        </Section>

        <Section id="milestones" title="Personal Milestones" open={open} setOpen={setOpen} toast={toast}>
          {content.milestones.map((m, i) => (
            <ItemBox key={i} index={i} total={content.milestones.length}
              onRemove={() => {
                set({ milestones: content.milestones.filter((_, j) => j !== i) });
                flash("milestones", "Removed — click Publish to save");
              }}>
              <Field label="Title" value={m.title} onChange={(v) => { const next = [...content.milestones]; next[i] = { ...m, title: v }; set({ milestones: next }); }} />
              <Field label="Date" value={m.date} onChange={(v) => { const next = [...content.milestones]; next[i] = { ...m, date: v }; set({ milestones: next }); }} />
              <TextArea label="Description" value={m.desc} rows={2} onChange={(v) => { const next = [...content.milestones]; next[i] = { ...m, desc: v }; set({ milestones: next }); }} />
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const uploaded = await uploadFile(file);
                const next = [...content.milestones]; next[i] = { ...m, img: uploaded.url };
                set({ milestones: next });
              }} />
            </ItemBox>
          ))}
          <AddButton onClick={() => set({ milestones: [...content.milestones, { title: "", date: "", desc: "", img: null }] })}>+ Add milestone</AddButton>
        </Section>

        <Section id="contact" title="Contact & Footer" open={open} setOpen={setOpen} toast={toast}>
          <Field label="Contact section title" value={content.contact.title} onChange={(v) => set({ contact: { ...content.contact, title: v } })} />
          <TextArea label="Contact intro" value={content.contact.intro} rows={3} onChange={(v) => set({ contact: { ...content.contact, intro: v } })} />
          <Field label="Email" value={content.contact.email} onChange={(v) => set({ contact: { ...content.contact, email: v } })} />
          <Field label="LinkedIn URL" value={content.contact.linkedinUrl} onChange={(v) => set({ contact: { ...content.contact, linkedinUrl: v } })} />
          <Field label="LinkedIn display name" value={content.contact.linkedinName} onChange={(v) => set({ contact: { ...content.contact, linkedinName: v } })} />
          <Field label="Location" value={content.contact.location} onChange={(v) => set({ contact: { ...content.contact, location: v } })} />
          <Field label="Footer copyright" value={content.footer.copyright} onChange={(v) => set({ footer: { copyright: v } })} />
          <p className="text-[11px] mt-1" style={{ color: "var(--text-mute)" }}>
            Background and header/footer text colors have moved to the <strong>Theme &amp; Colors</strong> tab above.
          </p>
        </Section>

        <Section id="data" title="Data Management" open={open} setOpen={setOpen} toast={toast}>
          <p className="text-sm mb-4" style={{ color: "var(--text-mute)" }}>
            Every publish archives the previous version. Export a full backup, restore a past snapshot, or import a JSON file.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={exportBackup} className="font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded text-white" style={{ background: "var(--sage)" }}>
              Export JSON
            </button>
            <label className="font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded border cursor-pointer" style={{ borderColor: "var(--border)" }}>
              Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
            </label>
            <button onClick={loadHistory} className="font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded border" style={{ borderColor: "var(--border)" }}>
              Show Version History
            </button>
          </div>
          {history.length > 0 && (
            <ul className="text-xs flex flex-col gap-1">
              {history.map((f) => (
                <li key={f} className="flex items-center justify-between border-b py-1" style={{ borderColor: "var(--border)" }}>
                  <span className="font-mono">{f}</span>
                  <button onClick={() => restoreSnapshot(f)} className="underline" style={{ color: "var(--sage)" }}>
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6" style={{ display: activeTab === "theme" ? "block" : "none" }}>
        <Section id="chrome" title="Header & Footer Text Color" open={open} setOpen={setOpen} toast={toast}>
          <p className="text-sm mb-4" style={{ color: "var(--text-mute)" }}>
            Changes the text/link color in the nav bar and footer. Their background stays the
            theme's green surface — this only affects text.
          </p>
          <ColorField
            label="Header (nav bar) text color"
            value={content.headerTextColor || ""}
            fallbackSwatch="#f1ede4"
            onChange={(v) => set({ headerTextColor: v })}
          />
          <ColorField
            label="Footer text color"
            value={content.footerTextColor || ""}
            fallbackSwatch="#c3beb2"
            onChange={(v) => set({ footerTextColor: v })}
          />
        </Section>

        <Section id="heroColors" title="Hero Background Colors" open={open} setOpen={setOpen} toast={toast}>
          <p className="text-sm mb-4" style={{ color: "var(--text-mute)" }}>
            Set both primary and secondary to apply a gradient — set independently per theme, so
            light and dark mode can look completely different.
          </p>
          <ColorPairField
            label="Light theme"
            primary={content.hero.colorPrimaryLight || ""}
            secondary={content.hero.colorSecondaryLight || ""}
            onChange={(p, s) => set({ hero: { ...content.hero, colorPrimaryLight: p, colorSecondaryLight: s } })}
          />
          <ColorPairField
            label="Dark theme"
            primary={content.hero.colorPrimaryDark || ""}
            secondary={content.hero.colorSecondaryDark || ""}
            onChange={(p, s) => set({ hero: { ...content.hero, colorPrimaryDark: p, colorSecondaryDark: s } })}
          />
        </Section>

        <Section id="contactColors" title="Contact Background Colors" open={open} setOpen={setOpen} toast={toast}>
          <p className="text-sm mb-4" style={{ color: "var(--text-mute)" }}>
            Set both primary and secondary to apply a gradient — set independently per theme, so
            light and dark mode can look completely different.
          </p>
          <ColorPairField
            label="Light theme"
            primary={content.contact.colorPrimaryLight || ""}
            secondary={content.contact.colorSecondaryLight || ""}
            onChange={(p, s) => set({ contact: { ...content.contact, colorPrimaryLight: p, colorSecondaryLight: s } })}
          />
          <ColorPairField
            label="Dark theme"
            primary={content.contact.colorPrimaryDark || ""}
            secondary={content.contact.colorSecondaryDark || ""}
            onChange={(p, s) => set({ contact: { ...content.contact, colorPrimaryDark: p, colorSecondaryDark: s } })}
          />
        </Section>
      </div>
    </main>
  );
}

/* ── Shared UI bits ── */

function Section({ id, title, open, setOpen, toast, children }: {
  id: string; title: string; open: string; setOpen: (id: string) => void; toast: Toast; children: React.ReactNode;
}) {
  const isOpen = open === id;
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(isOpen ? "" : id)}
        className="w-full flex items-center justify-between py-4 text-left font-medium text-sm uppercase tracking-widest"
        style={{ color: "var(--text-head)" }}
      >
        {title}
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {isOpen && (
        <div className="pb-6">
          {children}
          {toast?.section === id && (
            <div className="mt-3 px-3 py-2 text-sm rounded" style={{ background: "var(--sage-pale)", color: "var(--sage)" }}>
              {toast.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--text-mute)" }}>
          {label}
        </label>
      )}
      <input
        className="w-full px-3 py-2 border rounded text-sm"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * A primary/secondary color pair used for a section's background gradient.
 * Empty values fall back to the theme default on the public site — the
 * "Reset" button clears both back to that state.
 */
function ColorPairField({
  label,
  primary,
  secondary,
  onChange,
}: {
  label: string;
  primary: string;
  secondary: string;
  onChange: (primary: string, secondary: string) => void;
}) {
  const hasCustom = !!primary || !!secondary;
  const swatchPrimary = primary || "#46593f";
  const swatchSecondary = secondary || "#b8825a";

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="block font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-mute)" }}>
          {label}
        </label>
        {hasCustom && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: "var(--clay)" }}
          >
            Reset to default
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={swatchPrimary}
            onChange={(e) => onChange(e.target.value, secondary || swatchSecondary)}
            className="w-8 h-8 rounded border cursor-pointer"
            style={{ borderColor: "var(--border)" }}
            aria-label={`${label} primary color`}
          />
          <input
            className="w-24 px-2 py-1.5 border rounded text-xs font-mono"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            placeholder="Primary"
            value={primary}
            onChange={(e) => onChange(e.target.value, secondary)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={swatchSecondary}
            onChange={(e) => onChange(primary || swatchPrimary, e.target.value)}
            className="w-8 h-8 rounded border cursor-pointer"
            style={{ borderColor: "var(--border)" }}
            aria-label={`${label} secondary color`}
          />
          <input
            className="w-24 px-2 py-1.5 border rounded text-xs font-mono"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            placeholder="Secondary"
            value={secondary}
            onChange={(e) => onChange(primary, e.target.value)}
          />
        </div>
      </div>
      {hasCustom && (!primary || !secondary) && (
        <p className="text-[11px] mt-1.5" style={{ color: "var(--clay)" }}>
          Set both colors to apply the gradient — one alone falls back to the theme default.
        </p>
      )}
      <p className="text-[11px] mt-1.5" style={{ color: "var(--text-mute)" }}>
        Applies as a background gradient. Check text stays readable against your chosen colors.
      </p>
    </div>
  );
}

/** A single configurable color — swatch + hex text + reset to theme default. */
function ColorField({
  label,
  value,
  fallbackSwatch,
  onChange,
}: {
  label: string;
  value: string;
  fallbackSwatch: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="block font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-mute)" }}>
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: "var(--clay)" }}
          >
            Reset to default
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value || fallbackSwatch}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border cursor-pointer"
          style={{ borderColor: "var(--border)" }}
          aria-label={`${label} color`}
        />
        <input
          className="w-32 px-2 py-1.5 border rounded text-xs font-mono"
          style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
          placeholder="Theme default"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function TextArea({ label, value, rows, onChange }: { label: string; value: string; rows?: number; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--text-mute)" }}>
          {label}
        </label>
      )}
      <textarea
        className="w-full px-3 py-2 border rounded text-sm"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
        rows={rows || 3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ItemBox({ index, total, onRemove, children }: { index: number; total: number; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="p-4 mb-3 rounded border" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--clay)" }}>
          {index + 1} / {total}
        </span>
        <button onClick={onRemove} className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="font-mono text-[10px] uppercase tracking-wider border px-3 py-2 rounded" style={{ borderColor: "var(--border)", color: "var(--sage)" }}>
      {children}
    </button>
  );
}
