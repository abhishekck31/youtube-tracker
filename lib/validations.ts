import { z } from "zod"

export const videoFormSchema = z.object({
  educatorId: z.string().min(1, "Please select an educator"),
  youtubeLink: z
    .string()
    .min(1, "YouTube link is required")
    .url("Please enter a valid URL")
    .refine((url) => {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/
      return youtubeRegex.test(url)
    }, "Please enter a valid YouTube URL"),
})

export const educatorSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  department: z.string().optional(),
  initials: z.string().min(1).max(3),
  avatar: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const videoEntrySchema = z.object({
  id: z.string(),
  educator: z.string().min(1),
  educatorId: z.string().min(1),
  videoTitle: z.string().min(1),
  duration: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid duration format"),
  date: z.string().datetime(),
  youtubeLink: z.string().url(),
  status: z.enum(["active", "archived", "processing", "error"]),
  thumbnailUrl: z.string().url().optional(),
  viewCount: z.number().optional(),
  tags: z.array(z.string()).default([]),
})

export type VideoFormData = z.infer<typeof videoFormSchema>
export type Educator = z.infer<typeof educatorSchema>
export type VideoEntry = z.infer<typeof videoEntrySchema>
