import { User } from 'src/users/entities/user.entity';

export interface IDistance {
  longitude: string;
  latitude: string;
}
export interface Like {
  place: string;
  user: User;
}
