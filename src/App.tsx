import { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

export default function App() {
  const [names, setNames] = useState<string>('1,2,3,4,5,6,7,8,9,10');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem('drawHistory') || '[]'));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationRef = useRef<number>();

  const segmentList = names.split(',').map(n => n.trim()).filter(n => n !== '');
  
  const saveWinner = (name: string) => {
    const newHistory = [name, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('drawHistory', JSON.stringify(newHistory));
  };

  const drawWheel = useCallback((rotation = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    const segments = segmentList.length;
    const anglePerSegment = (2 * Math.PI) / segments;

    segmentList.forEach((name, i) => {
      const startAngle = i * anglePerSegment + rotation;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // Different bright colors based on hue
      ctx.fillStyle = `hsl(${(i * 360) / segments}, 70%, 60%)`;
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = "#fff";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textAngle = startAngle + anglePerSegment / 2;
      ctx.fillText(name, centerX + Math.cos(textAngle) * (radius * 0.7), centerY + Math.sin(textAngle) * (radius * 0.7));
    });
  }, [segmentList]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const spin = () => {
    if (isSpinning || segmentList.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const duration = 5000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;
    
    // Total spin: at least 5 full rotations + random offset
    const targetRotation = startRotation + 5 * 2 * Math.PI + Math.random() * 2 * Math.PI;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Deceleration curve: 1 - (1-x)^3
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + (targetRotation - startRotation) * easedProgress;
      rotationRef.current = currentRotation;
      drawWheel(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const finalAngle = (currentRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (Math.PI * 1.5 - finalAngle + 2 * Math.PI) % (2 * Math.PI);
        const winnerIndex = Math.floor(pointerAngle / ((2 * Math.PI) / segmentList.length));
        const result = segmentList[winnerIndex];
        setWinner(result);
        saveWinner(result);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

export default function App() {
  const [names, setNames] = useState<string>('陳小明, 王大同, 李漂亮, 張三丰, 幸運星, 碼農君, 雞米花, 大番薯, 周杰倫, 林俊傑');
  // ... (rest of the component)
  return (
    <div className="min-h-screen bg-[#0F0F12] text-white flex items-center justify-center font-sans">
      <div className="grid grid-cols-[320px_1fr] gap-10 w-[900px] h-[600px] relative">
        <div className="flex flex-col gap-6 justify-center">
          <div className="title-block">
            <p className="text-[#FF3E3E] font-bold text-xs tracking-widest mb-1">RANDOMIZER v2.0</p>
            <h1 className="font-display text-[56px] leading-[0.9] uppercase tracking-tighter text-white">LUCKY<br/>WHEEL</h1>
          </div>

          <div className="input-group">
            <label className="block text-xs uppercase text-[#A1A1AA] mb-2 tracking-widest">名單列表 (逗號分隔)</label>
            <textarea 
              className="w-full h-[180px] bg-[#1A1A1E] border border-[#333] rounded-lg p-3 text-white text-sm outline-none focus:border-[#FF3E3E] resize-none"
              value={names} 
              onChange={(e) => setNames(e.target.value)} 
              placeholder="Enter names separated by commas"
            />
          </div>

          <button 
            onClick={spin}
            disabled={isSpinning}
            className="bg-[#FF3E3E] text-white p-5 text-xl font-extrabold rounded-xl uppercase transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-95"
          >
            {isSpinning ? 'SPINNING...' : 'START SPIN'}
          </button>

          <div className="bg-[#1A1A1E] p-4 rounded-xl border border-[#333]">
            <h3 className="text-sm font-bold text-[#A1A1AA] uppercase mb-2 tracking-widest">Draw History</h3>
            <ul className="space-y-1">
              {history.map((h, i) => (
                <li key={i} className="p-2 bg-[#0F0F12] rounded text-sm text-white border-b border-[#333]">{h}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#FF3E3E] [clip-path:polygon(0%_0%,100%_0%,50%_100%)] z-10 drop-shadow-md"></div>
          <canvas ref={canvasRef} width={500} height={500} className="rounded-full shadow-[0_0_80px_rgba(0,0,0,0.5)] border-8 border-[#1A1A1E]" />
        </div>
      </div>
      
      {winner && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center z-100">
            <h2 className="text-2xl text-[#A1A1AA] mb-4 uppercase tracking-widest">恭喜幸運兒！</h2>
            <div className="font-display text-[120px] text-[#FF3E3E] drop-shadow-[0_0_30px_rgba(255,62,62,0.4)]">{winner}</div>
            <button onClick={() => setWinner(null)} className="mt-10 px-6 py-3 border border-[#444] text-white rounded-full uppercase tracking-widest hover:bg-[#333]">關閉並重置</button>
        </div>
      )}
    </div>
  );
}
