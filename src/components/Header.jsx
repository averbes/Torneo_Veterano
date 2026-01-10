import React from 'react'

export const Header = () => {
  return (
    <header className='sticky top-0 z-50 w-full bg-[#0a0a1a]/60 backdrop-blur-xl border-b border-[#00f2ff]/20 shadow-[0_0_20px_rgba(0,242,255,0.1)]'>
      <div className='container mx-auto px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-sm transform rotate-45 shadow-[0_0_15px_rgba(0,242,255,0.5)]' />
          <h1 className='text-2xl font-black tracking-tighter text-white'>
            NEO<span className='text-[#00f2ff]'>LEAGUE</span>
            <span className='ml-2 text-xs font-mono text-[#ffffff50] uppercase tracking-widest'>Veterans v1.0</span>
          </h1>
        </div>

        <nav className='hidden md:flex space-x-8 text-sm font-bold uppercase tracking-wider'>
          <a href="#" className='text-[#00f2ff] border-b-2 border-[#00f2ff] pb-1'>Dashboard</a>
          <a href="#" className='text-[#ffffff70] hover:text-white transition-colors duration-300'>Teams</a>
          <a href="#" className='text-[#ffffff70] hover:text-white transition-colors duration-300'>Matches</a>
          <a href="#" className='text-[#ffffff70] hover:text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-300'>Admin</a>
        </nav>
      </div>
    </header>
  )
}

export default Header