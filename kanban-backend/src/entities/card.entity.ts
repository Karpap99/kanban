import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BoardEntity } from './board.entity';
import { CardStatus } from 'src/card/enum/cardstatus';

@Entity('card')
export class CardEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'timestamptz', nullable: true })
  deadline?: Date;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.TODO,
  })
  status!: CardStatus;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @Index()
  @Column()
  boardId!: string;

  @ManyToOne(() => BoardEntity, (board) => board.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board!: BoardEntity;
}
