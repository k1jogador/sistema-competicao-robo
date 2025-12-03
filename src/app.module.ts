import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TorneioGateway } from './torneio/torneio.gateway';
import { TorneioService } from './torneio/torneio.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Round } from './entities/round.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'public'),
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'torneio.db',
      entities: [Team, Round],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Team, Round]),
  ],
  controllers: [AppController],
  providers: [AppService, TorneioGateway, TorneioService],
})
export class AppModule {}
