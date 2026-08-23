import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('BoardController', () => {
  let controller: BoardController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [{ provide: BoardService, useValue: service }],
    }).compile();

    controller = module.get<BoardController>(BoardController);
  });

  it('returns the service result for every board action', () => {
    const dto = { title: 'Board' };
    const updateDto = { title: 'Updated' };
    const createdBoard = { id: 'board-id', ...dto };
    const boards = { items: [createdBoard], count: 1 };
    const foundBoard = { id: 'board-id', ...dto };
    const updatedBoard = { affected: 1 };
    const removedBoard = { affected: 1 };
    service.create.mockReturnValue(createdBoard);
    service.findAll.mockReturnValue(boards);
    service.findOne.mockReturnValue(foundBoard);
    service.update.mockReturnValue(updatedBoard);
    service.remove.mockReturnValue(removedBoard);

    expect(controller.create(dto)).toBe(createdBoard);
    expect(controller.findAll(2, 5, 'abc')).toBe(boards);
    expect(controller.findOne('id')).toBe(foundBoard);
    expect(controller.update('id', updateDto)).toBe(updatedBoard);
    expect(controller.remove('id')).toBe(removedBoard);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(service.findAll).toHaveBeenCalledWith(2, 5, 'abc');
    expect(service.findOne).toHaveBeenCalledWith('id');
    expect(service.update).toHaveBeenCalledWith('id', updateDto);
    expect(service.remove).toHaveBeenCalledWith('id');
  });
});
