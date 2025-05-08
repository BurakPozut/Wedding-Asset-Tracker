import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the current user is an admin
    const currentUserMember = await prisma.weddingMember.findFirst({
      where: {
        userId: session.user.id,
        role: 'ADMIN',
      },
    });

    if (!currentUserMember) {
      return new NextResponse('Only admins can remove members', { status: 403 });
    }

    // Get the member to be removed
    const memberToRemove = await prisma.weddingMember.findUnique({
      where: { id: params.id },
    });

    if (!memberToRemove) {
      return new NextResponse('Member not found', { status: 404 });
    }

    // Check if the member is in the same wedding as the admin
    if (memberToRemove.weddingId !== currentUserMember.weddingId) {
      return new NextResponse('Member not found in your wedding', { status: 404 });
    }

    // Only allow removing viewers
    if (memberToRemove.role === 'ADMIN') {
      return new NextResponse('Cannot remove admin members', { status: 403 });
    }

    // Remove the member
    await prisma.weddingMember.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[WEDDING_MEMBER_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 