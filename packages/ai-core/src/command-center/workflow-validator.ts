import { validateWorkflowDefinition } from "@ai-auto-business/workflow-engine";
import type { GeneratedWorkflow } from "./workflow-generator.js";

export interface GeneratedWorkflowValidation {
  valid: boolean;
  errors: string[];
}

export class GeneratedWorkflowValidator {
  validate(workflow: GeneratedWorkflow): GeneratedWorkflowValidation {
    const graph = validateWorkflowDefinition(workflow.definition);
    const errors = [...graph.errors];
    const generator = workflow.definition.nodes.find((node) => node.key === "asset_generator");

    if (!generator) errors.push("Generated workflow requires an asset generator node.");
    if (generator && !["AI", "IMAGE", "VIDEO"].includes(generator.kind)) {
      errors.push("Asset generator must be an AI, IMAGE, or VIDEO node.");
    }

    return { valid: errors.length === 0, errors };
  }
}
