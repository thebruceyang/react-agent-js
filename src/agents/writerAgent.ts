import { ChatOpenAI } from "langchain/chat_models";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { AgentState, Feedback, WriterAgentConfig } from "./types";

export class WriterAgent {
  private model: ChatOpenAI;
  private goals: string[];
  private instructions: string[];

  constructor(config: WriterAgentConfig) {
    this.model = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
    });
    this.goals = config.goals;
    this.instructions = config.instructions;
  }

  async write(state: AgentState): Promise<AgentState> {
    try {
      const systemPrompt = this.createSystemPrompt();
      const pendingFeedback = state.context.feedback.filter(
        (f) => f.status === "accepted" && f.status !== "implemented"
      );

      const response = await this.model.call([
        new SystemMessage(systemPrompt),
        new HumanMessage(this.createWritePrompt(state.context.currentDocument, pendingFeedback)),
      ]);

      return {
        messages: state.messages,  // Ensure we maintain the BaseMessage[] type
        context: {
          ...state.context,
          currentDocument: response.content,
          status: "reviewing",
          feedback: state.context.feedback.map((f) => 
            f.status === "accepted" ? { ...f, status: "implemented" } : f
          ),
        },
      };
    } catch (error) {
      console.error("Error in WriterAgent:", error);
      throw error;
    }
  }

  private createSystemPrompt(): string {
    return `You are a professional writer tasked with creating documents according to specific goals and instructions.
Goals:
${this.goals.map((g) => `- ${g}`).join("\n")}

Instructions:
${this.instructions.map((i) => `- ${i}`).join("\n")}`;
  }

  private createWritePrompt(currentDocument: string, feedback: Feedback[]): string {
    if (!currentDocument) {
      return "Please write the initial document based on the goals and instructions provided.";
    }

    return `Please update the following document based on the feedback provided:

Current Document:
${currentDocument}

Feedback to Implement:
${feedback.map((f) => `- ${f.content}`).join("\n")}

Please provide the complete updated document incorporating this feedback while maintaining alignment with the original goals and instructions.`;
  }
}
