import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../auth/enums/role.enum';
import { Skill } from '../skill/entities/skill.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  // Create user with email uniqueness check
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: createUserDto.roles || [Role.USER], // Default to USER role
    });
    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }

  // Find all users
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  // Find user by ID with not found validation
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Internal method to get full user entity (for auth operations)
  async findOneEntity(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    await this.findOneEntity(id);
    await this.userRepository.delete(id);
  }

  // Refresh token methods - these need full entity access
  async updateRefreshToken(
    userId: number,
    hashedToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      refreshTokenHash: hashedToken,
      refreshTokenExpiresAt: expiresAt,
    });
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User | null> {
    // Find all users with refresh tokens
    const users = await this.userRepository.find({
      where: {
        refreshTokenHash: Not(IsNull()),
      },
    });

    // Check each user's hashed token against the provided token
    for (const user of users) {
      if (
        user.refreshTokenHash &&
        user.refreshTokenHash !== '' &&
        (await bcrypt.compare(refreshToken, user.refreshTokenHash))
      ) {
        return user;
      }
    }

    return null;
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      refreshTokenHash: '',
      refreshTokenExpiresAt: new Date(0),
    });
  }

  async addSkillsToUser(userId: number, skillNames: string[]){
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['skills'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existingSkills = await this.skillRepository.find({
      where: skillNames.map((name) => ({ name })),
    });
    const existingSkillNames = existingSkills.map((skill) => skill.name);
    const newSkillNames = skillNames.filter(
      (name) => !existingSkillNames.includes(name),
    );
    const newSkills = this.skillRepository.create(
      newSkillNames.map((name) => ({ name })),
    );
    await this.skillRepository.save(newSkills);

    const allSkills = [...existingSkills, ...newSkills];
    user.skills = [...(user.skills || []), ...allSkills];
    await this.userRepository.save(user);
  }
}
