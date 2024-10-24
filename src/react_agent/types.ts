import { BaseMessage } from "@langchain/core/messages";

export interface WriterReviewerState {
  goals: string[];
  instructions: string[];
  currentDocument: string;
  feedbackHistory: Array<{
    feedback: string;
    accepted: boolean;
    edited?: string;
  }>;
  messages: BaseMessage[];
  nextAgent: 'writer' | 'reviewer' | 'human' | 'end';
  iteration: number;
}
