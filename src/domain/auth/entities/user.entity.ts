import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleType } from '../role';

import { UserAuthority } from './user-authority.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true, length: 30 })
  email: string;

  @Column('varchar', { length: 20 })
  name: string;

  @Column('varchar', { length: 100 })
  password: string;

  @Column('varchar', { nullable: false })
  salt: string;

  @OneToMany(() => UserAuthority, (authority) => authority.user, {
    eager: true,
  })
  authorities!: UserAuthority[];

  @CreateDateColumn()
  createAt: Date;

  getRolesOnlyName() {
    return this.authorities?.map((v) => v.authorityName) || [];
  }
  hasRole(role: RoleType) {
    return this.authorities?.some((v) => v.authorityName == role);
  }
}
