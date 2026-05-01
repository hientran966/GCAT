import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OperationsModule } from './modules/operations/operations.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    ProductsModule,
    OperationsModule,
    AssignmentsModule,
    ReportsModule,
    AuthModule,
  ],
})
export class AppModule {}
