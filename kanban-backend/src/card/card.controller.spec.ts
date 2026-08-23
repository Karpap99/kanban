import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('CardController', () => {
  let controller: CardController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByBoardId: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [{ provide: CardService, useValue: service }],
    }).compile();

    controller = module.get<CardController>(CardController);
  });

  it('returns the service result for every card action', () => {
    const dto = {
      title: 'Card',
      description: 'Description',
      status: 'todo',
      boardId: 'board-id',
    };
    const updateDto = { title: 'Updated' };
    const createdCard = { id: 'card-id', ...dto };
    const cards = [createdCard];
    const foundCards = [createdCard];
    const updatedCard = { ...createdCard, ...updateDto };
    const removedCard = createdCard;
    service.create.mockReturnValue(createdCard);
    service.findAll.mockReturnValue(cards);
    service.findByBoardId.mockReturnValue(foundCards);
    service.findOne.mockReturnValue(foundCards);
    service.update.mockReturnValue(updatedCard);
    service.remove.mockReturnValue(removedCard);

    expect(controller.create(dto)).toBe(createdCard);
    expect(controller.findAll()).toBe(cards);
    expect(controller.findByBoardId('board-id')).toBe(foundCards);
    expect(controller.findOne('card-id')).toBe(foundCards);
    expect(controller.update('card-id', updateDto)).toBe(updatedCard);
    expect(controller.remove('card-id')).toBe(removedCard);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(service.findAll).toHaveBeenCalledWith();
    expect(service.findByBoardId).toHaveBeenCalledWith('board-id');
    expect(service.findOne).toHaveBeenCalledWith('card-id');
    expect(service.update).toHaveBeenCalledWith('card-id', updateDto);
    expect(service.remove).toHaveBeenCalledWith('card-id');
  });
});
