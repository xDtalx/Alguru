import { IVote } from '../forum/vote.model';

export interface IQuestion {
  id: string;
  title: string;
  content: string;
  solutionTemplate: string[];
  solution: string[];
  tests: string[];
  hints: string;
  level: number;
  creator: string;
  votes: Map<string, IVote>;
}
