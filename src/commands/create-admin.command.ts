import { Command, CommandRunner, Inquirer, InquirerService, Option } from 'nest-commander';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import bcrypt from 'bcrypt';
import { userType } from '../constants/enum';
import { User } from '../entities/user.entity';

@Command({
  name: 'create-admin',
  description: 'Create a system admin',
  arguments: '[email] [password] [userName]'
})
export class CreateAdminCommand extends CommandRunner {
  constructor(
    private readonly inquirer: InquirerService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    super()
  }
  
  async run(
    passedParam: string[],
    options: { isDefault: true }
  ): Promise<void> {
    const answers = await this.inquirer.prompt<{ email: string, password: string, userName: string}>(
      'create-admin-questions',
      undefined
    )
    const email = answers.email;
    const pass = answers.password;
    const userName = answers.userName;
    
    // Password hashing
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(pass, salt);
    try {
      await this.userRepo.save({
        email: email,
        password: passwordHash,
        userName: userName,
        loginType: userType.ADMIN,
        isActive: true,
        emailVerified: true,
      })
      
      console.log('\nCreate admin successfully.');
    } catch (err) {
      console.log('\nFailed to create admin.');
    }
  }
  
  @Option({
    flags: '-s, --shell <shell>',
  })
  parseShell(val: string) {
    return val;
  }
}