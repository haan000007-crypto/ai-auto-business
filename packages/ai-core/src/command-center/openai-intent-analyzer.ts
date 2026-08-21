import {
  CommandIntentSchema,
  commandIntentJsonSchema,
  type CommandIntent,
  type IntentAnalyzer,
} from "./intent.js";

export class OpenAiIntentAnalyzer implements IntentAnalyzer {
  constructor(
    private readonly options: {
      apiKey: string;
      model: string;
      fetch?: typeof fetch;
    },
  ) {}

  async analyze(command: string): Promise<CommandIntent> {
    const response = await (this.options.fetch ?? fetch)(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.options.model,
          store: false,
          instructions:
            "You are the intent analyzer for an enterprise workflow system. Return only the requested structured data. Extract the requested outcome. If platform is not explicit, infer the most likely advertising platform; use facebook as the default. Never add explanatory prose.",
          input: command,
          text: {
            format: {
              type: "json_schema",
              name: "workflow_intent",
              strict: true,
              schema: commandIntentJsonSchema,
            },
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Intent analysis failed with HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as { output_text?: string };
    if (!payload.output_text) throw new Error("Intent analyzer returned no structured output.");

    return CommandIntentSchema.parse(JSON.parse(payload.output_text));
  }
}
