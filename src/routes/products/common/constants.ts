import { z } from 'zod';

export const MediaSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  isThumbnail: z.boolean(),
  file: z.any().nullable() // File
});

export const EditProductMediaSchema = z.object({
  media: z.array(MediaSchema)
});
