import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Wifi, Search, Command } from 'lucide-react'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isPublicView = !location.pathname.startsWith('/admin');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className='sticky top-0 z-50 w-full bg-[#050510]/95 backdrop-blur-xl border-b border-[#FF6B35]/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]'>
      <div className='container mx-auto px-4 md:px-6 py-4 flex justify-between items-center'>
        <div className="flex items-center gap-8">
          <Link to="/" className='flex items-center space-x-4' onClick={() => setIsMenuOpen(false)}>
            <div className='relative w-10 h-10 md:w-12 md:h-12 shrink-0'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#FF6B35] to-[#7000ff] rounded-lg transform rotate-45 shadow-[0_0_20px_rgba(255,107,53,0.4)] animate-pulse-slow' />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-full animate-pulse" />
              </div>
            </div>
            <div className="hidden xs:block">
              <h1 className='text-xl md:text-3xl font-black tracking-tighter text-white uppercase italic' style={{ fontFamily: 'Orbitron, sans-serif' }}>
                NEO<span className='text-[#FF6B35]'>LEAGUE</span>
              </h1>
              <div className='text-[8px] md:text-[10px] font-mono text-[#FF6B35]/40 uppercase tracking-[0.2em]'>
                TACTICAL_HUD_v3.0.1
              </div>
            </div>
          </Link>

          {/* Tactical Search Bar */}
          <div className="hidden lg:flex items-center relative group">
            <div className="absolute left-3 text-[#FF6B35]/50 group-hover:text-[#FF6B35] transition-colors">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="QUICK_DATA_SEARCH..."
              className="bg-black/60 border border-[#FF6B35]/20 rounded-xl py-2 pl-10 pr-12 text-[10px] font-mono text-white placeholder-white/20 w-64 focus:w-80 focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50 transition-all duration-500"
            />
            <div className="absolute right-3 flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-mono text-white/30">
              <Command size={8} /> K
            </div>
          </div>
        </div>

        {/* Desktop Nav + Clock */}
        <div className='hidden md:flex items-center gap-8'>
          {/* Real-time Clock */}
          <div className='flex items-center gap-4 px-4 py-2 bg-black/40 border border-[#FF6B35]/20 rounded-xl'>
            <div className='text-right'>
              <div className='text-xs font-mono text-[#ffffff30] uppercase tracking-widest'>SYSTEM_TIME</div>
              <div className='text-lg font-black text-[#FF6B35] tracking-wider' style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {formatTime(currentTime)}
              </div>
            </div>
            <div className='w-px h-8 bg-white/10' />
            <div className='text-left'>
              <div className='text-xs font-mono text-[#ffffff30] uppercase tracking-widest'>DATE</div>
              <div className='text-sm font-bold text-white/60' style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className='flex items-center gap-2 px-3 py-2 bg-black/40 border border-green-500/20 rounded-lg'>
            <Wifi size={14} className='text-green-500 animate-pulse' />
            <span className='text-[10px] font-mono text-green-500 uppercase tracking-widest'>LIVE</span>
          </div>

          {/* Nav Links */}
          <nav className='flex space-x-6 text-sm font-bold uppercase tracking-wider'>
            <Link to="/" className={`${isPublicView ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-[#ffffff70] hover:text-white'} pb-1 transition-colors duration-300`}>Dashboard</Link>
            <Link to="/admin" className='text-[#ffffff70] hover:text-[#FF6B35] transition-colors duration-300'>Admin</Link>
          </nav>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-4 md:hidden">
          <button className="text-[#FF6B35]/60 hover:text-[#FF6B35] transition-colors">
            <Search size={22} />
          </button>
          <button
            className="text-white p-2 border border-[#FF6B35]/30 rounded-lg hover:bg-[#FF6B35]/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0a1a] border-b border-[#FF6B35]/20 animate-in slide-in-from-top-4 duration-200">
          <div className='p-4 border-b border-white/5'>
            <div className='text-center'>
              <div className='text-[10px] font-mono text-[#ffffff30] uppercase mb-1'>SYSTEM TIME</div>
              <div className='text-2xl font-black text-[#FF6B35]' style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {formatTime(currentTime)}
              </div>
              <div className='text-xs text-white/40 mt-1'>{formatDate(currentTime)}</div>
            </div>
          </div>
          <nav className="flex flex-col p-4 space-y-4 text-center font-bold uppercase tracking-widest">
            <Link
              to="/"
              className={`${isPublicView ? 'text-[#FF6B35]' : 'text-white/60'} py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/admin"
              className="text-white/60 py-2 hover:text-[#FF6B35] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin Central
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header