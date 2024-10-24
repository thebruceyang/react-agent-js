import { StateGraph, START, END } from '@langchain/langgraph';
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { writerSystemPrompt, writerHumanPrompt, reviewerSystemPrompt, reviewerHumanPrompt } from './prompts.js';
import type { WriterReviewerState } from './types.js';

const model = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
});

// Writer Agent Node
const writerAgent = async (state: WriterReviewerState) => {
  const messages = await writerSystemPrompt.format({
    goals: state.goals.join('\n'),
    instructions: state.instructions.join('\n'),
  });

  const context = await writerHumanPrompt.format({
    previous_document: state.currentDocument || 'No previous document',
    feedback_to_incorporate: state.feedbackHistory.length > 0 
      ? state.feedbackHistory[state.feedbackHistory.length - 1].accepted 
        ? state.feedbackHistory[state.feedbackHistory.length - 1].feedback
        : state.feedbackHistory[state.feedbackHistory.length - 1].edited
      : 'Write the initial document.',
  });

  const response = await model.call([messages, new HumanMessage(context)]);

  return {
    ...state,
    currentDocument: response.content,
    nextAgent: 'reviewer' as const,
  };
};

// Reviewer Agent Node
const reviewerAgent = async (state: WriterReviewerState) => {
  const messages = await reviewerSystemPrompt.format({
    goals: state.goals.join('\n'),
    instructions: state.instructions.join('\n'),
  });

  const context = await reviewerHumanPrompt.format({
    document: state.currentDocument,
  });

  const response = await model.call([messages, new HumanMessage(context)]);

  return {
    ...state,
    feedbackHistory: [...state.feedbackHistory, { feedback: response.content, accepted: false }],
    nextAgent: 'human' as const,
  };
};

// Create and configure the graph
export function createWriterReviewerGraph() {
  const graph = new StateGraph<WriterReviewerState>({
    initialState: {
      goals: [],
      instructions: [],
      currentDocument: '',
      feedbackHistory: [],
      messages: [],
      nextAgent: 'writer',
      iteration: 0,
    }
  });

  // Add nodes
  graph.addNode('writer', writerAgent);
  graph.addNode('reviewer', reviewerAgent);
  graph.addNode('human', humanReviewNode);

  // Add edges
  graph.addEdge(START, 'writer');
  graph.addEdge('writer', 'reviewer');
  graph.addEdge('reviewer', 'human');
  graph.addEdge('human', 'writer');
  graph.addConditionalEdges(
    'human',
    (state) => state.nextAgent === 'end' ? END : 'writer'
  );

  return graph.compile();
}
