import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(255),
  slug: z.string().min(3).max(255).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10, "Conteúdo deve ter no mínimo 10 caracteres"),
  coverImageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  tagIds: z.array(z.string().uuid()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
});

export const blogCategorySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const blogTagSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(80),
  slug: z.string().min(2).max(80).optional(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;
export type BlogTagInput = z.infer<typeof blogTagSchema>;
