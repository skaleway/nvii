export type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};
