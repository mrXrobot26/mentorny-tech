import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { User } from '../auth/decorators/user.decorator';
import { ResponseDto } from '../common/decorators/response.decorator';
import { AddSkillsDto } from './dto/add-skills.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ResponseDto(UserResponseDto)
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('skills')
  async addSkills(@User() currentUser: any, @Body() dto: AddSkillsDto) {
    await this.userService.addSkillsToUser(currentUser.userId, dto.skillNames);
    return { message: 'Skills added successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ResponseDto(UserResponseDto)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ResponseDto(UserResponseDto)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @User() currentUser: any) {
    // Prevent super admin from being deleted
    const targetUser = await this.userService.findOneEntity(+id);
    if (targetUser.roles.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Super admin cannot be deleted');
    }

    return this.userService.remove(+id);
  }
}
