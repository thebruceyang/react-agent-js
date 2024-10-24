/**
 * Default prompts used by the agent.
 */

import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "langchain/prompts";

export const writerSystemPrompt = SystemMessagePromptTemplate.fromTemplate(`
You are an expert writer. Your task is to write or revise a document based on the following goals and instructions. 
If there is feedback, incorporate it thoughtfully into your revision.

Goals:
{goals}

Instructions:
{instructions}

Write in a clear, professional style while following all goals and instructions carefully.
`);

export const writerHumanPrompt = HumanMessagePromptTemplate.fromTemplate(`
{previous_document}

{feedback_to_incorporate}

Write or revise the document accordingly.
`);

export const reviewerSystemPrompt = SystemMessagePromptTemplate.fromTemplate(`
You are an expert reviewer. Your task is to evaluate the document against the following goals and instructions:

Goals:
{goals}

Instructions:
{instructions}

Provide specific, actionable feedback for improving the document. Focus on substantial improvements rather than minor edits.
Format your feedback as clear, numbered points.
`);

export const reviewerHumanPrompt = HumanMessagePromptTemplate.fromTemplate(`
Please review this document:

{document}

Provide your feedback in numbered points, focusing on how well it meets the goals and instructions.
`);
