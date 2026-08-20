import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from 'src/entities/card.entity';
import { BoardModule } from 'src/board/board.module';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity]), BoardModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
