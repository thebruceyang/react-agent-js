import type { WriterReviewerState } from './types.js';

export interface HumanResponse {
  action: 'accept' | 'edit' | 'stop';
  editedFeedback?: string;
}

export const humanReviewNode = async (state: WriterReviewerState) => {
  const currentFeedback = state.feedbackHistory[state.feedbackHistory.length - 1];
  
  // This would be replaced with actual UI interaction
  const humanResponse = await getUserInput(
    currentFeedback.feedback,
    state.currentDocument
  );

  if (humanResponse.action === 'stop') {
    return {
      ...state,
      nextAgent: 'end' as const,
    };
  }

  const updatedFeedback = state.feedbackHistory.map((fb, index) => {
    if (index === state.feedbackHistory.length - 1) {
      return {
        ...fb,
        accepted: humanResponse.action === 'accept',
        edited: humanResponse.action === 'edit' ? humanResponse.editedFeedback : undefined,
      };
    }
    return fb;
  });

  return {
    ...state,
    feedbackHistory: updatedFeedback,
    nextAgent: 'writer' as const,
    iteration: state.iteration + 1,
  };
};

// This would be replaced with your actual UI implementation
async function getUserInput(
  feedback: string,
  document: string
): Promise<HumanResponse> {
  // Implement your UI interaction here
  return new Promise((resolve) => {
    // Simulated response for now
    resolve({
      action: 'accept',
      editedFeedback: undefined,
    });
  });
}
