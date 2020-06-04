import { Comment, ClientComment } from './comment.model';

export interface Post {
  id: string;
  currentTitle: string;
  currentContent: string;
  currentDate: number;
  contents: string[];
  titles: string[];
  author: string;
  comments: Comment[];
  dates: number[];
}

export interface ClientPost extends Post {
  onEditPostMode: boolean;
  comments: ClientComment[];
  showEdits: boolean;
}
