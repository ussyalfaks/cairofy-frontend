import { Home, Search, Heart, User, Star, Mic, Settings, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const playlists = [
  'Lona Ray MLX',
  'Ultimate Phonk',
  'Dj Remix Song',
  '2024 Music Remix',
];

export default function Sidebar() {
  return (
    <aside className="w-[260px] h-screen top-0 sticky bg-secondary text-white flex flex-col border-r border-[#222] px-6 py-8 lg:flex">
      <div className="mb-10">
        <Link href="/" className="flex items-center mb-8">
          <span className="text-xl font-bold text-primary">Cairofy</span>
        </Link>
        <nav className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#232323] transition">
            <Home className="h-5 w-5" /> Home
          </Link>
          <Link href="#" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#232323] transition">
            <Heart className="h-5 w-5" /> Favorites
          </Link>
          <Link href="#" className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#232323] font-semibold">
            <Star className="h-5 w-5" /> Artists
          </Link>
          <Link href="#" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#232323] transition">
          <Settings className="h-5 w-5" /> Settings
        </Link>
        </nav>
      </div>
      <div className="mb-8">
        <div className="text-xs text-white/60 mb-2">Library</div>
        <ul className="flex flex-col gap-2">
          {playlists.map((pl) => (
            <li key={pl} className="flex items-center justify-between group text-sm px-2 py-1 rounded hover:bg-[#232323]">
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-white/40 group-hover:text-white/70" />
                <span className="truncate">{pl}</span>
              </span>
              <button className="p-1 hover:text-red-500 text-white/40">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
} 