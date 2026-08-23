import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from 'src/entities/card.entity';
import { Repository } from 'typeorm';
import { BoardService } from 'src/board/board.service';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    @Inject(BoardService)
    private boardService: BoardService,
  ) {}

  async create(createCardDto: CreateCardDto) {
    const board =
      (await this.boardService.findByPublicId(createCardDto.boardId)) ??
      (await this.boardService.findOne(createCardDto.boardId));
    if (!board) throw new BadRequestException("This board doesn't exist ");

    const position = await this.cardRepository.count({
      where: {
        boardId: board.id,
        status: createCardDto.status,
      },
    });

    const card = this.cardRepository.create({
      ...createCardDto,
      boardId: board.id,
      position,
    });

    return this.cardRepository.save(card);
  }

  findAll() {
    return this.cardRepository.find();
  }

  async findByBoardId(boardId: string) {
    const board =
      (await this.boardService.findByPublicId(boardId)) ??
      (await this.boardService.findOne(boardId));

    if (!board) return [];

    return this.cardRepository.find({
      where: { boardId: board.id },
      order: { position: 'ASC' },
    });
  }

  findOne(id: string) {
    return this.cardRepository.findBy({ id: id });
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    const card = await this.cardRepository.findOneBy({ id });
    if (!card) throw new NotFoundException('Card not found');

    const previousBoardId = card.boardId;
    const previousStatus = card.status;
    let boardId = updateCardDto.boardId;
    if (boardId) {
      const board =
        (await this.boardService.findByPublicId(boardId)) ??
        (await this.boardService.findOne(boardId));

      if (!board) throw new BadRequestException("This board doesn't exist ");
      boardId = board.id;
    }

    const targetBoardId = boardId ?? card.boardId;
    const targetStatus = updateCardDto.status ?? card.status;
    const groupChanged =
      targetBoardId !== previousBoardId || targetStatus !== previousStatus;

    let position = updateCardDto.position ?? card.position;
    if (groupChanged && updateCardDto.position === undefined) {
      position = await this.cardRepository.count({
        where: { boardId: targetBoardId, status: targetStatus },
      });
    }

    const updatedCard = this.cardRepository.merge(card, {
      ...updateCardDto,
      boardId: targetBoardId,
      status: targetStatus,
      position,
    });

    const savedCard = await this.cardRepository.save(updatedCard);

    await this.reindexCards(targetBoardId, targetStatus, savedCard.id);
    if (groupChanged) {
      await this.reindexCards(previousBoardId, previousStatus);
    }

    return this.cardRepository.findOneBy({ id: savedCard.id });
  }

  async remove(id: string) {
    const card = await this.cardRepository.findOneBy({ id });
    if (!card) throw new NotFoundException('Card not found');

    await this.cardRepository.remove(card);
    await this.reindexCards(card.boardId, card.status);

    return card;
  }

  private async reindexCards(
    boardId: string,
    status: CardEntity['status'],
    movedCardId?: string,
  ) {
    const cards = await this.cardRepository.find({
      where: { boardId, status },
      order: { position: 'ASC', createdAt: 'ASC' },
    });

    if (movedCardId) {
      const movedCard = cards.find((card) => card.id === movedCardId);
      if (movedCard) {
        const remainingCards = cards.filter((card) => card.id !== movedCardId);
        const targetPosition = Math.min(
          Math.max(movedCard.position, 0),
          remainingCards.length,
        );
        remainingCards.splice(targetPosition, 0, movedCard);
        cards.splice(0, cards.length, ...remainingCards);
      }
    }

    const changedCards = cards.filter((card, index) => card.position !== index);
    if (changedCards.length) {
      changedCards.forEach((card) => {
        card.position = cards.indexOf(card);
      });
      await this.cardRepository.save(changedCards);
    }
  }
}
