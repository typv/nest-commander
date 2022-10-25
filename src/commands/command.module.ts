import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreateAdminCommand } from './create-admin.command';
import { CreateAdminQuestions } from './questions/create-admin.questions';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
    ]),
  ],
  providers: [
    CreateAdminCommand,
    CreateAdminQuestions,
  ],
  exports: [],
})
export class CommandModule {
}