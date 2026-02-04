import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";
import {createStuffDocumentsChain} from "langchain/chains/combine_documents";
import {createRetrievalChain} from "langchain/chains/retrieval";
import {PromptRepository} from "../../repositories/PromptRepository.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
/**
 * Defines the `createChain` variable.
 *
 * This variable is an asynchronous function that creates a chatbot communication chain.
 *
 * @async
 * @function createChain
 * @returns {Promise<void>} A promise that resolves once the chain is created.
 */
export const createChain = async (modelAI, vectorStore) => {
    const retriever = vectorStore.asRetriever({k: 5});

    const promptRepo = new PromptRepository();
    const existedPrompt = await promptRepo.getPromptByName('prompt_with_context');

    const systemTemplate = [
        existedPrompt ? `${existedPrompt._promptText}` : `Just answer user's questions.`,
        `\n\n`,
        `Context: {context}`,
    ].join("");
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
        ["system", systemTemplate],
        ["user", "{input}"]
    ]);

    /**
     * A chain object representing a sequence of operations to create
     * documents using a provided AI language model, a specific prompt,
     * and an output parser.
     *
     * @typedef {Object} Chain
     *
     * @property {Object} Chain.llm - The AI language model used for document creation.
     * @property {string} Chain.prompt - The prompt provided to the language model.
     * @property {Object} Chain.outputParser - The parser used to process the output from the language model.
     */
    const chain = await createStuffDocumentsChain({
        llm: modelAI,
        prompt: prompt,
        outputParser: new StringOutputParser()
    });
    await promptRepo.closeConnection();
    return await createRetrievalChain({
        combineDocsChain: chain,
        retriever: retriever,
        maxTokens: 2000
    });
}