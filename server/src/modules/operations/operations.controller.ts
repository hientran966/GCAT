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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../common/upload/upload.config';

@Controller('operations')
export class OperationsController {
  constructor(private readonly service: OperationsService) {}

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

  // ================= GET BY PRODUCT
  @Get('/product/:productId')
  getByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.getByProduct(productId);
  }

  // ================= CREATE
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig('operations')))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    return this.service.create(body, file);
  }

  // ================= UPDATE
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', multerConfig('operations')))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.update(id, body, file);
  }

  // ================= DELETE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
