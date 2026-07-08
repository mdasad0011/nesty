import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({
  name: 'refresh_token',
})
export class RefreshTokenEntity extends CustomBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'inet' })
  ip: string;

  @Column({ type: 'varchar', length: 255 })
  userAgent: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  browser: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  os: string;

  @Column({ type: 'boolean' })
  isRevoked: boolean;

  @Column({ type: 'timestamptz' })
  expires: Date;
}
