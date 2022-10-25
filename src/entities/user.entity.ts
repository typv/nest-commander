import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export const TableName = 'users';

@Entity(TableName)
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;
  
  email: string;
  
  userName: string;
  
  @Exclude()
  password: string;
  
  isActive: boolean;
  
  emailVerified: boolean;
  
  userType: number;
  
  createdAt: string;
  
  updatedAt: string;
  
  deletedAt: string;
  
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
