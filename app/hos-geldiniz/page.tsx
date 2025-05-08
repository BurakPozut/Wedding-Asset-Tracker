import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Welcome() {
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Hoş Geldiniz!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Düğün hediyelerinizi takip etmeye başlamak için bir seçim yapın
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="mt-8 space-y-4">
              <Link
                href="/dugunler/yeni"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Yeni Düğün Oluştur
              </Link>
              <Link
                href="/dugunler/ara"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Mevcut Düğüne Katıl
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 