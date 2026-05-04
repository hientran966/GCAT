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
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  // ================= GET ALL
  @Get()
  getAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // ================= SALARY
  @Get('salary/summary')
  getSalary(@Query() query: any) {
    return this.service.getSalary(query);
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

  // ================= DELETE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.remove(id, req.user);
  }
}
