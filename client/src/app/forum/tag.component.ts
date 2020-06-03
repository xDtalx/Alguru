export interface Tag {
  content: string;
  title: string;
  author: string;
  comments: Tag[];
  date: Date;
}

export interface Date {
  date: string;
  time: string;
}
