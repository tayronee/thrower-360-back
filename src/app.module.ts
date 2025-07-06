import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PregaoModule } from './modules/pregao/interfaces/http/pregao.module';
import { PregaoDetalheModule } from './modules/pregao/interfaces/http/pregao-detalhe.module';
import { DashboardModule } from './modules/pregao/interfaces/http/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    PregaoModule,
    PregaoDetalheModule,
    DashboardModule,
  ],
})
export class AppModule {}
