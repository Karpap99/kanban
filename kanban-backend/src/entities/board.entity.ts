import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { CardEntity } from './card.entity';
import { BaseEntity } from './base.entity';
import crypto from 'crypto';

@Entity('board')
export class BoardEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  publicId!: string;

  @BeforeInsert()
  generate_publicId() {
    const randomBytes = crypto.randomBytes(8).toString('base64url');

    this.publicId = randomBytes;
  }

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  description?: string;

  @OneToMany(() => CardEntity, (card) => card.board)
  cards!: CardEntity[];
}
