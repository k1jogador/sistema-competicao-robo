import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';

@Entity()
export class Round {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  score: number; // Pontuação total

  @Column()
  timeMs: number; // Tempo em milissegundos (ex: 12500 para 12.5s)

  @Column({ default: 1 })
  attemptNumber: number; // Se é a tentativa 1, 2 ou 3

  @CreateDateColumn()
  createdAt: Date; // Data e hora que aconteceu

  // Relacionamento: Esta rodada pertence a uma equipe
  @ManyToOne(() => Team, (team) => team.rounds)
  team: Team;
}
