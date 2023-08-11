export interface IRole {
  name: string;
  id: number;
}
export interface IUser {
  phone: string;
  email: string | null;
  fullName: string;
  address: string | null;
  isVerified: boolean;
  code: number | null;
  codeUseCase: string | null;
  codeExpiryDate: string | null;
  createdAt: string;
  deletedAt: string | null;
  updatedAt: string;
  role: IRole;
}
