import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { Round } from '../entities/round.entity';

@Injectable()
export class TorneioService {
  constructor(
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(Round) private roundRepo: Repository<Round>,
  ) {}

  async criarEquipe(nome: string) {
    return this.teamRepo.save({ name: nome });
  }

  async listarEquipes() {
    return this.teamRepo.find({ order: { name: 'ASC' } });
  }

  // AGORA: Calcula qual é o número da rodada automaticamente
  async salvarRodada(teamId: string, score: number, timeMs: number) {
    // Conta quantas rodadas esse time já tem
    const tentativasAnteriores = await this.roundRepo.count({
      where: { team: { id: teamId } },
    });

    const round = this.roundRepo.create({
      team: { id: teamId },
      score,
      timeMs,
      attemptNumber: tentativasAnteriores + 1, // Incrementa: 1, 2, 3...
    });

    return this.roundRepo.save(round);
  }

  async obterRanking() {
    const times = await this.teamRepo.find({
      relations: ['rounds'],
    });

    // calcular o total de cada time
    const ranking = times.map((time) => {
      const totalPontos = time.rounds.reduce((sum, r) => sum + r.score, 0);

      // O critério de desempate será a soma dos tempos (quanto maior, melhor)
      const totalTempo = time.rounds.reduce((sum, r) => sum + r.timeMs, 0);

      return {
        ...time,
        totalPontos,
        totalTempo,
        rounds: time.rounds.sort((a, b) => a.attemptNumber - b.attemptNumber),
      };
    });
    ranking.sort((a, b) => {
      if (b.totalPontos !== a.totalPontos) {
        return b.totalPontos - a.totalPontos; // Maior pontuação primeiro
      }
      return a.totalTempo - b.totalTempo; // Menor tempo total como desempate
    });

    return ranking;
  }

  async getProximaRodada(teamId: string): Promise<number> {
    const count = await this.roundRepo.count({
      where: { team: { id: teamId } },
    });
    return count + 1;
  }
}
