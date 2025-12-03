import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Round } from './round.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Relacionamento: Uma equipe tem várias rodadas
  @OneToMany(() => Round, (round) => round.team)
  rounds: Round[];
}
