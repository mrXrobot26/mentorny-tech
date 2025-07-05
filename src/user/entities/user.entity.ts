import { Role } from '../../auth/enums/role.enum';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
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
}
