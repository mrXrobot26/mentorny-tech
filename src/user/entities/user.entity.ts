import { Skill } from '../../skill/entities/skill.entity';
import { Role } from '../../auth/enums/role.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({
    type: 'simple-array',
    default: () => `'${Role.USER}'`,
  })
  roles: Role[];

  @Column({ nullable: true })
  refreshTokenHash: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt: Date;

  @ManyToMany(() => Skill, (skill) => skill.users, { cascade: true })
  @JoinTable()
  skills: Skill[];
}
