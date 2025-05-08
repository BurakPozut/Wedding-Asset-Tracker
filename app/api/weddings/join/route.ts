import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { weddingId } = await req.json();
    if (!weddingId) {
      return new NextResponse('Wedding ID is required', { status: 400 });
    }

    // Check if wedding exists
    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      return new NextResponse('Wedding not found', { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.weddingMember.findUnique({
      where: {
        weddingId_userId: {
          weddingId,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      return new NextResponse('Already a member of this wedding', { status: 400 });
    }

    // Add user as a viewer to the wedding
    await prisma.weddingMember.create({
      data: {
        weddingId,
        userId: session.user.id,
        role: 'VIEWER',
      },
    });

    return new NextResponse('Successfully joined wedding', { status: 200 });
  } catch (error) {
    console.error('[WEDDINGS_JOIN]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 