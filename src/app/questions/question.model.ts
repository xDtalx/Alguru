export interface Question {
  id: string;
  title: string;
  content: string;
  solutionTemplate: string[];
  solution: string[];
  tests: string[];
  hints: string;
  level: number;
  creator: string;
}
