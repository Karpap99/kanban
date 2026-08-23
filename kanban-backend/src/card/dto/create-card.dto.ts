import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { CardStatus } from '../enum/cardstatus';

export class CreateCardDto {
  @ApiProperty({ required: true })
  @IsString()
  public title!: string;

  @ApiProperty({ required: true })
  @IsString()
  public description!: string;

  @ApiProperty({
    enum: CardStatus,
    default: CardStatus.TODO,
  })
  @IsEnum(CardStatus)
  public status!: CardStatus;

  @ApiProperty({ required: true })
  @IsString()
  boardId!: string;
}
