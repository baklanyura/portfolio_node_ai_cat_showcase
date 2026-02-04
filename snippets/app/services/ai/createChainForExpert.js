import {ChatPromptTemplate} from "@langchain/core/prompts";
import {PromptRepository} from "../../repositories/PromptRepository.js";
/**
 * Defines the `createChain` variable.
 *
 * This variable is an asynchronous function that creates a chatbot communication chain.
 *
 * @async
 * @function createChain
 * @returns {Promise<void>} A promise that resolves once the chain is created.
 */
export const createChainForExpert = async (modelAI) => {

    const promptRepo = new PromptRepository();
    let existedPrompt = await promptRepo.getPromptByName('prompt_for_expert');
    if (!existedPrompt) {
        existedPrompt = await promptRepo.createPrompt('prompt_for_expert', 'Carefully analyze the input: {input}. If the {input} contains phrases or expressions explicitly indicating that the user does not know, does not have the information, or cannot answer the question (such as "I don\'t know," "I don\'t have information," "I\'m not sure," "I cannot answer," "Sorry, but I don\'t know about," or similar phrases in any language), then respond briefly in the input language with: I need expert help to answer the question: {question}. If the input contains no such explicit statements, respond with a single word in English: false.');
    }

    /**
     * A template for constructing a chat prompt. It leverages predefined system
     * messages and dynamically includes user input and chat history. The template
     * consists of:
     * 1. A system message defined by `systemTemplate`.
     * 2. A placeholder for chat history.
     * 3. A user message that will be filled with `{input}`.
     *
     * @constant
     * @type {ChatPromptTemplate}
     */
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", existedPrompt._promptText],
        ["user", "Input: {input}"],
        ["user", "Question: {question}"]
    ]);
    return prompt.pipe(modelAI);
}