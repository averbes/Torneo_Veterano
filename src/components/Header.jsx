import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isPublicView = !location.pathname.startsWith('/admin');

  return (
    <header className='sticky top-0 z-50 w-full bg-[#050510]/90 backdrop-blur-xl border-b border-[#FF6B35]/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]'>
      <div className='container mx-auto px-4 md:px-6 py-5 flex justify-between items-center'>
        <Link to="/" className='flex items-center space-x-4' onClick={() => setIsMenuOpen(false)}>
          <div className='w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#7000ff] rounded-lg transform rotate-45 shadow-[0_0_20px_rgba(255,107,53,0.4)] flex items-center justify-center'>
            <div className="w-4 h-4 bg-black rounded-full animate-pulse" />
          </div>
          <h1 className='text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic' style={{ fontFamily: 'Orbitron, sans-serif' }}>
            NEO<span className='text-[#FF6B35]'>LEAGUE</span>
            <span className='ml-3 text-[10px] font-mono text-[#FF6B35]/40 uppercase tracking-[0.3em] hidden lg:inline'>TACTICAL_HUD_v2.0</span>
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className='hidden md:flex space-x-8 text-sm font-bold uppercase tracking-wider'>
          <Link to="/" className={`${isPublicView ? 'text-[#00f2ff] border-b-2 border-[#00f2ff]' : 'text-[#ffffff70] hover:text-white'} pb-1 transition-colors duration-300`}>Dashboard</Link>
          <Link to="/admin" className='text-[#ffffff70] hover:text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-300'>Admin</Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0a1a] border-b border-[#00f2ff]/20 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col p-4 space-y-4 text-center font-bold uppercase tracking-widest">
            <Link
              to="/"
              className={`${isPublicView ? 'text-[#00f2ff]' : 'text-white/60'} py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/admin"
              className="text-white/60 py-2"
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