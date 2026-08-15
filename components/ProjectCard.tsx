"use client";

import { useState } from "react";

type Project = {
  name: string;
  role: string;
  desc: string;
  tag: string;
  loc: string;
  files: { name: string; url: string; type: string }[];
};

/**
 * Collapsed: name + role only. Click anywhere on that header to expand in
 * place and reveal, in order, the description, location, any attached
 * files, and — last, after the attachments — the tag.
 */
export default function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card card-projects project-card p-6 flex flex-col" data-state={open ? "open" : "closed"}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-start justify-between gap-3 text-left w-full">
        <div>
          <h3 className="font-display italic text-lg mb-1.5" style={{ color: "var(--text-head)" }}>
            {project.name}
          </h3>
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--clay)" }}>
            {project.role}
          </p>
        </div>
        <span className="project-card-chevron flex-shrink-0 mt-1" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div className={`project-card-detail ${open ? "is-open" : ""}`}>
        <div className="project-card-detail-inner">
          <p className="text-sm leading-relaxed pt-4" style={{ color: "var(--text-body)" }}>
            {project.desc}
          </p>
          {project.loc && (
            <p className="font-mono text-xs pt-3" style={{ color: "var(--text-mute)" }}>
              {project.loc}
            </p>
          )}
          {project.files.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {project.files.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="file-pill font-mono text-[10px] uppercase px-3 py-1.5">
                  {f.name}
                </a>
              ))}
            </div>
          )}
          {project.tag && (
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 inline-block mt-4 rounded"
              style={{ background: "var(--sage-pale)", color: "var(--sage)" }}
            >
              {project.tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
