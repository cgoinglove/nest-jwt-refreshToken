import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RoleType } from '../role';

import { User } from './user.entity';

@Entity('user_authority')
export class UserAuthority {
  @PrimaryColumn('varchar', { name: 'user_id' })
  userId: number;

  @PrimaryColumn('varchar', { name: 'authority_name' })
  authorityName: RoleType;

  @ManyToOne(() => User, (user) => user.authorities, {
    eager: false,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;
}
