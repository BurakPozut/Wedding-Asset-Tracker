import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { WeddingForm } from "./wedding-form";

export default async function NewWedding() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/giris");
  }

  // Check if user already has any wedding memberships
  const userWeddings = await prisma.weddingMember.findMany({
    where: { userId: session.user.id },
    include: { wedding: true }
  });

  // If user already has weddings, redirect to dashboard
  if (userWeddings.length > 0) {
    redirect("/kontrol-paneli");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Yeni Düğün Oluştur
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Düğün bilgilerinizi girin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <WeddingForm userId={session.user.id} />
        </div>
      </div>
    </div>
  );
} 