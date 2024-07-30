import { config, getJson } from "serpapi";
import * as Dotenv from "dotenv";
import { openAIFunction } from "./openAiFunction.js";

Dotenv.config();

export class InternetFunctions {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || "";
    config.api_key = this.apiKey; // set the API key in global config
  }

  @openAIFunction(
    "Searches the internet using SerpApi to get page position, date, title, snippet, source and link of html pages",
    {
      query: {
        type: "string",
        description: "The search query",
        required: true,
      },
    }
  )
  async searchInternet(query: string): Promise<string> {
    const response = await getJson("google", {
      q: query,
      api_key: this.apiKey,
    });
    const results = response["organic_results"].map((result: any) =>
      JSON.stringify({
        position: result.position,
        result: result.date,
        title: result.title,
        snippet: result.snippet,
        source: result.source,
        link: result.link,
      })
    );
    return `The search results for "${query}" are:\n${results.join("\n")}`;
  }
}
