import type { CommandIntent, IntentAnalyzer } from "./intent.js";
import { WorkflowGenerator, type GeneratedWorkflow } from "./workflow-generator.js";
import { WorkflowPlanner, type WorkflowPlan } from "./workflow-planner.js";
import {
  GeneratedWorkflowValidator,
  type GeneratedWorkflowValidation,
} from "./workflow-validator.js";

export interface CommandWorkflowResult {
  intent: CommandIntent;
  plan: WorkflowPlan;
  workflow: GeneratedWorkflow;
  validation: GeneratedWorkflowValidation;
}

export class AiCommandCenter {
  constructor(
    private readonly analyzer: IntentAnalyzer,
    private readonly planner = new WorkflowPlanner(),
    private readonly generator = new WorkflowGenerator(),
    private readonly validator = new GeneratedWorkflowValidator(),
  ) {}

  async createWorkflow(command: string): Promise<CommandWorkflowResult> {
    const intent = await this.analyzer.analyze(command);
    const plan = this.planner.plan(intent);
    const workflow = this.generator.generate(plan);
    const validation = this.validator.validate(workflow);

    if (!validation.valid) {
      throw new Error(`Generated workflow is invalid: ${validation.errors.join(" ")}`);
    }
    return { intent, plan, workflow, validation };
  }
}
