export enum JobTitle {
  CEO = "Chief Executive Officer",
  Researcher = "Researcher",
  ResearchAnalyst = "Research Analyst",
  FactChecker = "Fact Checker",
  Writer = "Writer",
  Editor = "Editor",
  HotAssistant = "Hot Assistant",
  Customer = "Customer",
}

export enum Phase {
  PromptUserForTopic = "Prompt User For Topic",
  PlanResearchProject = "Plan Research Project",
  ResearchProjectTopic = "Research Project Topic",
  FactCheckResearch = "Fact Check Research",
  ReviseResearchWithFacts = "Revise Research With Facts",
  AnalyzeResearch = "Analyze Research",
  DraftResearchReport = "Draft Research Report",
  ReviewDraftResearchReport = "Review Draft Research Report",
  ReviseDraftResearchReport = "Revise Draft Research Report",
  PublishFinishedReport = "Publish Finished Report",
  ProjectComplete = "Project Complete",
}

export interface IAgentPhaseTask {
  phase: Phase;
  instructions: string[]; // Description of role's task in said phase
}
export interface IAgentWorker {
  title: JobTitle;
  instructions: string[]; // Description of role, purpose, and responsibilities
  phaseTasks: IAgentPhaseTask[];
  functions: any[]; // TODO add function types
}

export interface ISystemPhase {
  phase: string;
  user: JobTitle;
  assistant: JobTitle;
  instructions: string[]; // 'system' instructions; 'user' does x, 'assistant' does y
  nextPhase: Phase[];
}
