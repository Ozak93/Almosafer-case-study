import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationModule } from './modules/reservation/reservation.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ApiKeyModule } from './modules/auth/api-key.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ApiKeyModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const synchronize =
          config.get<string>('TYPEORM_SYNCHRONIZE', 'true') === 'true';
        const host = config.get<string>('MYSQL_HOST', 'localhost');
        const port = Number.parseInt(
          config.get<string>('MYSQL_PORT') ?? '3306',
        );
        const username = config.get<string>('MYSQL_USER', 'root');
        const password = config.get<string>('MYSQL_PASSWORD', 'root');
        const database = config.get<string>(
          'MYSQL_DATABASE',
          'restaurant_reservation',
        );

        return {
          type: 'mysql',
          host,
          port: Number.isNaN(port) ? 3306 : port,
          username,
          password,
          database,
          charset: 'utf8mb4',
          synchronize,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          debug: false,
          logging: true,
          timezone: 'Asia/Amman',
        };
      },
    }),
    ReservationModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
