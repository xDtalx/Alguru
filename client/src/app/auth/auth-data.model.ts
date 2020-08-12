export interface IAuthData {
  token?: string;
  expiresIn?: number;
  userId?: string;
  username?: string;
  isAdmin?: boolean;
  verified?: boolean;
  expirationDate?: Date;
}
