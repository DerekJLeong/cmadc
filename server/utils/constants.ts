import { config as configEnv } from "dotenv";

configEnv();

export const PORT = process.env.PORT;
export const MAX_CORES = process.env.MAX_CORES
export const OPENAI_MODEL = process.env.OPENAI_MODEL;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

export const PLAN_FILE_NAME = "plan.txt";
export const RESEARCH_FILE_NAME = "research.txt";
export const RESEARCH_REVIEW_FILE_NAME = "research_review.txt";
export const ANALYSUS_FILE_NAME = "analysis.txt";
export const REPORT_FILE = "report.txt";
export const REPORT_REVIEW_FILE = "report_review.txt";