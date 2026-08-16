import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 font-serif text-6xl text-cocoa">Page not found</h1>
      <p className="mt-4 max-w-md text-clay">
        The page you are looking for may have moved or no longer exists. Let us help you find
        something beautiful instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">Return home</Link>
        <Link href="/shop" className="btn-outline">Shop the collection</Link>
      </div>
    </div>
  );
}
