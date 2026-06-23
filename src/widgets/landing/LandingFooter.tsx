import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer>
      <div className="flex items-center justify-between max-w-[960px] mx-auto w-full px-5 pt-6 pb-8 border-t border-line-disabled">
        <div className="text-lg font-extrabold text-caption-heavy">
          <span className="text-primary">N</span> newdok
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="text-sm text-caption-alternative hover:text-caption-heavy transition-colors"
            aria-label="Profile"
          >
            👤
          </Link>
          <Link
            href="#"
            className="text-sm text-caption-alternative hover:text-caption-heavy transition-colors"
            aria-label="Instagram"
          >
            📷
          </Link>
        </div>
      </div>
      <p className="text-[11px] text-caption-assistive text-center px-5 pb-6">
        Copyright Newdok. All rights reserved.
      </p>
    </footer>
  );
}
