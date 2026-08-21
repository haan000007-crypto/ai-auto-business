import type { WorkflowDefinition } from "./types.js";

export interface WorkflowDefinitionValidation {
  valid: boolean;
  errors: string[];
}

export function validateWorkflowDefinition(
  definition: WorkflowDefinition,
): WorkflowDefinitionValidation {
  const errors: string[] = [];
  const nodeKeys = new Set<string>();

  for (const node of definition.nodes) {
    if (!node.key.trim()) errors.push("Each node requires a key.");
    if (nodeKeys.has(node.key)) errors.push(`Duplicate node key: ${node.key}.`);
    nodeKeys.add(node.key);
  }

  const triggers = definition.nodes.filter((node) => node.kind === "TRIGGER");
  if (triggers.length !== 1) errors.push("A workflow requires exactly one trigger node.");

  const edgeKeys = new Set<string>();
  for (const edge of definition.edges) {
    if (!edge.key.trim()) errors.push("Each edge requires a key.");
    if (edgeKeys.has(edge.key)) errors.push(`Duplicate edge key: ${edge.key}.`);
    edgeKeys.add(edge.key);
    if (!nodeKeys.has(edge.sourceNodeKey)) errors.push(`Unknown edge source: ${edge.sourceNodeKey}.`);
    if (!nodeKeys.has(edge.targetNodeKey)) errors.push(`Unknown edge target: ${edge.targetNodeKey}.`);
    if (edge.sourceNodeKey === edge.targetNodeKey) errors.push(`Self edge is not allowed: ${edge.key}.`);
  }

  if (errors.length === 0 && hasCycle(definition)) {
    errors.push("Workflow graph must be acyclic in the initial runtime.");
  }

  return { valid: errors.length === 0, errors };
}

export function topologicallyOrder(definition: WorkflowDefinition): string[] {
  const validation = validateWorkflowDefinition(definition);
  if (!validation.valid) throw new Error(validation.errors.join(" "));

  const incoming = new Map(definition.nodes.map((node) => [node.key, 0]));
  const outbound = new Map(definition.nodes.map((node) => [node.key, [] as string[]]));

  for (const edge of definition.edges) {
    incoming.set(edge.targetNodeKey, (incoming.get(edge.targetNodeKey) ?? 0) + 1);
    outbound.get(edge.sourceNodeKey)?.push(edge.targetNodeKey);
  }

  const ready = [...incoming.entries()]
    .filter(([, count]) => count === 0)
    .map(([key]) => key);
  const ordered: string[] = [];

  while (ready.length > 0) {
    const key = ready.shift()!;
    ordered.push(key);
    for (const next of outbound.get(key) ?? []) {
      const count = (incoming.get(next) ?? 1) - 1;
      incoming.set(next, count);
      if (count === 0) ready.push(next);
    }
  }
  return ordered;
}

function hasCycle(definition: WorkflowDefinition): boolean {
  const adjacency = new Map(definition.nodes.map((node) => [node.key, [] as string[]]));
  for (const edge of definition.edges) {
    adjacency.get(edge.sourceNodeKey)?.push(edge.targetNodeKey);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (key: string): boolean => {
    if (visiting.has(key)) return true;
    if (visited.has(key)) return false;
    visiting.add(key);
    for (const next of adjacency.get(key) ?? []) {
      if (visit(next)) return true;
    }
    visiting.delete(key);
    visited.add(key);
    return false;
  };

  return definition.nodes.some((node) => visit(node.key));
}
