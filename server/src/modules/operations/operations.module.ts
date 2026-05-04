import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { DatabaseModule } from '../../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: 'JWT_SECRET',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [OperationsService],
  controllers: [OperationsController],
})
export class OperationsModule {}
