import { NodeInterrupt } from "@langchain/langgraph/errors.js";

export class HumanAgent {
  async reviewFeedback(state: AgentState): Promise<AgentState> {
    const pendingFeedback = state.context.feedback.filter(
      (f) => f.status === "pending"
    );

    // Raise an interrupt to pause execution and wait for human input
    if (pendingFeedback.length > 0) {
      throw new NodeInterrupt(
        "Waiting for human review of pending feedback",
        { pendingFeedback }
      );
    }

    return state;
  }

  async handleHumanInput(state: AgentState, humanDecisions: Feedback[]): Promise<AgentState> {
    // Update state with human decisions
    return {
      ...state,
      context: {
        ...state.context,
        status: "writing",
        feedback: state.context.feedback.map((f) => {
          const reviewed = humanDecisions.find((rf) => rf.id === f.id);
          return reviewed || f;
        }),
      },
    };
  }

  async shouldContinue(state: AgentState): Promise<boolean> {
    // Raise an interrupt to check if human wants to continue
    throw new NodeInterrupt(
      "Should the agent continue?",
      { currentState: state }
    );
  }
}
