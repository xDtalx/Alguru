import { Vote } from './vote.model';

export interface Comment {
  id: string;
  postId: string;
  currentTitle: string;
  currentContent: string;
  currentDate: number;
  titles: string[];
  contents: string[];
  author: string;
  dates: number[];
  votes: Map<string, Vote>;
}

export interface ClientComment extends Comment {
  onEditPostMode: boolean;
  showEdits: boolean;
}
