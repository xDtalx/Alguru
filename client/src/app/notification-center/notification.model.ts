export interface INotification {
  id: string;
  content: string;
  createdAt: Date;
  seen: boolean;
  sender: string;
  title: string;
  url: string;
}
