// import { Injectable } from '@nestjs/common';
// import { CanActivate, ExecutionContext } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class JwtGuard implements CanActivate {
//   constructor(private jwtService: JwtService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = request.headers.authorization?.split(' ')[1]; // Extrai o token JWT

//     if (!token) {
//       console.error('Token não fornecido');
//       throw new Error('Token não fornecido');
//     }

//     try {
//       // Verifica o token com a chave secreta
//       const decoded = this.jwtService.verify(token, {
//         secret: process.env.JWT_SECRET,  // A chave secreta para verificar o token
//       });
//       console.log('Token decodificado:', decoded);  // Log do token decodificado
//       request.user = decoded;  // Injeta o usuário no request
//       return true;
//     } catch (error) {
//       console.error('Erro ao verificar o token:', error); // Log do erro
//       throw new Error('Token inválido');
//     }
//   }
// }
