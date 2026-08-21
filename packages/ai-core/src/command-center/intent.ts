import { z } from "zod";

export const CommandIntentSchema = z
  .object({
    intent: z.enum(["generate_images", "generate_video", "generate_text"]),
    product: z.string().trim().min(1).max(200),
    quantity: z.number().int().min(1).max(100),
    aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9"]),
    platform: z.enum(["facebook", "instagram", "tiktok", "web"]),
  })
  .strict();

export type CommandIntent = z.infer<typeof CommandIntentSchema>;

export interface IntentAnalyzer {
  analyze(command: string): Promise<CommandIntent>;
}

export const commandIntentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["intent", "product", "quantity", "aspectRatio", "platform"],
  properties: {
    intent: {
      type: "string",
      enum: ["generate_images", "generate_video", "generate_text"],
    },
    product: { type: "string", minLength: 1, maxLength: 200 },
    quantity: { type: "integer", minimum: 1, maximum: 100 },
    aspectRatio: { type: "string", enum: ["1:1", "4:5", "9:16", "16:9"] },
    platform: { type: "string", enum: ["facebook", "instagram", "tiktok", "web"] },
  },
} as const;
