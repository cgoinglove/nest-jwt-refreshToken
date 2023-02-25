import { User } from '@/domain/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

type LOG_TYPE = 'INFO' | 'ERROR';

@Entity('log_history')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'log_type' })
  logType: LOG_TYPE;

  @Column('varchar', { name: 'user_id' })
  userId: string;

  @Column('varchar', { name: 'content', length: 500 })
  content: string;

  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
