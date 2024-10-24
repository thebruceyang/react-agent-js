import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentState, Feedback, ReviewerAgentConfig } from "../types.js";
import { v4 as uuidv4 } from "uuid";

export class ReviewerAgent {
  private model: ChatOpenAI;
  private goals: string[];
  private instructions: string[];

  constructor(config: ReviewerAgentConfig) {
    this.model = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.3,
    });
    this.goals = config.goals;
    this.instructions = config.instructions;
  }

  async review(state: AgentState): Promise<AgentState> {
    try {
      const systemPrompt = this.createSystemPrompt();
      const response = await this.model.call([
        new SystemMessage(systemPrompt),
        new HumanMessage(this.createReviewPrompt(state.context.currentDocument)),
      ]);

      const newFeedback: Feedback = {
        id: uuidv4(),
        content: response.content,
        status: "pending",
        source: "reviewer",
      };

      return {
        ...state,
        context: {
          ...state.context,
          status: "human_review",
          feedback: [...state.context.feedback, newFeedback],
        },
      };
    } catch (error) {
      console.error("Error in ReviewerAgent:", error);
      throw error;
    }
  }

  private createSystemPrompt(): string {
    return `You are a critical reviewer tasked with evaluating documents against specific goals and instructions.
Your role is to provide constructive feedback that will help improve the document.

Goals:
${this.goals.map((g) => `- ${g}`).join("\n")}

Instructions:
${this.instructions.map((i) => `- ${i}`).join("\n")}

Provide specific, actionable feedback that will help improve the document.`;
  }

  private createReviewPrompt(document: string): string {
    return `Please review the following document:

${document}

Evaluate the document against the goals and instructions provided.
Provide specific feedback on:
1. How well the document meets each goal
2. Adherence to the instructions
3. Specific suggestions for improvement

Format your response as a list of clear, actionable feedback points.`;
  }
}
