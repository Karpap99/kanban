import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardEntity } from 'src/entities/board.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity)
    private boardRepository: Repository<BoardEntity>,
  ) {}

  create(createBoardDto: CreateBoardDto) {
    const board = this.boardRepository.create(createBoardDto);
    return this.boardRepository.save(board);
  }

  async exist(id: string) {
    return await this.boardRepository.existsBy({ id });
  }

  findAll() {
    return this.boardRepository.find();
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
