import { IsArray, IsString } from 'class-validator';

export class AddSkillsDto {
  @IsArray()
  @IsString({ each: true })
  skillNames: string[];
}
