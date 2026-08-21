import type { WorkflowDefinition } from "@ai-auto-business/workflow-engine";
import type { WorkflowPlan } from "./workflow-planner.js";

export interface GeneratedWorkflow {
  name: string;
  description: string;
  definition: WorkflowDefinition;
}

export class WorkflowGenerator {
  generate(plan: WorkflowPlan): GeneratedWorkflow {
    return {
      name: plan.name,
      description: plan.description,
      definition: {
        nodes: [
          {
            key: "command_trigger",
            kind: "TRIGGER",
            label: "Command Trigger",
            configuration: {
              trigger: "COMMAND",
              intent: plan.intent.intent,
            },
            position: { x: 0, y: 0 },
          },
          {
            key: "asset_generator",
            kind: plan.generator.kind,
            label: plan.generator.label,
            configuration: {
              operation: plan.generator.operation,
              product: plan.intent.product,
              quantity: plan.intent.quantity,
              aspectRatio: plan.intent.aspectRatio,
              platform: plan.intent.platform,
            },
            position: { x: 360, y: 0 },
          },
        ],
        edges: [
          {
            key: "trigger_to_generator",
            sourceNodeKey: "command_trigger",
            targetNodeKey: "asset_generator",
          },
        ],
      },
    };
  }
}
