import { Injectable, Logger } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardEntity } from 'src/entities/board.entity';
import { Like, QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity)
    private boardRepository: Repository<BoardEntity>,
  ) {}

  async create(createBoardDto: CreateBoardDto) {

    try {
      const board = this.boardRepository.create(createBoardDto);

      return await this.boardRepository.save(board);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        const board = this.boardRepository.create(createBoardDto);

        return await this.boardRepository.save(board);
      }

      throw error;
    }
  }
  async exist(id: string) {
    return await this.boardRepository.existsBy({ id });
  }

  findByPublicId(publicId: string) {
    return this.boardRepository.findOneBy({ publicId });
  }

  async findAll(page = 1, limit = 12, search?: string) {
    const where = search ? { publicId: Like(`%${search}%`) } : undefined;
    const count = await this.boardRepository.count({ where });
    const items = await this.boardRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      where,
      order: {
        createdAt: 'DESC',
      },
    });
    return { items, count };
  }

  findOne(id: string) {
    return this.boardRepository.findOneBy({ id });
  }

  update(id: string, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(id, updateBoardDto);
  }

  remove(id: string) {
    return this.boardRepository.delete(id);
  }
}
