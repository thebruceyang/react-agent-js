import { MemorySaver } from '@langchain/langgraph';
import { createWriterReviewerGraph } from './graph.js';
import type { WriterReviewerState } from './types.js';

async function main() {
  const graph = createWriterReviewerGraph();

  const initialState: Partial<WriterReviewerState> = {
    goals: [
      'Create a clear and engaging technical document',
      'Ensure all concepts are explained for a beginner audience',
    ],
    instructions: [
      'Use simple language',
      'Include relevant examples',
      'Break complex concepts into digestible chunks',
    ],
  };

  const config = {
    configurable: {
      threadId: '1',
      checkpointer: new MemorySaver(),
    },
  };

  try {
    for await (const update of graph.stream(initialState, config)) {
      console.log('State Update:', update);
    }
  } catch (error) {
    console.error('Error in graph execution:', error);
  }
}
