import { Question, QuestionSet } from "nest-commander";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Validator from 'validatorjs';
import { User } from '../../entities/user.entity';

@QuestionSet({ name: 'create-admin-questions' })
export class CreateAdminQuestions {
  constructor(
    @InjectRepository(User) private userRepos: Repository<User>,
  ) {}
  
  @Question({
    type: 'input',
    message: 'Please enter your email:',
    name: 'email',
    validate: async function (email: string) {
      let rules = {
        email: 'required|string|email',
      };
      let validation = new Validator({email: email}, rules);
      if (validation.fails()) {
        const firstErrors = validation.errors.first('email');
        console.log(`\n${firstErrors}`);
        
        return false;
      }
      const hasAccount = await this.loginRepos.findOne({
        where:{email: email.trim()}
      });
      if (hasAccount) {
        console.log('\nAccount already exist.');
        
        return false;
      }
      
      return true;
    }
  })
  parseEmail(email: string) {
    return email;
  }
  
  @Question({
    type: 'input',
    message: 'Please enter your username:',
    name: 'userName',
    validate: function (userName: string) {
      let rules = {
        userName: 'required|string|max:64',
      };
      
      let validation = new Validator({userName: userName}, rules);
      if (validation.fails()) {
        const firstErrors = validation.errors.first('userName');
        console.log(`\n${firstErrors}`);
        return false;
      }
      
      return true;
    }
  })
  parseFn(userName: string) {
    return userName;
  }

  @Question({
    type: 'password',
    message: 'Please enter your password:',
    name: 'password',
    validate: function (password: string) {
      Validator.register('checkPassword', function(value, requirement, attribute) {
        return value.match(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z]).*$/);
      }, 'Password too weak.');
      let rules = {
        password: 'required|string|min:8|max:64|checkPassword',
      };
    
      let validation = new Validator({password: password}, rules);
      if (validation.fails()) {
        const firstErrors = validation.errors.first('password');
        console.log(`\n${firstErrors}`);
        return false;
      }
    
      return true;
    }
  })
  parsePw(password: string) {
    return password;
  }
}