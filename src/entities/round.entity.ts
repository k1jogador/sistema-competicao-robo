import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { ScoreLog } from './score-log.entity'; // <--- Importe

@Entity()
export class Round {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  score: number;

  @Column()
  timeMs: number;

  @Column({ default: 1 })
  attemptNumber: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Team, (team) => team.rounds)
  team: Team;

  // RELACIONAMENTO NOVO:
  @OneToMany(() => ScoreLog, (log) => log.round, { cascade: true })
  logs: ScoreLog[];
}
