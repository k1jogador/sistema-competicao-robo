import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Round } from './round.entity';

@Entity()
export class ScoreLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  points: number; // Ex: 20 ou -10

  @Column()
  reason: string; // Ex: "Curva 90º" ou "Correção"

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Round, (round) => round.logs, { onDelete: 'CASCADE' })
  round: Round;
}
