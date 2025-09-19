import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { RegisterData, LoginData, JWTPayload } from '../types/auth';

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z.string().min(3, 'Username doit faire au moins 3 caractères'),
  password: z.string().min(6, 'Mot de passe doit faire au moins 6 caractères'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

class AuthService {
  private readonly JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

  async register(data: RegisterData) {
    // Valider les données
    const validatedData = registerSchema.parse(data);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        throw new Error('Cet email est déjà utilisé');
      }
      if (existingUser.username === validatedData.username) {
        throw new Error('Ce nom d\'utilisateur est déjà pris');
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      }
    });

    // Générer le token
    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return { user, accessToken };
  }

  async login(data: LoginData) {
    // Valider les données
    const validatedData = loginSchema.parse(data);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Générer le token
    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Retourner les données utilisateur (sans mot de passe)
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_ACCESS_SECRET, { expiresIn: '24h' });
  }

  verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_ACCESS_SECRET) as JWTPayload;
  }
}

export default new AuthService();
