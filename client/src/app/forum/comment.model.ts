import { IVote } from './vote.model';

export interface IComment {
  id: string;
  postId: string;
  currentTitle: string;
  currentContent: string;
  currentDate: number;
  titles: string[];
  contents: string[];
  author: string;
  dates: number[];
  votes: Map<string, IVote>;
}

export interface IClientComment extends IComment {
  onEditPostMode: boolean;
  showEdits: boolean;
}
