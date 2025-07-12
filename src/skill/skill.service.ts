import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Repository } from 'typeorm/repository/Repository';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    const skill = this.skillRepository.create(createSkillDto);
    return this.skillRepository.save(skill);
  }
  findAll() {
    return this.skillRepository.find();
  }

  findOne(id: number) {
    return this.skillRepository.find({ where: { id } });
  }

  update(id: number, updateSkillDto: UpdateSkillDto) {
    return this.skillRepository.update(id, updateSkillDto);
  }

  remove(id: number) {
    return this.skillRepository.delete(id);
  }
}
