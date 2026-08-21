import type { CommandIntent } from "./intent.js";

export type WorkflowPlanNodeKind = "IMAGE" | "VIDEO" | "AI";

export interface WorkflowPlan {
  name: string;
  description: string;
  intent: CommandIntent;
  generator: {
    kind: WorkflowPlanNodeKind;
    operation: "IMAGE_GENERATOR" | "VIDEO_GENERATOR" | "TEXT_GENERATOR";
    label: string;
  };
}

export class WorkflowPlanner {
  plan(intent: CommandIntent): WorkflowPlan {
    const generator = {
      generate_images: {
        kind: "IMAGE" as const,
        operation: "IMAGE_GENERATOR" as const,
        label: "Image Generator",
      },
      generate_video: {
        kind: "VIDEO" as const,
        operation: "VIDEO_GENERATOR" as const,
        label: "Video Generator",
      },
      generate_text: {
        kind: "AI" as const,
        operation: "TEXT_GENERATOR" as const,
        label: "AI Text Generator",
      },
    }[intent.intent];

    return {
      name: `${generator.label}: ${intent.product}`,
      description: `Generate ${intent.quantity} asset(s) for ${intent.product} on ${intent.platform}.`,
      intent,
      generator,
    };
  }
}
