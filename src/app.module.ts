import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TorneioGateway } from './torneio.gateway';
import { TorneioService } from './torneio.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Round } from './entities/round.entity';
import { ScoreLog } from './entities/score-log.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'public'),
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'torneio.db',
      entities: [Team, Round, ScoreLog],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Team, Round, ScoreLog]),
  ],
  controllers: [AppController],
  providers: [AppService, TorneioGateway, TorneioService],
})
export class AppModule {}
