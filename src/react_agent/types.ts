import { BaseMessage } from "@langchain/core/messages";

// Define proper state interface with TypeScript types
interface WriterReviewerState {
  goals: string[];
  instructions: string[];
  currentDocument: string;
  feedbackHistory: Array<{
    feedback: string;
    accepted: boolean;
    edited?: string;
    timestamp: string; // Add timestamp for proper history tracking
  }>;
  messages: Array<HumanMessage | AIMessage | SystemMessage>;
  nextAgent: 'writer' | 'reviewer' | 'human' | 'end';
  iteration: number;
  error?: string; // Add error field for error handling
}
