import OpenAI from "openai";
import debug from "debug";

import { ISystemPhase, JobTitle, Phase } from "./types.js";
import { processChainConfig, teamConfig } from "./config.js";
import { OpenAIAgent } from "./openAiAgent.js";

const log = debug("PhaseChainRunner");

if (process.env.DEBUG) debug.enable("PhaseChainRunner");

const buildPhaseInstructions = (
  phaseConfig: ISystemPhase
): OpenAI.Chat.ChatCompletionMessage[] => {
  const { user, assistant, phase, instructions } = phaseConfig;

  const userAgentConfig = teamConfig.find(
    (userConfig) => userConfig.title === user
  );
  const assistantAgentConfig = teamConfig.find(
    (userConfig) => userConfig.title === assistant
  );

  if (!userAgentConfig && user !== JobTitle.Customer) {
    throw new Error(`No user agent config found for user ${user}`);
  }
  if (!assistantAgentConfig) {
    throw new Error(
      `No assistant agent config found for assistant ${assistant}`
    );
  }

  const systemInstructions: OpenAI.Chat.ChatCompletionMessage[] =
    instructions.map((instruction) => ({
      role: "system",
      content: instruction,
    }));
  const userRoleInstructions: OpenAI.Chat.ChatCompletionMessage[] =
    userAgentConfig?.instructions?.map((instruction) => ({
      role: "user",
      content: instruction,
    })) ?? [];
  const assistantRoleInstructions: OpenAI.Chat.ChatCompletionMessage[] =
    assistantAgentConfig.instructions.map((instruction) => ({
      role: "assistant",
      content: instruction,
    }));
  const userTaskInstructions: OpenAI.Chat.ChatCompletionMessage[] =
    userAgentConfig?.phaseTasks
      ?.find((task) => task.phase === phase)
      ?.instructions.map((instruction) => ({
        role: "user",
        content: instruction,
      })) ?? [];
  const assistantTaskInstructions: OpenAI.Chat.ChatCompletionMessage[] =
    assistantAgentConfig.phaseTasks
      .find((task) => task.phase === phase)
      ?.instructions.map((instruction) => ({
        role: "assistant",
        content: instruction,
      })) ?? [];

  return [
    ...systemInstructions,
    ...userRoleInstructions,
    ...assistantRoleInstructions,
    ...userTaskInstructions,
    ...assistantTaskInstructions,
  ];
};

const checkMessageForDelimittedKeyword = (
  message: string,
  keyword: string,
  delimitter: string = "```"
) => {
  return message
    .split(delimitter)
    .filter((_, index) => index % 2 === 1)
    .some((chunk) =>
      chunk.trim().toLowerCase().includes(keyword.toLowerCase())
    );
};

export const runProcessChain = async (agent: OpenAIAgent) => {
  let currentPhase: Phase = Phase.PromptUserForTopic;
  let messages: OpenAI.Chat.ChatCompletionMessage[] = [];

  do {
    const currentPhaseConfig = processChainConfig.find(
      (phaseConfig) => phaseConfig.phase === currentPhase
    );
    if (!currentPhaseConfig) {
      throw new Error(
        `No phase config found for current phase ${currentPhase}`
      );
    }
    const { user, assistant, phase, instructions } = currentPhaseConfig;
    log(
      `The current phase is ${currentPhase}. The user is ${user} and the assistant is ${assistant}.`
    );

    const phaseInstructions = buildPhaseInstructions(currentPhaseConfig);
    const assistantFunctions =
      teamConfig.find((userConfig) => userConfig.title === assistant)
        ?.functions ?? [];

    // Preform the phase task
    const taskMessageLog = await agent.runAgent(
      phaseInstructions,
      assistantFunctions,
      30
    );

    if (taskMessageLog) {
      if (currentPhaseConfig.nextPhase.length === 1) {
        // Contue to next phase
        currentPhase = currentPhaseConfig.nextPhase[0];
      } else {
        const taskFinalMessage =
          taskMessageLog[taskMessageLog.length - 1]?.content ?? "";

        if (checkMessageForDelimittedKeyword(taskFinalMessage, "rejected")) {
          currentPhase = currentPhaseConfig.nextPhase[0];
        } else if (
          checkMessageForDelimittedKeyword(taskFinalMessage, "approved")
        ) {
          currentPhase = currentPhaseConfig.nextPhase[1];
        } else {
          log("Missing keyword in final message. Retrying phase tasks...");
          // retry phase tasks
          continue;
        }
      }
      console.log(`Moving to next phase: ${currentPhase}`, taskMessageLog);
      messages = [...messages, ...taskMessageLog];
    } else {
      console.log("AI Agent Failed Task - Give bad preformance review! 🤒🚫");
    }
  } while (currentPhase !== Phase.ProjectComplete);
  console.log(messages);
  console.log(
    "AI Agent Completed Task - Give good preformance review! 🐮🤠👍🐄"
  );
};
