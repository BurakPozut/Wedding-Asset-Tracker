import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Map AssetType to Turkish display name
const assetTypeNames: Record<string, string> = {
  CEYREK_ALTIN: "Çeyrek Altın",
  TAM_ALTIN: "Tam Altın",
  RESAT: "Reşat",
  BESI_BIR_YERDE: "Beşi Bir Yerde",
  BILEZIK: "Bilezik",
  GRAM_GOLD: "Gram Altın",
  TURKISH_LIRA: "Türk Lirası",
  DOLLAR: "Dolar",
  EURO: "Euro",
};

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/giris");
  }
  
  // Fetch data from database
  const assets = await prisma.asset.findMany({
    where: { userId: session.user.id },
    include: { donor: true },
    orderBy: { dateReceived: "desc" },
  });
  
  const donors = await prisma.donor.findMany({
    where: { userId: session.user.id },
  });
  
  // Calculate total value
  const totalValue = assets.reduce((sum, asset) => sum + asset.initialValue, 0);
  
  // Calculate side distribution
  const sideDistribution = {
    groom: 0,
    bride: 0,
    both: 0,
  };
  
  for (const asset of assets) {
    const donor = donors.find(d => d.id === asset.donorId);
    if (donor) {
      if (donor.isGroomSide && donor.isBrideSide) {
        sideDistribution.both += asset.initialValue;
      } else if (donor.isGroomSide) {
        sideDistribution.groom += asset.initialValue;
      } else if (donor.isBrideSide) {
        sideDistribution.bride += asset.initialValue;
      }
    }
  }
  
  // Add half of "both" to each side for display
  const displayGroomValue = sideDistribution.groom + (sideDistribution.both / 2);
  const displayBrideValue = sideDistribution.bride + (sideDistribution.both / 2);
  
  // Calculate asset types summary
  const assetTypeMap = new Map();
  
  for (const asset of assets) {
    const type = asset.type;
    if (!assetTypeMap.has(type)) {
      assetTypeMap.set(type, { type, count: 0, totalValue: 0 });
    }
    
    const typeData = assetTypeMap.get(type);
    typeData.count += 1;
    typeData.totalValue += asset.initialValue;
  }
  
  const assetTypes = Array.from(assetTypeMap.values())
    .sort((a, b) => b.totalValue - a.totalValue);
  
  // Get recent assets
  const recentAssets = assets.slice(0, 3).map(asset => ({
    id: asset.id,
    type: asset.type,
    initialValue: asset.initialValue,
    donorName: asset.donor.name,
    date: asset.dateReceived.toISOString().split('T')[0],
  }));
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Kontrol Paneli</h1>
        <p className="mt-2 text-lg text-gray-700">
          Düğün hediyelerinize genel bakış
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Toplam Varlık</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{assets.length}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Toplam Değer</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(totalValue)}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Toplam Bağışçı</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{donors.length}</dd>
          </div>
        </div>
      </div>
      
      {/* Side Distribution */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Gelin/Damat Tarafı Dağılımı</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-indigo-600">Damat Tarafı</p>
              <p className="mt-2 text-xl font-semibold text-indigo-900">{formatCurrency(displayGroomValue)}</p>
              <p className="mt-1 text-sm text-indigo-700">
                {totalValue > 0 ? Math.round((displayGroomValue / totalValue) * 100) : 0}%
              </p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-pink-600">Gelin Tarafı</p>
              <p className="mt-2 text-xl font-semibold text-pink-900">{formatCurrency(displayBrideValue)}</p>
              <p className="mt-1 text-sm text-pink-700">
                {totalValue > 0 ? Math.round((displayBrideValue / totalValue) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assets */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Son Eklenen Varlıklar</h3>
              <Link href="/varliklar" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Tümünü Görüntüle
              </Link>
            </div>
            {recentAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tür</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Değer</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bağışçı</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {assetTypeNames[asset.type]}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(asset.initialValue)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.donorName}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(asset.date).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Henüz varlık eklenmemiş</p>
            )}
          </div>
        </div>
        
        {/* Asset Types */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Varlık Türleri</h3>
            {assetTypes.length > 0 ? (
              <div className="space-y-4">
                {assetTypes.map((item) => (
                  <div key={item.type} className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{assetTypeNames[item.type]}</p>
                      <p className="text-sm text-gray-500">{item.count} adet</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(item.totalValue)}</p>
                      <p className="text-sm text-gray-500">
                        {totalValue > 0 ? Math.round((item.totalValue / totalValue) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Henüz varlık eklenmemiş</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex space-x-4">
        <Link 
          href="/varliklar/yeni-kayit"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Yeni Kayıt Ekle
        </Link>
        
        <Link 
          href="/varliklar/ekle"
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Varlık Ekle
        </Link>
      </div>
    </div>
  );
} 