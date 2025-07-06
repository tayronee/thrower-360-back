import { Module, Controller, Get } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PregaoModule } from './modules/pregao/interfaces/http/pregao.module';
import { PregaoDetalheModule } from './modules/pregao/interfaces/http/pregao-detalhe.module';
import { DashboardModule } from './modules/pregao/interfaces/http/dashboard.module';

@Controller()
export class HealthController {
  @Get('/')
  health() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('/health')
  healthCheck() {
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || process.env.MONGO_URI || ''),
    PregaoModule,
    PregaoDetalheModule,
    DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
