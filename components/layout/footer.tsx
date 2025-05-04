export function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {year} Düğün Hediye Takibi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
} 