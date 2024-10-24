import { StateGraph } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import { WriterAgent } from "../agents/writerAgent.js";
import { ReviewerAgent } from "../agents/reviewerAgent.js";
import { HumanAgent } from "../agents/humanAgent.js";
import { NodeInterrupt } from "@langchain/langgraph/errors.js";
import { AgentState, StateSchema, InputSchema, InitializedGraph } from "../types";

// Initialize agents
const writerAgent = new WriterAgent({
  goals: [],  // Will be populated from input
  instructions: []
});

const reviewerAgent = new ReviewerAgent({
  goals: [],
  instructions: []
});

const humanAgent = new HumanAgent();

// Node functions
async function write(state: AgentState, config?: RunnableConfig) {
  return await writerAgent.write(state);
}

async function review(state: AgentState, config?: RunnableConfig) {
  return await reviewerAgent.review(state);
}

async function humanReview(state: AgentState, config?: RunnableConfig) {
  return await humanAgent.reviewFeedback(state);
}

async function checkContinue(state: AgentState, config?: RunnableConfig) {
  return await humanAgent.shouldContinue(state);
}

// Create the graph
const builder = new StateGraph({
  channels: {
    state: StateSchema,
    input: InputSchema,
  }
});

// Add nodes
builder
  .addNode("write", write)
  .addNode("review", review)
  .addNode("human_review", humanReview)
  .addNode("check_continue", checkContinue)
  .addEdge("__start__", "write")
  .addEdge("write", "review")
  .addEdge("review", "human_review")
  .addEdge("human_review", "check_continue")
  .addConditionalEdges(
    "check_continue",
    (state) => state.context.status === "complete" ? "end" : "write"
  );

// Compile the graph
export const graph = builder.compile({
  interruptBefore: ["human_review", "check_continue"],
});

// Set graph name for better identification
graph.name = "Document Writing Collaboration Graph";

// Initialize the graph with configuration
export async function initializeGraph(goals: string[], instructions: string[]): Promise<InitializedGraph> {
  // Set initial state
  const initialState = {
    messages: [],
    context: {
      goals,
      instructions,
      currentDocument: "",
      status: "writing",
      feedback: []
    }
  };

  // Configure agents
  writerAgent.goals = goals;
  writerAgent.instructions = instructions;
  reviewerAgent.goals = goals;
  reviewerAgent.instructions = instructions;

  return {
    graph,
    initialState,
    config: {
      goals,
      instructions
    }
  };
}
