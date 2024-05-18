export interface IUser {
  id?: number;
  isAdmin: boolean;
  isOnline: boolean;
  name: string;
  email: string;
  birthday?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  profilePictureUrl?: string;
  lastLogin?: Date;
  city?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedIn?: string;
    instagram?: string;
  };
  bio?: string;
}
