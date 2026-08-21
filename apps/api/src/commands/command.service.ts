import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import {
  AiCommandCenter,
  OpenAiIntentAnalyzer,
  type CommandWorkflowResult,
} from "@ai-auto-business/ai-core";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "../database/database.service.js";
import { environment } from "../config/env.js";

@Injectable()
export class CommandService {
  constructor(private readonly database: DatabaseService) {}

  async createWorkflow(input: {
    organizationId: string;
    userId: string;
    command: string;
  }) {
    if (!environment.OPENAI_API_KEY) {
      throw new ServiceUnavailableException("AI command provider is not configured.");
    }

    const commandCenter = new AiCommandCenter(
      new OpenAiIntentAnalyzer({
        apiKey: environment.OPENAI_API_KEY,
        model: environment.OPENAI_COMMAND_MODEL,
      }),
    );
    const generated = await commandCenter.createWorkflow(input.command);
    const persisted = await this.persist(input.organizationId, generated);

    return {
      intent: generated.intent,
      plan: generated.plan,
      validation: generated.validation,
      workflow: {
        id: persisted.workflowId,
        versionId: persisted.workflowVersionId,
        name: generated.workflow.name,
        description: generated.workflow.description,
        definition: generated.workflow.definition,
      },
    };
  }

  private async persist(
    organizationId: string,
    generated: CommandWorkflowResult,
  ): Promise<{ workflowId: string; workflowVersionId: string }> {
    const key = `${toKey(generated.workflow.name)}-${randomUUID().slice(0, 8)}`;

    return this.database.client.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          organizationId,
          key,
          name: generated.workflow.name,
          description: generated.workflow.description,
        },
      });
      const version = await tx.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          version: 1,
          status: "DRAFT",
          definition: generated.workflow.definition as never,
          nodes: {
            create: generated.workflow.definition.nodes.map((node) => ({
              key: node.key,
              kind: node.kind,
              label: node.label,
              configuration: node.configuration as never,
              positionX: node.position.x,
              positionY: node.position.y,
            })),
          },
          edges: {
            create: generated.workflow.definition.edges.map((edge) => ({
              key: edge.key,
              sourceNodeKey: edge.sourceNodeKey,
              targetNodeKey: edge.targetNodeKey,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
              condition: edge.condition as never,
            })),
          },
        },
      });
      return { workflowId: workflow.id, workflowVersionId: version.id };
    });
  }
}

function toKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50) || "workflow";
}
