import { z } from "zod";

/**
 * Canonical business-brief schema.
 *
 * This is the single source of truth for what an agent may rely on when
 * generating a site. The JSON Schema published at
 * `input/business-brief.schema.json` is derived from this and must be kept in
 * sync (see `pnpm --filter @pagekit/generator run cli -- emit-schema`).
 */

export const BusinessType = z.enum([
  "midwifery_practice",
  "physiotherapy_practice",
  "dental_clinic",
  "restaurant",
  "legal_consultant",
  "local_consultant",
  "local_service", // generic fallback vertical
]);
export type BusinessType = z.infer<typeof BusinessType>;

export const PrimaryGoal = z.enum([
  "registrations",
  "contact_requests",
  "phone_calls",
  "bookings",
  "visits",
]);

export const AnalyticsProvider = z.enum(["plausible", "ga4", "none"]);
export const FormsProvider = z.enum([
  "formspree",
  "netlify",
  "custom",
  "mailto",
  "none",
]);
export const CmsProvider = z.enum([
  "local-mdx",
  "local-json",
  "airtable",
  "notion",
  "hygraph",
  "none",
]);

const nonEmpty = z.string().trim().min(1);

export const ContactSchema = z.object({
  phone: nonEmpty.nullish(),
  email: z.email().nullish(),
  address: nonEmpty.nullish(),
  booking_url: z.url().nullish(),
});

export const BrandSchema = z.object({
  voice: nonEmpty,
  colors: z.array(nonEmpty).nullish(),
  typography_preference: nonEmpty.nullish(),
});

export const ComplianceSchema = z.object({
  regulated_industry: z.boolean(),
  medical_or_legal_claims_allowed: z.boolean(),
});

export const SeoSchema = z
  .object({
    primary_keyword: nonEmpty.optional(),
    secondary_keywords: z.array(nonEmpty).optional(),
    target_locations: z.array(nonEmpty).optional(),
    /** Canonical site origin, e.g. "https://praktijk.nl". Enables absolute
     * canonical/OpenGraph URLs, JSON-LD `url`, and a sitemap. */
    site_url: z.url().optional(),
  })
  .optional();

export const IntegrationsSchema = z
  .object({
    analytics: AnalyticsProvider.default("none"),
    forms: FormsProvider.default("none"),
    cms: CmsProvider.default("local-mdx"),
  })
  .default({ analytics: "none", forms: "none", cms: "local-mdx" });

export const MediaSchema = z
  .object({
    logo_path: nonEmpty.nullish(),
    image_folder: nonEmpty.nullish(),
  })
  .optional();

export const BusinessSchema = z.object({
  name: nonEmpty,
  type: BusinessType,
  country: nonEmpty,
  city: nonEmpty,
  language: nonEmpty.describe("BCP-47 / ISO language code, e.g. 'nl' or 'en'."),
  primary_goal: PrimaryGoal,
  short_description: nonEmpty,
  services: z.array(nonEmpty).min(1, "At least one service is required."),
  contact: ContactSchema,
  brand: BrandSchema,
  compliance: ComplianceSchema,
});

export const BriefSchema = z
  .object({
    business: BusinessSchema,
    seo: SeoSchema,
    integrations: IntegrationsSchema,
    media: MediaSchema,
  })
  .strict();

export type Brief = z.infer<typeof BriefSchema>;
export type Business = z.infer<typeof BusinessSchema>;
