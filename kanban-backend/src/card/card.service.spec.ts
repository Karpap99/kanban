import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CardEntity } from 'src/entities/card.entity';
import { BoardService } from 'src/board/board.service';
import { CardStatus } from './enum/cardstatus';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('CardService', () => {
  let service: CardService;
  let repository: Record<string, jest.Mock>;
  let boardService: Record<string, jest.Mock>;

  const board = { id: 'board-id', publicId: 'public-board-id' };
  const card = {
    id: 'card-id',
    boardId: 'board-id',
    status: CardStatus.TODO,
    position: 0,
    title: 'Card',
  } as CardEntity;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      findBy: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
    };
    boardService = {
      findByPublicId: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        { provide: getRepositoryToken(CardEntity), useValue: repository },
        { provide: BoardService, useValue: boardService },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a card using the board public id', async () => {
    boardService.findByPublicId.mockResolvedValue(board);
    repository.count.mockResolvedValue(2);
    repository.create.mockReturnValue(card);
    repository.save.mockResolvedValue(card);
    const dto = {
      title: 'Card',
      description: 'Description',
      status: CardStatus.TODO,
      boardId: 'public-board-id',
    };

    await expect(service.create(dto)).resolves.toBe(card);
    expect(repository.count).toHaveBeenCalledWith({
      where: { boardId: 'board-id', status: CardStatus.TODO },
    });
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      boardId: 'board-id',
      position: 2,
    });
  });

  it('rejects card creation when the board does not exist', async () => {
    boardService.findByPublicId.mockResolvedValue(null);
    boardService.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        title: 'Card',
        description: 'Description',
        status: CardStatus.TODO,
        boardId: 'missing-board',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('finds all cards and cards by board id', async () => {
    boardService.findByPublicId.mockResolvedValue(board);
    repository.find.mockResolvedValue([card]);

    await expect(service.findAll()).resolves.toEqual([card]);
    await expect(service.findByBoardId('public-board-id')).resolves.toEqual([
      card,
    ]);
    expect(boardService.findByPublicId).toHaveBeenCalledWith('public-board-id');
    expect(repository.find).toHaveBeenLastCalledWith({
      where: { boardId: 'board-id' },
      order: { position: 'ASC' },
    });
  });

  it('returns no cards when the parent board does not exist', async () => {
    boardService.findByPublicId.mockResolvedValue(null);
    boardService.findOne.mockResolvedValue(null);

    await expect(service.findByBoardId('missing-board')).resolves.toEqual([]);
    expect(repository.find).not.toHaveBeenCalled();
  });

  it('finds a card by id', async () => {
    repository.findBy.mockResolvedValue([card]);

    await expect(service.findOne('card-id')).resolves.toEqual([card]);
    expect(repository.findBy).toHaveBeenCalledWith({ id: 'card-id' });
  });

  it('updates a card and reindexes its target group', async () => {
    const updatedCard = { ...card, title: 'Updated', position: 0 };
    repository.findOneBy
      .mockResolvedValueOnce(card)
      .mockResolvedValueOnce(updatedCard);
    repository.merge.mockReturnValue(updatedCard);
    repository.save.mockResolvedValue(updatedCard);
    repository.find.mockResolvedValue([updatedCard]);

    await expect(service.update('card-id', { title: 'Updated' })).resolves.toBe(
      updatedCard,
    );
    expect(repository.merge).toHaveBeenCalledWith(card, {
      title: 'Updated',
      boardId: 'board-id',
      status: CardStatus.TODO,
      position: 0,
    });
  });

  it('moves a card to another board using its public id', async () => {
    const targetBoard = { id: 'target-board-id', publicId: 'target-public-id' };
    const movedCard = { ...card, boardId: 'target-board-id', position: 2 };
    boardService.findByPublicId.mockResolvedValue(targetBoard);
    repository.findOneBy
      .mockResolvedValueOnce(card)
      .mockResolvedValueOnce(movedCard);
    repository.count.mockResolvedValue(2);
    repository.merge.mockReturnValue(movedCard);
    repository.save.mockResolvedValue(movedCard);
    repository.find.mockResolvedValue([movedCard]);

    await expect(
      service.update('card-id', { boardId: 'target-public-id' }),
    ).resolves.toBe(movedCard);

    expect(repository.count).toHaveBeenCalledWith({
      where: { boardId: 'target-board-id', status: CardStatus.TODO },
    });
    expect(repository.merge).toHaveBeenCalledWith(card, {
      boardId: 'target-board-id',
      status: CardStatus.TODO,
      position: 2,
    });
  });

  it('rejects updating a missing card or board', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.update('missing-card', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );

    repository.findOneBy.mockResolvedValue(card);
    boardService.findByPublicId.mockResolvedValue(null);
    boardService.findOne.mockResolvedValue(null);
    await expect(
      service.update('card-id', { boardId: 'missing-board' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('removes a card and compacts remaining positions', async () => {
    const remainingCard = { ...card, id: 'remaining-card', position: 2 };
    repository.findOneBy.mockResolvedValue(card);
    repository.remove.mockResolvedValue(card);
    repository.find.mockResolvedValue([remainingCard]);
    repository.save.mockResolvedValue([remainingCard]);

    await expect(service.remove('card-id')).resolves.toBe(card);
    expect(remainingCard.position).toBe(0);
    expect(repository.remove).toHaveBeenCalledWith(card);
    expect(repository.save).toHaveBeenCalledWith([remainingCard]);
  });

  it('rejects removing a missing card', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove('missing-card')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
