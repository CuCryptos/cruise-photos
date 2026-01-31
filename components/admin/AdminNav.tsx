'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  PhotoIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/sessions', label: 'Sessions', icon: CalendarIcon },
  { href: '/upload', label: 'Upload', icon: PhotoIcon },
  { href: '/orders', label: 'Orders', icon: ShoppingCartIcon },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Cruise Photos</h1>
        <p className="text-gray-400 text-sm">Admin Panel</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="absolute bottom-4 left-4 right-4">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white w-full"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </nav>
  );
}
