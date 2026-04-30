import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // ================= GET ALL
  @Get()
  getAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // ================= GET ONE
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // ================= CREATE
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  // ================= UPDATE
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  // ================= CHANGE PASSWORD
  @Put(':id/change-password')
  changePassword(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const { oldPassword, newPassword } = body;
    return this.service.changePassword(id, oldPassword, newPassword);
  }

  // ================= DELETE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
