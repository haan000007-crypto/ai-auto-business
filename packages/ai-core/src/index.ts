export type AiCapability = "TEXT" | "IMAGE" | "VIDEO";

export interface AiGenerationRequest {
  capability: AiCapability;
  model: string;
  prompt: string;
  input?: Record<string, unknown>;
  idempotencyKey: string;
}

export interface AiGenerationResult {
  provider: string;
  model: string;
  output: unknown;
  usage?: { inputTokens?: number; outputTokens?: number };
}

export interface AiProvider {
  readonly id: string;
  supports(capability: AiCapability, model: string): boolean;
  generate(request: AiGenerationRequest): Promise<AiGenerationResult>;
}

export class AiProviderRegistry {
  constructor(private readonly providers: AiProvider[]) {}

  resolve(capability: AiCapability, model: string): AiProvider {
    const provider = this.providers.find((candidate) =>
      candidate.supports(capability, model),
    );
    if (!provider) throw new Error(`No AI provider supports ${capability}/${model}.`);
    return provider;
  }
}

export * from "./command-center/index.js";
