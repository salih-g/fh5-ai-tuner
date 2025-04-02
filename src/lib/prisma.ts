// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient'ın global olarak tek bir instance'ını oluştur
// Bu, hot-reloading sırasında birden fazla bağlantı açılmasını önler
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Geliştirme ortamında her sıcak yeniden yükleme sırasında yeni bir Prisma Client oluşturmayı önle
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
