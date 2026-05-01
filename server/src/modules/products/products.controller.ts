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
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { multerConfig } from '../../common/upload/upload.config';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

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
  @UseInterceptors(FileInterceptor('file', multerConfig('products')))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    return this.service.create(body, file);
  }

  // ================= UPDATE
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', multerConfig('products')))
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
