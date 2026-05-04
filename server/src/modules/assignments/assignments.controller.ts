import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('assignments')
@UseGuards(AuthGuard)
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  // ================= GET ALL
  @Get()
  getAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // ================= GET BY USER
  @Get('me')
  getByUser(@Req() req: any) {
    return this.service.getByUser(req.user.id);
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

  // ================= DELETE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
