import { z } from "zod";

/**
 * Single source of truth for the site content shape. Used two ways:
 *  1. Defensively on every read (readContent/readEditableContent/
 *     readHistorySnapshot) — old or partial data gets missing fields
 *     backfilled via .default() instead of crashing downstream components.
 *  2. Strictly on admin JSON import — .safeParse() rejects fundamentally
 *     malformed uploads with a clear error instead of writing them through.
 */

const FileRefSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
});

export const SiteContentSchema = z.object({
  hero: z.object({
    coord: z.string().default(""),
    name: z.string().default(""),
    role: z.string().default(""),
    tagline: z.string().default(""),
    intro: z.string().default(""),
    colorPrimaryLight: z.string().optional(),
    colorSecondaryLight: z.string().optional(),
    colorPrimaryDark: z.string().optional(),
    colorSecondaryDark: z.string().optional(),
  }),
  about: z.object({
    title: z.string().default(""),
    quote: z.string().default(""),
    paragraphs: z.array(z.string()).default([]),
  }),
  expertise: z
    .array(z.object({ title: z.string().default(""), desc: z.string().default("") }))
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(""),
        tag: z.string().default(""),
        loc: z.string().default(""),
        role: z.string().default(""),
        desc: z.string().default(""),
        files: z.array(FileRefSchema).default([]),
      })
    )
    .default([]),
  experience: z
    .array(
      z.object({
        date: z.string().default(""),
        role: z.string().default(""),
        company: z.string().default(""),
        desc: z.string().default(""),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        flag: z.string().default(""),
        deg: z.string().default(""),
        sub: z.string().default(""),
        inst: z.string().default(""),
        meta: z.string().default(""),
      })
    )
    .default([]),
  tools: z
    .array(z.object({ label: z.string().default(""), pills: z.array(z.string()).default([]) }))
    .default([]),
  contact: z.object({
    title: z.string().default(""),
    intro: z.string().default(""),
    email: z.string().default(""),
    linkedinUrl: z.string().default(""),
    linkedinName: z.string().default(""),
    location: z.string().default(""),
    colorPrimaryLight: z.string().optional(),
    colorSecondaryLight: z.string().optional(),
    colorPrimaryDark: z.string().optional(),
    colorSecondaryDark: z.string().optional(),
  }),
  footer: z.object({ copyright: z.string().default("") }),
  milestones: z
    .array(
      z.object({
        title: z.string().default(""),
        date: z.string().default(""),
        desc: z.string().default(""),
        img: z.string().nullable().default(null),
      })
    )
    .default([]),
  avatarUrl: z.string().nullable().default(null),
  headerTextColor: z.string().optional(),
  footerTextColor: z.string().optional(),
  meta: z
    .object({
      updatedAt: z.string(),
      status: z.enum(["draft", "published"]),
    })
    .optional(),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;

/** Backfills missing/old-shape fields; never throws. Used on every read. */
export function normalizeContent(raw: unknown): SiteContent | null {
  const result = SiteContentSchema.safeParse(raw);
  return result.success ? result.data : null;
}

/** Strict validation for admin-initiated JSON import — surfaces issues instead of silently defaulting. */
export function validateImport(raw: unknown) {
  return SiteContentSchema.safeParse(raw);
}
