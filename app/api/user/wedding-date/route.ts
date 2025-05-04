import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/user/wedding-date - Get the current user's wedding date
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { weddingDate: true }
    });
    
    return NextResponse.json({ weddingDate: user?.weddingDate });
  } catch (error) {
    console.error("Wedding date fetch error:", error);
    return NextResponse.json(
      { error: "Düğün tarihi getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/user/wedding-date - Set the current user's wedding date
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    if (!data.weddingDate) {
      return NextResponse.json(
        { error: "Düğün tarihi gereklidir." },
        { status: 400 }
      );
    }
    
    // Update the user's wedding date
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { weddingDate: new Date(data.weddingDate) },
      select: { weddingDate: true }
    });
    
    return NextResponse.json({ weddingDate: user.weddingDate });
  } catch (error) {
    console.error("Wedding date update error:", error);
    return NextResponse.json(
      { error: "Düğün tarihi güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 