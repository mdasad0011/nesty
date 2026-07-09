import { Column, Entity, Index, ManyToMany, Unique } from 'typeorm';
import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';

@Entity({ name: 'permission' })
@Unique(['description'])
export class PermissionEntity extends CustomBaseEntity {
  @Column('varchar', { length: 100 })
  resource: string;

  @Column()
  @Index({ unique: true })
  description: string;

  @Column()
  path: string;

  @Column('varchar', { default: 'get', length: 20 })
  method: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];

  constructor(data?: Partial<PermissionEntity>) {
    super();
    if (data) Object.assign(this, data);
  }
}
