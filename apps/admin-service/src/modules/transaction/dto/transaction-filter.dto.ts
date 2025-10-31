import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ETransactionType } from '../enums/transaction-type.enum';
import { ETransactionStatus } from '../enums/transaction-status.enum';

export class TransactionFilterDto {
  @ApiProperty({ enum: ETransactionType, required: false })
  @IsEnum(ETransactionType)
  @IsOptional()
  type?: ETransactionType;

  @ApiProperty({ enum: ETransactionStatus, required: false })
  @IsEnum(ETransactionStatus)
  @IsOptional()
  status?: ETransactionStatus;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
