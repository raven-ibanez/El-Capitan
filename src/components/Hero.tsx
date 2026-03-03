import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative wave-bg bg-gradient-to-br from-captain-navy via-captain-blue to-captain-navy py-20 px-4 overflow-hidden">
      {/* Decorative nautical circles */}
      <div className="absolute top-8 left-8 w-32 h-32 rounded-full border border-captain-cyan/20 animate-float" />
      <div className="absolute top-12 left-12 w-20 h-20 rounded-full border border-captain-gold/20 animate-float" style={{ animationDelay: '-2s' }} />
      <div className="absolute bottom-8 right-8 w-40 h-40 rounded-full border border-captain-cyan/15 animate-float" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-12 right-16 w-24 h-24 rounded-full border border-captain-gold/15 animate-float" style={{ animationDelay: '-1s' }} />

      {/* Cyan accent line (mirrors the logo stripe) */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-captain-cyan/30 to-transparent" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Nautical icon row */}
        <div className="flex justify-center items-center gap-4 mb-6 text-4xl animate-fade-in">
          <span className="animate-float" style={{ animationDelay: '0s' }}>⚓</span>
          <span className="text-captain-gold text-5xl animate-float" style={{ animationDelay: '-1s' }}>⚙️</span>
          <span className="animate-float" style={{ animationDelay: '-2s' }}>🧊</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-outfit font-bold text-captain-white mb-4 animate-fade-in leading-tight">
          Fresh.{' '}
          <span className="text-captain-cyan drop-shadow-lg">Pure.</span>{' '}
          Delivered.
        </h1>

        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-captain-cyan" />
          <span className="text-captain-gold font-bold tracking-widest text-sm uppercase">
            eL Capitan Purified Tube Ice
          </span>
          <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-captain-cyan" />
        </div>

        <p className="text-lg text-captain-light mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed">
          Premium purified tube ice &amp; clean drinking water — straight from the source to your doorstep.
          Order now and beat the heat! 💧
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
          <a
            href="#ice"
            className="bg-captain-cyan text-captain-navy px-8 py-3.5 rounded-full hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-xl shadow-captain-cyan/30"
          >
            🧊 Order Ice
          </a>
          <a
            href="#water"
            className="bg-transparent text-captain-cyan border-2 border-captain-cyan px-8 py-3.5 rounded-full hover:bg-captain-cyan hover:text-captain-navy transition-all duration-300 transform hover:scale-105 font-bold text-lg"
          >
            💧 Order Water
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;