import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SectionContent, SiteContent } from "./model.js";

export interface WrittenContentFile {
  file: string;
}

/**
 * Persist resolved {@link SiteContent} in two forms:
 *
 * - `content.json` — the machine-readable draft the Astro stage will render.
 * - `content-draft.md` — a human/agent-readable review of every page, with the
 *   provenance of each field (brief / generated / placeholder) made visible.
 * - `content-todos.md` — the rolled-up TODO list, so gaps stay loud.
 */
export function writeContent(content: SiteContent, outDir: string): WrittenContentFile[] {
  mkdirSync(outDir, { recursive: true });
  const written: WrittenContentFile[] = [];

  const write = (name: string, body: string) => {
    writeFileSync(join(outDir, name), body.endsWith("\n") ? body : body + "\n");
    written.push({ file: name });
  };

  write("content.json", JSON.stringify(content, null, 2));
  write("content-draft.md", renderDraft(content));
  write("content-todos.md", renderTodos(content));

  return written;
}

function renderDraft(content: SiteContent): string {
  const lines: string[] = [];
  lines.push(`# Content draft — ${content.business}`);
  lines.push("");
  lines.push(`- **Mode:** \`${content.mode}\``);
  lines.push(`- **Language:** \`${content.language}\``);
  lines.push(`- **Pages:** ${content.pages.length}`);
  lines.push(`- **Open TODOs:** ${content.todos.length}`);
  lines.push("");
  lines.push(
    "> Provenance markers: **[brief]** safe published fact · **[gen]** generated structural copy · **[todo]** placeholder needing a human.",
  );
  lines.push("");

  for (const page of content.pages) {
    lines.push(`## ${page.route}`);
    lines.push("");
    lines.push(`- **Title:** ${page.title}`);
    lines.push(`- **Meta:** ${tag(page.metaDescription.source)} ${page.metaDescription.value}`);
    lines.push(`- **Words:** ~${page.wordCount} (target ${page.minWords})`);
    lines.push("");
    for (const section of page.sections) {
      lines.push(`### ${section.section}`);
      if (section.heading) lines.push(`**${section.heading.value}** ${tag(section.heading.source)}`);
      for (const b of section.body) lines.push(`- ${tag(b.source)} ${b.value}`);
      for (const item of section.items) {
        const href = item.href ? ` → \`${item.href}\`` : "";
        lines.push(`- ${tag(item.title.source)} **${item.title.value}**${href}: ${item.body.value}`);
      }
      if (section.cta) lines.push(`- _CTA:_ ${section.cta.label} → \`${section.cta.href}\``);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function renderTodos(content: SiteContent): string {
  const lines = [`# Content TODOs — ${content.business}`, ""];
  if (!content.todos.length) {
    lines.push("_None — all placeholder gaps resolved._");
    lines.push("");
    return lines.join("\n");
  }
  for (const page of content.pages) {
    if (!page.todos.length) continue;
    lines.push(`## ${page.route}`);
    lines.push("");
    for (const todo of page.todos) lines.push(`- [ ] ${todo.replace(/^TODO:\s*/, "")}`);
    lines.push("");
  }
  return lines.join("\n");
}

function tag(source: SectionContent["body"][number]["source"]): string {
  switch (source) {
    case "brief":
      return "[brief]";
    case "generated":
      return "[gen]";
    case "placeholder":
      return "[todo]";
  }
}
