export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type WorkflowNodeKind =
  | "TRIGGER"
  | "ACTION"
  | "CONDITION"
  | "AI"
  | "IMAGE"
  | "VIDEO"
  | "DELAY"
  | "INTEGRATION";

export interface WorkflowNodeDefinition {
  key: string;
  kind: WorkflowNodeKind;
  label: string;
  configuration: JsonValue;
  position: { x: number; y: number };
}

export interface WorkflowEdgeDefinition {
  key: string;
  sourceNodeKey: string;
  targetNodeKey: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: JsonValue;
}

export interface WorkflowDefinition {
  nodes: WorkflowNodeDefinition[];
  edges: WorkflowEdgeDefinition[];
}

export type WorkflowRunStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type NodeExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "SKIPPED";

export interface WorkflowExecutionContext {
  runId: string;
  workflowId: string;
  workflowVersionId: string;
  input: JsonValue;
  variables: Record<string, JsonValue>;
}

export interface NodeExecutionResult {
  output?: JsonValue;
  variables?: Record<string, JsonValue>;
}

export interface WorkflowNodeHandler {
  supports(kind: WorkflowNodeKind): boolean;
  execute(
    node: WorkflowNodeDefinition,
    context: WorkflowExecutionContext,
  ): Promise<NodeExecutionResult>;
}
