import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import { SKINS, THEMES } from './constants';
import { ThemeType } from './types';

enum AppState {
  MENU,
  PLAYING,
  GAME_OVER
}

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.MENU);
  const [playerName, setPlayerName] = useState('HoleMaster');
  const [selectedSkinId, setSelectedSkinId] = useState(SKINS[0].id);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('CITY');
  const [results, setResults] = useState<{ score: number, rank: number, winner: string } | null>(null);

  const startGame = () => {
    setAppState(AppState.PLAYING);
  };

  const handleGameOver = (score: number, rank: number, winner: string) => {
    setResults({ score, rank, winner });
    setAppState(AppState.GAME_OVER);
  };

  const toMenu = () => {
    setAppState(AppState.MENU);
  };

  const restartGame = () => {
    setAppState(AppState.PLAYING);
  }

  return (
    <div className="w-screen h-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">
      {appState === AppState.MENU && (
        <div className="absolute inset-0 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          
          <div className="relative z-10 w-full max-w-6xl p-8 h-[90vh] flex flex-col items-center">
            
            <div className="text-center mb-8 animate-in fade-in slide-in-from-top-10 duration-700">
                <h1 className="text-7xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 drop-shadow-lg" style={{textShadow: '0 0 30px rgba(168, 85, 247, 0.4)'}}>
                X9M8 HOLE CITY
                </h1>
                <p className="text-slate-300 font-medium text-lg flex items-center justify-center gap-2">
                  Eat the World. Become the Void. 
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-400">v1.4 Cloud</span>
                </p>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto pb-4">
                
                {/* Left: Setup */}
                <div className="lg:col-span-4 space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Identity</label>
                        <input 
                            type="text" 
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-bold text-lg placeholder-slate-600 transition-all"
                            placeholder="Enter Name..."
                            maxLength={12}
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select Hole Skin</label>
                        <div className="grid grid-cols-4 gap-3">
                            {SKINS.map(skin => (
                                <button
                                    key={skin.id}
                                    onClick={() => setSelectedSkinId(skin.id)}
                                    className={`aspect-square rounded-xl border-2 transition-all relative overflow-hidden group
                                        ${selectedSkinId === skin.id ? 'border-white scale-105 shadow-lg shadow-indigo-500/20' : 'border-white/5 hover:border-white/30'}`}
                                    style={{background: '#0f172a'}}
                                    title={skin.name}
                                >
                                    <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60" style={{background: `radial-gradient(circle, ${skin.color}, transparent)`}}></div>
                                    <div className="absolute inset-2 rounded-full border-[3px]" style={{borderColor: skin.color}}></div>
                                    {selectedSkinId === skin.id && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-center font-bold text-indigo-300 text-sm">
                            {SKINS.find(s => s.id === selectedSkinId)?.name}
                        </div>
                     </div>
                </div>

                {/* Right: Map Selection */}
                <div className="lg:col-span-8 flex flex-col">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Environment</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                        {(Object.keys(THEMES) as ThemeType[]).map((themeKey) => {
                            const theme = THEMES[themeKey];
                            const isSelected = selectedTheme === themeKey;
                            
                            // Background images for cards (using colors as placeholders for clean code, ideally images)
                            let bgGradient = '';
                            if (themeKey === 'CITY') bgGradient = 'linear-gradient(to bottom right, #3b82f6, #1e293b)';
                            if (themeKey === 'FOREST') bgGradient = 'linear-gradient(to bottom right, #22c55e, #14532d)';
                            if (themeKey === 'DINO') bgGradient = 'linear-gradient(to bottom right, #ea580c, #7c2d12)';

                            return (
                                <button
                                    key={themeKey}
                                    onClick={() => setSelectedTheme(themeKey)}
                                    className={`relative rounded-3xl overflow-hidden transition-all duration-300 group text-left border-2 flex flex-col justify-end p-6
                                        ${isSelected ? 'border-white scale-[1.02] shadow-2xl z-10' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.01]'}`}
                                    style={{background: bgGradient, minHeight: '200px'}}
                                >
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="text-2xl font-black text-white mb-2">{theme.name}</div>
                                        <p className="text-sm text-white/90 font-medium leading-tight">{theme.description}</p>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-4 right-4 bg-white text-black p-1.5 rounded-full shadow-lg">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            <button 
              onClick={startGame}
              className="mt-8 group relative w-full max-w-md py-6 bg-white text-black rounded-2xl font-black text-2xl tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl hover:shadow-white/20 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                 ENTER SIMULATION
                 <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </button>

          </div>
        </div>
      )}

      {appState === AppState.PLAYING && (
        <GameCanvas 
            playerName={playerName} 
            selectedSkinId={selectedSkinId}
            theme={selectedTheme}
            onGameOver={handleGameOver} 
        />
      )}

      {appState === AppState.GAME_OVER && results && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50">
           <div className="w-full max-w-lg p-8 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 text-center relative overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${results.rank === 1 ? 'from-yellow-400 via-orange-500 to-yellow-400' : 'from-blue-500 to-purple-600'}`}></div>

             <h2 className="text-5xl font-black mb-2 uppercase tracking-tight">
               {results.rank === 1 ? <span className="text-yellow-400 drop-shadow-lg">VICTORY!</span> : <span className="text-white">TIME UP!</span>}
             </h2>
             <p className="text-slate-400 mb-8 font-medium">Simulation Complete.</p>
             
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Final Score</div>
                    <div className="text-4xl font-black text-white">{results.score}</div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Rank</div>
                    <div className={`text-4xl font-black ${results.rank === 1 ? 'text-yellow-400' : 'text-white'}`}>#{results.rank}</div>
                </div>
             </div>

             {results.rank !== 1 && (
                 <div className="mb-8 text-slate-400 text-sm bg-slate-900/30 p-2 rounded-lg inline-block px-4">
                     Winner: <span className="text-white font-bold">{results.winner}</span>
                 </div>
             )}

             <div className="flex flex-col gap-3">
                <button 
                    onClick={restartGame}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black text-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                    PLAY AGAIN
                </button>
                <button 
                    onClick={toMenu}
                    className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg transition-colors border border-white/5"
                >
                    Back to Menu
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;