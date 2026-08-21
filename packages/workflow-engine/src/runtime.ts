import { topologicallyOrder } from "./definition.js";
import type {
  JsonValue,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowNodeHandler,
} from "./types.js";

export interface WorkflowRunEvent {
  type: "NODE_STARTED" | "NODE_SUCCEEDED" | "NODE_FAILED";
  nodeKey: string;
  at: Date;
  detail?: JsonValue;
}

export class WorkflowExecutor {
  constructor(
    private readonly handlers: WorkflowNodeHandler[],
    private readonly publish: (event: WorkflowRunEvent) => Promise<void>,
  ) {}

  async execute(
    definition: WorkflowDefinition,
    context: WorkflowExecutionContext,
  ): Promise<Record<string, JsonValue>> {
    const nodes = new Map(definition.nodes.map((node) => [node.key, node]));
    const variables = { ...context.variables };

    for (const key of topologicallyOrder(definition)) {
      const node = nodes.get(key)!;
      const handler = this.handlers.find((candidate) => candidate.supports(node.kind));
      if (!handler) throw new Error(`No handler registered for node kind: ${node.kind}`);

      await this.publish({ type: "NODE_STARTED", nodeKey: key, at: new Date() });
      try {
        const result = await handler.execute(node, { ...context, variables });
        Object.assign(variables, result.variables ?? {});
        await this.publish({
          type: "NODE_SUCCEEDED",
          nodeKey: key,
          at: new Date(),
          detail: result.output,
        });
      } catch (error) {
        await this.publish({
          type: "NODE_FAILED",
          nodeKey: key,
          at: new Date(),
          detail: { message: error instanceof Error ? error.message : "Unknown workflow error" },
        });
        throw error;
      }
    }

    return variables;
  }
}
