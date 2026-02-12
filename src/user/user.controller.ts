import { Controller, Get, Req, UseGuards,} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { Request } from 'express';
@Controller('users')
export class UserController {
    @Get("/me")
    @UseGuards(JwtGuard)

    getUser(@GetUser() user:User){
      return user
    }
}
