import { ClientComment, Comment } from './comment.model';
import { Vote } from './vote.model';

export interface IPost {
  id: string;
  currentTitle: string;
  currentContent: string;
  currentDate: number;
  contents: string[];
  titles: string[];
  author: string;
  comments: Comment[];
  dates: number[];
  votes: Map<string, Vote>;
}

export interface IClientPost extends IPost {
  onEditPostMode: boolean;
  comments: ClientComment[];
  showEdits: boolean;
}
