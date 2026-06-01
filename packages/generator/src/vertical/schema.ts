import { z } from "zod";

/** Schema for a `verticals/<id>/vertical.yaml` definition. */
export const VerticalSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  regulated: z.boolean().default(false),
  recommended_theme: z.string().min(1),
  /** Conservative default schema.org type for the LocalBusiness node. */
  schema_default: z.string().min(1),
  primary_goal_options: z.array(z.string()).default([]),
  /** Pages that every site in this vertical must include, by page-type id. */
  required_pages: z.array(z.string()).min(1),
  /** Free-text guardrails surfaced to the content-generation agent. */
  content_cautions: z.array(z.string()).default([]),
});

export type Vertical = z.infer<typeof VerticalSchema>;
