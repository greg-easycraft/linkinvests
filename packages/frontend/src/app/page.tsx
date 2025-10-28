import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center px-4">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">LinkInvest</h1>
        <p className="text-xl text-gray-600 mb-8">
          Plateforme d'investissement immobilier
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Accéder au tableau de bord
        </Link>
      </main>
    </div>
  );
}
