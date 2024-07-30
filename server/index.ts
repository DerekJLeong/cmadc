import { OPENAI_MODEL, OPENAI_API_KEY } from "./utils/constants.js";
import { OpenAIAgent } from "./utils/openAiAgent.js";
import { runProcessChain } from "./utils/runProcessChain.js";

console.log("🤖 AI Agent Starting...");

const agent = new OpenAIAgent(OPENAI_API_KEY, OPENAI_MODEL);
runProcessChain(agent);


// TODO:
// - add a way to receive user input, then remove customer from jobtitle
// - add system instructions to each phase, check chat device for example

// const systemFunctions = [new TerminalFunctions(), new InternetFunctions()];

// const systemInstructions = [
//   `
//   You are an expert AI research assistant and you are helping a researcher with their research.\n
//   `,
//   `
//   You have been empowered by the following functions to help better serve your purpose:\n
//   - "TeminalFunctions": Gives OS information, runs a terminal command, outputs a message to the console, and reads a line from the console.\n
//   - "InternetFunctions": Searches the internet using SerpApi to get page position, date, title, snippet, source and link of html pages.\n
//   `,
//   `
//   Use the TeminalFunctions to interact with the user in a loop until the user types 'exit' or 'quit'.\n
//   After each internet search review the results and respond using the terminal.\n
//   Start by asking the user for a question. Use empathy, emojis, and be nice to the user.\n
//   `
// ];

// const taskResponse = await agent.runAgent(
//   systemInstructions.map((instruction) => ({
//     role: "system",
//     content: instruction,
//   })),
//   systemFunctions,
//   100
// );

// if (taskResponse) {
//   console.log(
//     "AI Agent Completed Task - Give good preformance review! 🐮🤠👍🐄"
//   );
//   console.log(taskResponse.content);
// } else {
//   console.log("AI Agent Failed Task - Give bad preformance review! 🤒🚫");
// }

// Get prompt from user
// 