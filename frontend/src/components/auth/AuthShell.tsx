import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME } from '@/lib/config';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Form side */}
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 block text-center">
            <span className="font-serif text-2xl tracking-[0.2em] text-cocoa">
              {SITE_NAME.toUpperCase()}
            </span>
          </Link>
          <h1 className="text-center font-serif text-3xl text-cocoa">{title}</h1>
          {subtitle && <p className="mt-2 text-center text-sm text-clay">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-clay">{footer}</div>}
        </div>
      </div>

      {/* Image side */}
      <div className="relative hidden lg:block">
        <Image
          src="https://picsum.photos/seed/aurelia-auth/1000/1400"
          alt="Aurelia jewellery"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/60 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-sm text-ivory">
          <p className="font-serif text-3xl leading-tight">
            Timeless jewellery, crafted for every story.
          </p>
        </div>
      </div>
    </div>
  );
}
