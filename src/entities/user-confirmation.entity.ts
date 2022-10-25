import {
  Column, CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from "class-transformer";

export const TableName = 'user_confirmation';

@Entity(TableName)
export class UserConfirmation {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  email: string;

  @Column({type: "smallint"})
  type: number;

  @Column({nullable: true})
  code: string;

  @Column({type: 'timestamp with time zone', nullable: true})
  expired: string;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  constructor(partial: Partial<UserConfirmation>) {
    Object.assign(this, partial);
  }
}
