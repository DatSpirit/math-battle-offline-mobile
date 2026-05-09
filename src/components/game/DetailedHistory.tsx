import type { TurnResult } from '../../types/game';
import { fmtResult } from '../../core/game/matchEngine';
import React from 'react';

interface DetailedHistoryProps {
  history: TurnResult[];
}

interface RowProps {
  isPlayer: boolean;
  expression: string | undefined;
  value: number;
  logic: number;
  bonus: number;
  total: number;
  winStatus: 'win' | 'loss' | 'tie';
}

const DetailedHistory: React.FC<DetailedHistoryProps> = ({ history }) => {
  const Row: React.FC<RowProps> = ({ isPlayer, expression, value, logic, bonus, total, winStatus }) => (
    <div className={`
      grid grid-cols-[2.5fr_1fr_1fr_1fr_45px] items-center gap-0 px-1 py-1.5
      ${isPlayer ? 'bg-blue-100/40' : 'bg-gray-200/30'}
      ${isPlayer ? 'border-b border-blue-200/30' : 'border-b border-gray-300/20'}
      hover:bg-primary/5 transition-colors
    `}>
      {/* Expression & Result Aligned */}
      <div className="px-3 md:px-6 text-[11px] md:text-[12px] font-black italic tracking-tight border-r border-primary/5 h-full flex items-center">
        <div className="grid grid-cols-[1fr_15px_45px] md:grid-cols-[1fr_20px_60px] w-full items-center">
          <span className="text-primary/90 text-left whitespace-nowrap overflow-hidden text-ellipsis">
            {expression?.replace(/\*/g, '×').replace(/\//g, '÷') || '0'}
          </span>
          <span className="text-orange-600 font-black text-center">=</span> 
          <span className="text-amber-600 text-right whitespace-nowrap font-mono text-[11px] md:text-[13px]">
            {fmtResult(value)}
          </span>
        </div>
      </div>

      {/* Logic */}
      <div className="text-[10px] md:text-[11px] font-black text-primary/70 text-center border-r border-primary/5 h-full flex items-center justify-center">
        {logic}
      </div>
 
      {/* Bonus */}
      <div className="text-[10px] md:text-[11px] font-black text-green-700 text-center border-r border-primary/5 h-full flex items-center justify-center">
        {bonus > 0 ? `+${bonus}` : bonus}
      </div>
 
      {/* Total */}
      <div className={`text-[11px] md:text-[12px] font-black text-primary italic text-center border-r border-primary/5 h-full flex items-center justify-center ${isPlayer ? 'bg-blue-200/10' : 'bg-gray-300/10'}`}>
        +{total}
      </div>

      {/* W/L Status */}
      <div className="flex justify-center items-center h-full">
        <div className={`
          w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black italic shadow-sm
          ${winStatus === 'win' ? 'bg-green-500 text-white' : 
            winStatus === 'loss' ? 'bg-red-500 text-white opacity-80' : 
            'bg-yellow-500 text-white'}
        `}>
          {winStatus === 'win' ? 'W' : winStatus === 'loss' ? 'L' : 'D'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl shadow-primary/5 mt-4 border border-primary/10 flex flex-col h-fit">
      {/* Header Panel with Color Legend */}
      <div className="bg-primary/5 px-6 py-5 flex flex-col gap-3 border-b border-primary/10">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-primary uppercase text-sm tracking-[0.2em] m-0 italic">
            Phân Tích Chiến Thuật
          </h3>
          {/* High-Contrast Legend */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded-sm bg-blue-100 border border-blue-200" />
              <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">BẠN</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded-sm bg-gray-200 border border-gray-300" />
              <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">MÁY</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-primary/30" />
           <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest leading-none">
             {history.length} Lượt đã đối đầu
           </span>
        </div>
      </div>
      
      <div className="flex flex-col w-full">
        {history.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[14px] font-black text-primary/20 uppercase tracking-widest italic">
              Đang đợi dữ liệu trận đấu...
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_45px] gap-0 px-1 py-2 bg-primary/10 border-b border-primary/20">
              <span className="text-[7px] md:text-[8px] font-black text-primary/50 uppercase tracking-widest px-3 md:px-6 border-r border-primary/10">Phép tính & Kết quả</span>
              <span className="text-[7px] md:text-[8px] font-black text-primary/50 uppercase tracking-widest text-center border-r border-primary/10">Logic</span>
              <span className="text-[7px] md:text-[8px] font-black text-primary/50 uppercase tracking-widest text-center border-r border-primary/10">Bonus</span>
              <span className="text-[7px] md:text-[8px] font-black text-primary/50 uppercase tracking-widest text-center border-r border-primary/10">Tổng</span>
              <span className="text-[7px] md:text-[8px] font-black text-primary/50 uppercase tracking-widest text-center">W/L</span>
            </div>
            
            {[...history].reverse().map((turn, i) => {
              const isPlayerWin = turn.winner === 'player';
              const isAIWin = turn.winner === 'ai';
              const isTie = turn.winner === 'tie';

              return (
                <div key={i} className="flex flex-col last:border-0 overflow-hidden w-full">
                  {/* Turn Divider */}
                  <div className="bg-white/50 px-6 py-1.5 border-b border-primary/5 flex items-center justify-between">
                     <span className="text-[9px] font-black text-primary/15 uppercase tracking-[0.4em]">
                       Lượt {turn.turn}
                     </span>
                  </div>

                  <Row 
                    isPlayer={true} 
                    expression={turn.playerExpression}
                    value={turn.playerValue ?? 0}
                    logic={turn.playerLogicScore}
                    bonus={turn.playerTacticalScore}
                    total={turn.playerPointsEarned}
                    winStatus={isPlayerWin ? 'win' : isTie ? 'tie' : 'loss'}
                  />
                  <Row 
                    isPlayer={false} 
                    expression={turn.aiExpression}
                    value={turn.aiValue ?? 0}
                    logic={turn.aiLogicScore}
                    bonus={turn.aiTacticalScore}
                    total={turn.aiPointsEarned}
                    winStatus={isAIWin ? 'win' : isTie ? 'tie' : 'loss'}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="bg-primary/5 p-5 text-center border-t border-primary/10">
         <p className="text-[9px] font-black text-primary/20 uppercase tracking-[0.4em] italic m-0">
           {history.length < 6 ? 'TRẬN ĐẤU ĐANG DIỄN RA...' : 'TRẬN ĐẤU ĐÃ KẾT THÚC'}
         </p>
      </div>
    </div>
  );
};

export default React.memo(DetailedHistory);
