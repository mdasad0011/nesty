import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  OneToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { PermissionEntity } from 'src/permissions/entities/permission.entity';

@Entity({
  name: 'users',
})
export class UserEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  salt: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => RoleEntity)
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity;

  @Column({ type: 'uuid' })
  roleId: string;

  @ManyToMany(() => PermissionEntity, { cascade: true })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[];

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password && !this.isHashedPassword(this.password)) {
      if (!this.salt) {
        this.salt = await bcrypt.genSalt();
      }
      await this.hashPassword();
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password && !this.isHashedPassword(this.password)) {
      await this.hashPassword();
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password || !this.salt) {
      return false;
    }

    return bcrypt.compare(password, this.password);
  }

  async hashPassword() {
    if (!this.password || this.isHashedPassword(this.password)) {
      return;
    }

    if (!this.salt) {
      this.salt = await bcrypt.genSalt();
    }

    this.password = await bcrypt.hash(this.password, this.salt);
  }

  private isHashedPassword(value: string): boolean {
    return /^\$2[aby]\$/.test(value);
  }
}
