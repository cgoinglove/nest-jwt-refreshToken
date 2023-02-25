import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_refresh_token')
export class RefreshToken {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'refresh_token', length: 500 })
  refreshToken: string;

  @CreateDateColumn({ name: 'create_at' })
  createdAt;

  @Column({ name: 'expires_date', update: false })
  expiresDate: Date;

  @UpdateDateColumn()
  updatedAt;

  @Column()
  platform: string;

  @Column()
  browser: string;

  @Column()
  os: string;

  @Column()
  ip: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'timestamp', nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  getExpiresIn() {
    return new Date(this.expiresDate).getTime() - Date.now();
  }
  canUse() {
    return this.getExpiresIn() > 0 && !this.deletedAt;
  }
}
