import { Timestamp } from "firebase/firestore";

export interface IUser {
  isAdmin: boolean;
  isOnline: boolean;
  name: string;
  email: string;
  birthday?: Date;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastLogin?: Timestamp;
  city?: string;
  photoURL: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedIn?: string;
    instagram?: string;
  };
  bio?: string;
}
