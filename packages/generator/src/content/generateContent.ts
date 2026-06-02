import type { Brief } from "../brief/schema.js";
import type { PlannedPage, SitePlan } from "../plan/planSite.js";
import { slugify } from "../util/slugify.js";
import { buildPageSeo } from "../seo/buildSeo.js";
import { buildPageJsonLd } from "../schema/buildJsonLd.js";
import {
  brief as briefField,
  countWords,
  generated,
  placeholder,
  type ContentField,
  type ContentItem,
  type ContentMode,
  type PageContent,
  type SectionContent,
  type SiteContent,
} from "./model.js";

export interface GenerateContentOptions {
  /** Only "placeholder" today: deterministic, fact-free, TODO-marked copy. */
  mode?: ContentMode;
}

/**
 * Turn a structural {@link SitePlan} into resolved {@link SiteContent}.
 *
 * Placeholder mode is deterministic and safe-by-default: it fills headings and
 * structural copy, reuses facts that are present in the brief, and leaves an
 * explicit `TODO:` for every fact that is missing or that the "never invent"
 * rules forbid synthesising (testimonials, prices, hours, credentials, team).
 *
 * The output is enough to render every page end-to-end while remaining honest
 * about what still needs a human.
 */
export function generateContent(
  plan: SitePlan,
  brief: Brief,
  options: GenerateContentOptions = {},
): SiteContent {
  const mode: ContentMode = options.mode ?? "placeholder";
  const siteUrl = brief.seo?.site_url ?? null;
  const pages = plan.pages.map((page) => buildPage(page, plan, brief, siteUrl));

  const todos = dedupe(pages.flatMap((p) => p.todos));

  return {
    business: plan.business,
    language: plan.language,
    mode,
    siteUrl,
    pages,
    todos,
  };
}

function buildPage(
  page: PlannedPage,
  plan: SitePlan,
  brief: Brief,
  siteUrl: string | null,
): PageContent {
  const ctx: PageCtx = {
    plan,
    brief,
    business: brief.business,
    serviceName: page.pageType === "service" ? serviceForRoute(page.route, brief) : null,
  };

  const sections = page.sections.map((section) => buildSection(section, page, ctx));

  const wordCount = sections.reduce((sum, s) => sum + sectionWordCount(s), 0);
  const sectionTodos = sections.flatMap((s) => s.todos);

  const pageTodos = [...sectionTodos];
  if (wordCount < page.minWords) {
    pageTodos.push(
      `TODO: expand ${page.route} to at least ${page.minWords} words (placeholder copy is ~${wordCount}).`,
    );
  }

  const metaDescription = buildMetaDescription(page, ctx);
  const seo = buildPageSeo(page, metaDescription.value, brief, siteUrl);
  const jsonLd = buildPageJsonLd({ page, sections, brief, siteUrl, serviceName: ctx.serviceName });

  return {
    route: page.route,
    pageType: page.pageType,
    title: page.title,
    metaDescription,
    seo,
    jsonLd,
    sections,
    wordCount,
    minWords: page.minWords,
    todos: dedupe(pageTodos),
  };
}

interface PageCtx {
  plan: SitePlan;
  brief: Brief;
  business: Brief["business"];
  /** The specific service a detail page covers, else null. */
  serviceName: string | null;
}

/**
 * Resolve content for one section. Sections are keyed by a base id plus an
 * optional `.variant` (e.g. `hero.service`); we switch on the base.
 */
function buildSection(section: string, page: PlannedPage, ctx: PageCtx): SectionContent {
  const base = section.split(".")[0]!;
  const make = SECTION_BUILDERS[base] ?? buildRichText;
  return make(section, page, ctx);
}

type SectionBuilder = (section: string, page: PlannedPage, ctx: PageCtx) => SectionContent;

const SECTION_BUILDERS: Record<string, SectionBuilder> = {
  hero: buildHero,
  "trust-bar": buildTrustBar,
  "services-grid": buildServicesGrid,
  "service-grid": buildServicesGrid,
  "service-summary": buildServiceSummary,
  benefits: buildBenefits,
  "process-steps": buildProcessSteps,
  testimonials: buildTestimonials,
  faq: buildFaq,
  "faq-preview": buildFaq,
  "related-services": buildRelatedServices,
  "final-cta": buildFinalCta,
  "appointment-cta": buildFinalCta,
  "contact-card": buildContactCard,
  "location-map": buildLocationMap,
  "service-area": buildServiceArea,
  "rich-text": buildRichText,
};

function buildHero(section: string, page: PlannedPage, ctx: PageCtx): SectionContent {
  const { business, serviceName } = ctx;
  const heading =
    serviceName != null
      ? generated(`${serviceName} in ${business.city}`)
      : page.pageType === "home"
        ? briefField(`${business.name}`)
        : generated(stripSuffix(page.title));

  const body: ContentField[] = [generated(business.short_description)];
  const cta = primaryCta(ctx);
  return base(section, heading, body, [], cta, []);
}

function buildTrustBar(section: string, _page: PlannedPage, _ctx: PageCtx): SectionContent {
  // Trust signals are facts (certs, years, registrations) we must not invent.
  return base(section, generated("Waarom kiezen voor ons"), [], [], null, [
    `TODO: add verifiable trust signals for the trust bar (registrations, years active, affiliations) — never invent these.`,
  ]);
}

function buildServicesGrid(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const { plan, business } = ctx;
  const servicePages = plan.pages.filter((p) => p.pageType === "service");
  const items: ContentItem[] = business.services.map((service, i) => ({
    title: briefField(service),
    body: generated(`Wat ${service.toLowerCase()} inhoudt en voor wie het bedoeld is.`),
    href: servicePages[i]?.route,
  }));
  return base(section, generated("Onze diensten"), [], items, primaryCta(ctx), []);
}

function buildServiceSummary(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const service = ctx.serviceName ?? "deze dienst";
  const body = [
    generated(
      `Wat ${service.toLowerCase()} is, voor wie het bedoeld is en wanneer u contact opneemt.`,
    ),
  ];
  return base(section, generated(`Over ${service.toLowerCase()}`), body, [], null, [
    `TODO: describe the specifics of "${service}" — scope, who it is for, what is included.`,
  ]);
}

function buildBenefits(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const service = ctx.serviceName ?? "deze dienst";
  const items: ContentItem[] = [1, 2, 3].map((n) => ({
    title: placeholder(`Voordeel ${n}`),
    body: placeholder(`TODO: concreet voordeel van ${service.toLowerCase()}.`),
  }));
  return base(section, generated("Wat u kunt verwachten"), [], items, null, [
    `TODO: list the concrete, substantiated benefits of "${service}" (no unprovable claims).`,
  ]);
}

function buildProcessSteps(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const items: ContentItem[] = [
    { title: generated("1. Contact"), body: generated("U neemt contact op of maakt een afspraak.") },
    { title: generated("2. Intake"), body: generated("We bespreken uw situatie en wensen.") },
    {
      title: generated("3. Vervolg"),
      body: placeholder("TODO: beschrijf de concrete vervolgstappen."),
    },
  ];
  const todos = [`TODO: confirm the real step-by-step process and replace step 3 with specifics.`];
  return base(section, generated("Hoe het werkt"), [], items, primaryCta(ctx), todos);
}

function buildTestimonials(section: string, _page: PlannedPage, _ctx: PageCtx): SectionContent {
  // Never invent testimonials or review scores. Emit empty with a TODO.
  return base(section, generated("Ervaringen"), [], [], null, [
    `TODO: add real testimonials/reviews with attribution — these must never be invented.`,
  ]);
}

function buildFaq(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const items: ContentItem[] = [
    {
      title: generated(`Hoe maak ik een afspraak bij ${ctx.business.name}?`),
      body: placeholder("TODO: leg uit hoe iemand een afspraak maakt."),
    },
    {
      title: generated(`In welke regio werkt ${ctx.business.name}?`),
      body: generated(`We werken in en rond ${ctx.business.city}.`),
    },
  ];
  return base(section, generated("Veelgestelde vragen"), [], items, null, [
    `TODO: replace placeholder FAQ answers with verified, specific answers.`,
  ]);
}

function buildRelatedServices(section: string, page: PlannedPage, ctx: PageCtx): SectionContent {
  const others = ctx.plan.pages
    .filter((p) => p.pageType === "service" && p.route !== page.route)
    .slice(0, 3);
  const items: ContentItem[] = others.map((p) => ({
    title: generated(serviceForRoute(p.route, ctx.brief) ?? stripSuffix(p.title)),
    body: generated("Bekijk deze gerelateerde dienst."),
    href: p.route,
  }));
  return base(section, generated("Gerelateerde diensten"), [], items, null, []);
}

function buildFinalCta(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const cta = primaryCta(ctx);
  const heading = generated("Klaar om de volgende stap te zetten?");
  const body = [generated(`Neem contact op met ${ctx.business.name}.`)];
  return base(section, heading, body, [], cta, cta ? [] : contactTodo(ctx));
}

function buildContactCard(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const { contact } = ctx.business;
  const body: ContentField[] = [];
  const todos: string[] = [];

  if (contact.phone) body.push(briefField(`Telefoon: ${contact.phone}`));
  else todos.push("TODO: add a phone number for the contact card.");

  if (contact.email) body.push(briefField(`E-mail: ${contact.email}`));
  else todos.push("TODO: add an email address for the contact card.");

  if (contact.address) body.push(briefField(`Adres: ${contact.address}`));
  else todos.push("TODO: add a postal address for the contact card.");

  // Opening hours are a fact we never invent.
  todos.push("TODO: add opening hours if applicable — never invent these.");

  return base(section, generated("Contactgegevens"), body, [], primaryCta(ctx), todos);
}

function buildLocationMap(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const { contact } = ctx.business;
  const todos = contact.address
    ? []
    : ["TODO: a map needs a verified address; none was provided in the brief."];
  const body = contact.address
    ? [briefField(`Vind ons op: ${contact.address}`)]
    : [placeholder("TODO: address required for the map embed.")];
  return base(section, generated("Route & bereikbaarheid"), body, [], null, todos);
}

function buildServiceArea(section: string, _page: PlannedPage, ctx: PageCtx): SectionContent {
  const locations = ctx.brief.seo?.target_locations ?? [];
  const body = [generated(`We zijn actief in en rond ${ctx.business.city}.`)];
  const todos = locations.length
    ? []
    : ["TODO: confirm the full list of towns/areas served (service area)."];
  return base(section, generated("Werkgebied"), body, [], null, todos);
}

function buildRichText(section: string, page: PlannedPage, ctx: PageCtx): SectionContent {
  if (page.isUtility) return buildUtility(section, page, ctx);
  const heading = generated(stripSuffix(page.title));
  const body = [generated(ctx.business.short_description)];
  return base(section, heading, body, [], null, [
    `TODO: write the main body copy for ${page.route}.`,
  ]);
}

function buildUtility(section: string, page: PlannedPage, ctx: PageCtx): SectionContent {
  const map: Record<string, { heading: string; todo: string }> = {
    privacy: {
      heading: "Privacyverklaring",
      todo: "TODO: insert the legally reviewed privacy statement (GDPR/AVG).",
    },
    cookies: {
      heading: "Cookiebeleid",
      todo: "TODO: insert the cookie policy matching the active analytics/forms providers.",
    },
    terms: { heading: "Voorwaarden", todo: "TODO: insert reviewed terms / disclaimer." },
    "404": {
      heading: "Pagina niet gevonden",
      todo: "TODO: none — friendly not-found copy can be generated.",
    },
  };
  const entry = map[page.pageType] ?? {
    heading: stripSuffix(page.title),
    todo: `TODO: write the body for ${page.route}.`,
  };
  const body =
    page.pageType === "404"
      ? [generated("Deze pagina bestaat niet (meer). Gebruik het menu of ga terug naar de homepage.")]
      : [placeholder(entry.todo)];
  const todos = page.pageType === "404" ? [] : [entry.todo];
  return base(section, generated(entry.heading), body, [], primaryCta(ctx), todos);
}

/* ---------- shared helpers ---------- */

function buildMetaDescription(page: PlannedPage, ctx: PageCtx): ContentField {
  const { business, serviceName } = ctx;
  let text: string;
  if (page.pageType === "home") {
    text = `${business.short_description} ${business.name} in ${business.city}.`;
  } else if (serviceName) {
    text = `${serviceName} in ${business.city} bij ${business.name}. ${business.short_description}`;
  } else {
    text = `${stripSuffix(page.title)} — ${business.name} in ${business.city}.`;
  }
  return generated(clamp(text, 155));
}

function primaryCta(ctx: PageCtx): { label: string; href: string } | null {
  const { contact } = ctx.business;
  if (contact.booking_url) return { label: "Maak een afspraak", href: contact.booking_url };
  const contactPage = ctx.plan.pages.find((p) => p.pageType === "contact");
  if (contactPage) return { label: "Neem contact op", href: contactPage.route };
  if (contact.phone) return { label: `Bel ${contact.phone}`, href: `tel:${contact.phone}` };
  if (contact.email) return { label: "Stuur een e-mail", href: `mailto:${contact.email}` };
  return null;
}

function contactTodo(_ctx: PageCtx): string[] {
  return ["TODO: no contact route available; add a phone, email, booking URL, or contact page."];
}

function base(
  section: string,
  heading: ContentField | null,
  body: ContentField[],
  items: ContentItem[],
  cta: { label: string; href: string } | null,
  todos: string[],
): SectionContent {
  return { section, heading, body, items, cta, todos };
}

function sectionWordCount(s: SectionContent): number {
  let n = 0;
  if (s.heading) n += countWords(s.heading.value);
  for (const b of s.body) n += countWords(b.value);
  for (const it of s.items) n += countWords(it.title.value) + countWords(it.body.value);
  if (s.cta) n += countWords(s.cta.label);
  return n;
}

/** Recover the service name for a `/diensten/{slug}/` route from the brief. */
function serviceForRoute(route: string, brief: Brief): string | null {
  const match = route.match(/^\/diensten\/(.+?)\/$/);
  if (!match) return null;
  const slug = match[1]!;
  return brief.business.services.find((s) => slugify(s) === slug) ?? null;
}

function stripSuffix(title: string): string {
  return title.split("|")[0]!.trim();
}

function clamp(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

function dedupe(items: string[]): string[] {
  return [...new Set(items)];
}
