import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, date } = await req.json();

    // Build the where clause based on provided search parameters
    const where: Prisma.WeddingWhereInput = {};
    
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    
    if (date) {
      where.date = {
        equals: new Date(date),
      };
    }

    // Exclude weddings where the user is already a member
    where.members = {
      none: {
        userId: session.user.id,
      },
    };

    const weddings = await prisma.wedding.findMany({
      where,
      select: {
        id: true,
        name: true,
        date: true,
      },
    });

    return NextResponse.json(weddings);
  } catch (error) {
    console.error('[WEDDINGS_SEARCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 