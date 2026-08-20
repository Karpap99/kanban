import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
    const board = await this.boardService.exist(createCardDto.boardId);
    if (!board) throw new BadRequestException("This board doesn't exist ");

    const position = await this.cardRepository.count({
      where: {
        boardId: createCardDto.boardId,
        status: createCardDto.status,
      },
    });

    const card = this.cardRepository.create({
      ...createCardDto,
      position,
    });

    return this.cardRepository.save(card);
  }

  findAll() {
    return this.cardRepository.find();
  }

  findOne(id: string) {
    return this.cardRepository.findBy({ id: id });
  }

  update(id: string, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: string) {
    return this.cardRepository.delete(id);
  }
}
