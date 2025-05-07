import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    const wedding = await prisma.wedding.create({
      data: {
        name,
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN',
          },
        },
      },
    });

    return NextResponse.json(wedding);
  } catch (error) {
    console.error('[WEDDINGS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const weddings = await prisma.wedding.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json(weddings);
  } catch (error) {
    console.error('[WEDDINGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 