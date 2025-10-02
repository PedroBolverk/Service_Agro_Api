// // src/auth/auth.middleware.ts
// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Request, Response, NextFunction } from 'express';

// // Estendendo a interface Request do Express para incluir o 'user'
// interface AuthenticatedRequest extends Request {
//   user: { id: string };
// }

// @Injectable() // Tornando o middleware injetável
// export class AuthMiddleware implements NestMiddleware {
//   constructor(private jwtService: JwtService) {}

//   use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     const token = req.headers.authorization?.split(' ')[1];  // Extraindo o token do cabeçalho

//     if (!token) {
//       console.error('Token não fornecido');
//       return res.status(401).json({ message: 'Token não fornecido' });
//     }

//     try {
//       const decoded = this.jwtService.verify(token);  // Verificando o token
//       req.user = decoded;  // Injeta o usuário no request
//       next();  // Chama o próximo middleware ou controlador
//     } catch (error) {
//       console.error('Erro ao verificar o token:', error);  // Log do erro
//       return res.status(401).json({ message: 'Token inválido' });
//     }
//   }
// }
