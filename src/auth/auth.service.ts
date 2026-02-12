import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "src/dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon2 from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable({})
export class AuthService{
   constructor(private prisma:PrismaService,private config:ConfigService,private jwt:JwtService){}

 async signup(dto:AuthDto){
  try{

      const password=await argon2.hash(dto.password);
    
      const user=await this.prisma.user.create({
        data:{
          email:dto.email,
          password
        },
    
      })
      
      delete user.password
      return user

    }catch(error){
       if(error instanceof PrismaClientKnownRequestError && error.code==="P2002"){
          throw new ForbiddenException("Credentials Taken")
       }
       else{
        throw error;
       }
    }
}

 
 async signin(dto:AuthDto){

    const user=await this.prisma.user.findUnique({
      where:{
        email:dto.email
      }
    });
    if(!user) throw new ForbiddenException("Incorrect Credentials")
    
    const pwMatch=await argon2.verify(user.password,dto.password);

    if(!pwMatch) throw new ForbiddenException("Incorrect Credentials");

    return this.signToken(user.id,user.email);

 }


 async signToken(userId:number,email:string):Promise<{access_Token:string}>{
    const payload={
      sub:userId,
      email
    }
    const secret=this.config.get("SECRET");
    const token=await this.jwt.signAsync(payload,{
      expiresIn:"15m",
      secret
    });

   return {
     access_Token:token,

   }
 }

}