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

    const { name, date } = await req.json();
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    const wedding = await prisma.wedding.create({
      data: {
        name,
        date: date ? new Date(date) : null,
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

    const wedding = await prisma.wedding.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(wedding);
  } catch (error) {
    console.error('[WEDDINGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { date } = await req.json();
    if (!date) {
      return new NextResponse('Date is required', { status: 400 });
    }

    const wedding = await prisma.wedding.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: 'ADMIN',
          },
        },
      },
    });

    if (!wedding) {
      return new NextResponse('Wedding not found', { status: 404 });
    }

    const updatedWedding = await prisma.wedding.update({
      where: {
        id: wedding.id,
      },
      data: {
        date: new Date(date),
      },
    });

    return NextResponse.json(updatedWedding);
  } catch (error) {
    console.error('[WEDDINGS_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 