import { WeddingForm } from "./wedding-form";

export default function NewWeddingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Yeni Düğün Oluştur
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Yeni bir düğün oluşturmak için aşağıdaki formu doldurun
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <WeddingForm />
        </div>
      </div>
    </div>
  );
} 