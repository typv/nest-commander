import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AddClientDto } from './dto/add-client.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  
  @Post('add-client')
  async addClient(@Body() body: AddClientDto) {
    return this.adminService.addClient(body);
  }
}
