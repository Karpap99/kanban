import { Column, Entity, OneToMany } from 'typeorm';
import { CardEntity } from './card.entity';
import { BaseEntity } from './base.entity';

@Entity('board')
export class BoardEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  description?: string;

  @OneToMany(() => CardEntity, (card) => card.board)
  cards!: CardEntity[];
}
