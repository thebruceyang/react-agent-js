export interface AgentState {
  messages: any[];
  context: {
    currentDocument: string;
    status: "writing" | "reviewing" | "human_review" | "complete";
    feedback: Feedback[];
  };
}

export interface Feedback {
  id: string;
  content: string;
  status: "pending" | "accepted" | "rejected" | "implemented";
  source: string;
}

export interface WriterAgentConfig {
  goals: string[];
  instructions: string[];
}
