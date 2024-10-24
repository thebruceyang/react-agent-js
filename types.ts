import { BaseMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";
import { z } from "zod";

export interface AgentState {
  messages: BaseMessage[];
  context: {
    goals: string[];
    instructions: string[];
    currentDocument: string;
    feedback: Feedback[];
    status: "writing" | "reviewing" | "human_review" | "complete";
  };
}

export interface Feedback {
  id: string;
  content: string;
  status: "pending" | "accepted" | "rejected" | "implemented";
  source: "reviewer" | "human";
}

export interface WriterAgentConfig {
  goals: string[];
  instructions: string[];
}

export interface ReviewerAgentConfig {
  goals: string[];
  instructions: string[];
}

// Add new types for graph initialization
export interface GraphConfig {
  goals: string[];
  instructions: string[];
}

export interface InitializedGraph {
  graph: StateGraph;
  initialState: AgentState;
  config: GraphConfig;
}

// Add type for input schema
export interface GraphInput {
  goals: string[];
  instructions: string[];
}

// Add Zod schemas
export const FeedbackSchema = z.object({
  id: z.string(),
  content: z.string(),
  status: z.enum(["pending", "accepted", "rejected", "implemented"]),
  source: z.enum(["reviewer", "human"])
}) as z.ZodType<Feedback>;

export const StateSchema = z.object({
  messages: z.array(z.any()),  // BaseMessage[] will be validated at runtime
  context: z.object({
    goals: z.array(z.string()),
    instructions: z.array(z.string()),
    currentDocument: z.string(),
    status: z.enum(["writing", "reviewing", "human_review", "complete"]),
    feedback: z.array(FeedbackSchema)
  })
}) as z.ZodType<AgentState>;

export const InputSchema = z.object({
  goals: z.array(z.string()),
  instructions: z.array(z.string())
}) as z.ZodType<GraphInput>;
