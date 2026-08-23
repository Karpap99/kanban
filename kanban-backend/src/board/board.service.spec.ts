import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardEntity } from 'src/entities/board.entity';
import { Like } from 'typeorm';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('BoardService', () => {
  let service: BoardService;
  let repository: Record<string, jest.Mock>;

  const board = {
    id: 'board-id',
    publicId: 'public-board-id',
    title: 'Board',
  } as BoardEntity;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      existsBy: jest.fn(),
      findOneBy: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        { provide: getRepositoryToken(BoardEntity), useValue: repository },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  it('creates and saves a board', async () => {
    repository.create.mockReturnValue(board);
    repository.save.mockResolvedValue(board);

    await expect(service.create({ title: 'Board' })).resolves.toBe(board);
    expect(repository.create).toHaveBeenCalledWith({ title: 'Board' });
    expect(repository.save).toHaveBeenCalledWith(board);
  });

  it('checks whether a board exists by internal id', async () => {
    repository.existsBy.mockResolvedValue(true);

    await expect(service.exist('board-id')).resolves.toBe(true);
    expect(repository.existsBy).toHaveBeenCalledWith({ id: 'board-id' });
  });

  it('finds a board by public id', async () => {
    repository.findOneBy.mockResolvedValue(board);

    await expect(service.findByPublicId('public-board-id')).resolves.toBe(
      board,
    );
    expect(repository.findOneBy).toHaveBeenCalledWith({
      publicId: 'public-board-id',
    });
  });

  it('returns paginated boards with the default page size', async () => {
    repository.count.mockResolvedValue(1);
    repository.find.mockResolvedValue([board]);

    await expect(service.findAll()).resolves.toEqual({
      items: [board],
      count: 1,
    });
    expect(repository.find).toHaveBeenCalledWith({
      skip: 0,
      take: 12,
      where: undefined,
      order: { createdAt: 'DESC' },
    });
  });

  it('filters paginated boards by public id', async () => {
    repository.count.mockResolvedValue(1);
    repository.find.mockResolvedValue([board]);

    await expect(service.findAll(2, 5, 'abc')).resolves.toEqual({
      items: [board],
      count: 1,
    });

    expect(repository.count).toHaveBeenCalledWith({
      where: { publicId: Like('%abc%') },
    });
    expect(repository.find).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      where: { publicId: Like('%abc%') },
      order: { createdAt: 'DESC' },
    });
  });

  it('finds, updates, and removes a board', async () => {
    const updateResult = { affected: 1 };
    const deleteResult = { affected: 1 };
    repository.findOneBy.mockResolvedValue(board);
    repository.update.mockResolvedValue(updateResult);
    repository.delete.mockResolvedValue(deleteResult);

    await expect(service.findOne('board-id')).resolves.toBe(board);
    await expect(
      service.update('board-id', { title: 'Updated' }),
    ).resolves.toBe(updateResult);
    await expect(service.remove('board-id')).resolves.toBe(deleteResult);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'board-id' });
    expect(repository.update).toHaveBeenCalledWith('board-id', {
      title: 'Updated',
    });
    expect(repository.delete).toHaveBeenCalledWith('board-id');
  });
});
