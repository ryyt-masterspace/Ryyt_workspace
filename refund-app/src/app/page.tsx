export default function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-start pt-32 bg-white">
      <div className="max-w-5xl mx-auto text-center px-6">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 hover:scale-105 transition-transform duration-700 ease-out cursor-default select-none">
          The Trust Layer for <span className="text-[#0052FF]">Refunds</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Turn refund anxiety into customer loyalty with transparent tracking and instant updates.
        </p>
      </div>
    </main>
  );
}
