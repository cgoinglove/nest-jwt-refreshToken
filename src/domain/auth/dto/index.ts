import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class UserDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty()
  readonly email: string;
  @IsNotEmpty()
  @IsString()
  @Length(6, 30)
  @ApiProperty()
  readonly password: string;
  readonly name?: string;
}

export type AuthHistory = {
  platform: string;
  browser: string;
  ip: string;
  use: boolean;
  os: string;
  lastDate: Date;
  id: string;
};
