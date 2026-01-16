import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isPublicView = !location.pathname.startsWith('/admin');

  return (
    <header className='sticky top-0 z-50 w-full bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-[#00f2ff]/20 shadow-[0_0_20px_rgba(0,242,255,0.1)]'>
      <div className='container mx-auto px-4 md:px-6 py-4 flex justify-between items-center'>
        <Link to="/" className='flex items-center space-x-3' onClick={() => setIsMenuOpen(false)}>
          <div className='w-8 h-8 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-sm transform rotate-45 shadow-[0_0_15px_rgba(0,242,255,0.5)]' />
          <h1 className='text-xl md:text-2xl font-black tracking-tighter text-white'>
            NEO<span className='text-[#00f2ff]'>LEAGUE</span>
            <span className='ml-2 text-[10px] font-mono text-[#ffffff50] uppercase tracking-widest hidden sm:inline'>Veterans v1.0</span>
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