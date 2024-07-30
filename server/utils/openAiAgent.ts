import "reflect-metadata";
import debug from "debug";
import OpenAI from "openai";

const log = debug("OpenAIAgent");

if (process.env.DEBUG) debug.enable("OpenAIAgent");

export class OpenAIAgent {
  private model: string;
  private openai: OpenAI;

  constructor(apiKey?: string, model?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    this.model = model || process.env.OPENAI_MODEL || "gpt-3.5-turbo-0613";
    log("OpenAI Wrapper initialized with model:", this.model);
  }

  private getAllFunctionMetadata(instance: any): any[] {
    const metadataList: any[] = [];
    for (const propertyName of Object.getOwnPropertyNames(
      Object.getPrototypeOf(instance)
    )) {
      const metadata = Reflect.getMetadata(
        "ai_function",
        instance,
        propertyName
      );
      if (metadata) {
        metadataList.push(metadata);
      }
    }
    log("Metadata:" + JSON.stringify(metadataList));
    return metadataList;
  }

  private async createChatCompletion(
    messages: OpenAI.Chat.ChatCompletionMessage[],
    functionsObjects: any[], // accept array of function objects
    function_call: "auto" = "auto"
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage | undefined> {
    let functions: any[] = []; // prepare a list to store all functions metadata
    for (const functionsObject of functionsObjects) {
      functions = [
        ...functions,
        ...this.getAllFunctionMetadata(functionsObject),
      ]; // add functions metadata from each object
    }
    log("Initiating chat completion with messages:", messages);
    const chatCompletion: OpenAI.Chat.ChatCompletion =
      await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        functions: functions,
        function_call: function_call,
      });
    log("Received response:", chatCompletion.choices);

    return chatCompletion.choices[0].message;
  }

  async runAgent(
    prompt: OpenAI.Chat.ChatCompletionMessage[] | string,
    functionsObjects: any[], // accept array of function objects
    maxIterations: number = 5
  ): Promise<OpenAI.ChatCompletionMessage[] | undefined> {
    let i = 0;
    let currentMessage: OpenAI.Chat.ChatCompletionMessage | undefined;
    let messages: OpenAI.Chat.ChatCompletionMessage[] =
      typeof prompt === "string" ? [{ role: "user", content: prompt }] : prompt;

    do {
      log(`Iteration: ${i}`);
      currentMessage = await this.createChatCompletion(
        messages,
        functionsObjects
      );

      if (!currentMessage) {
        log("No response received. Exiting...");
        return;
      }

      if (currentMessage) {
        //   for (const choice of response) {
        if (currentMessage?.function_call) {
          const { name: functionName, arguments: functionArgs } =
            currentMessage.function_call;
          log(`Calling function ${functionName} with args:`, functionArgs);
          try {
            let functionResponse;
            for (const functionsObject of functionsObjects) {
              // look for the function in all provided function objects
              if (functionsObject[functionName]) {
                functionResponse = await functionsObject[functionName](
                  ...Object.values(JSON.parse(functionArgs || "") || {})
                );
                break;
              }
            }
            messages.push(currentMessage);
            messages.push({
              role: "function",
              name: functionName,
              content: functionResponse,
            } as OpenAI.Chat.ChatCompletionMessage);
          } catch (error: any) {
            messages.push(currentMessage);
            messages.push({
              role: "function",
              name: functionName,
              content: `Error: ${error.message}`,
            } as OpenAI.Chat.ChatCompletionMessage);
          }
        } else {
          messages.push(currentMessage);
        }
        //   }
      }
      i++;
    } while (i < maxIterations && currentMessage?.function_call);
    log("Final response:", currentMessage);
    return messages;
  }
}
