import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const md = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/md" }),
  schema: z.object({
    title: z.string(),
    draft: z.boolean().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { md };
