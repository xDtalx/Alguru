import { IClientComment, IComment } from './comment.model';
import { IVote } from './vote.model';

export interface IPost {
  id: string;
  currentTitle: string;
  currentContent: string;
  currentDate: number;
  contents: string[];
  titles: string[];
  author: string;
  comments: IComment[];
  dates: number[];
  votes: Map<string, IVote>;
}

export interface IClientPost extends IPost {
  onEditPostMode: boolean;
  comments: IClientComment[];
  showEdits: boolean;
}
