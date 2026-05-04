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
  UseGuards,
  Req,
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { multerConfig } from '../../common/upload/upload.config';

@Controller('operations')
@UseGuards(AuthGuard)
export class OperationsController {
  constructor(private readonly service: OperationsService) {}

  // ================= GET ALL
  @Get()
  getAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // ================= GET BY PRODUCT
  @Get('product/:productId')
  getByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.getByProduct(productId);
  }

  // ================= GET BY USER
  @Get('me')
  @UseGuards(AuthGuard)
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
