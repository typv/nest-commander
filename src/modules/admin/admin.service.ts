import { Injectable } from '@nestjs/common';
import { AddClientDto } from './dto/add-client.dto';

@Injectable()
export class AdminService {
  async addClient(body: AddClientDto) {
      return 11111111111;
  }
}
