import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { SparklesIcon, ZapIcon, CpuIcon, ShieldCheckIcon } from '../shared/Icons';
import { usePlayerStore } from '../../store/playerStore';
import { detectHardwarePerformance } from '../../utils/performance';

// Real assets to preload
import summonBg from '../../assets/summon_grand.webp';
import diamondVault from '../../assets/images/shop/diamond_vault.webp';
import goldTreasury from '../../assets/images/shop/gold_treasury.webp';

const ASSETS_TO_PRELOAD = [
  summonBg,
  diamondVault,
  goldTreasury,
  // Add other heavy assets here
];

const SETUP_STEPS = [
  { id: 'integrity', label: 'KIỂM TRA DỮ LIỆU...', icon: <ShieldCheckIcon size={20} /> },
  { id: 'extract', label: 'NẠP TÀI NGUYÊN HÌNH ẢNH...', icon: <ZapIcon size={20} /> },
  { id: 'engine', label: 'KHỞI CHẠY MATH ENGINE...', icon: <SparklesIcon size={20} /> },
  { id: 'gpu', label: 'TỐI ƯU HÓA GPU HARDWARE...', icon: <CpuIcon size={20} /> },
];

const AppSetupScreen: React.FC = () => {
  const { setAppInitialized } = useUIStore();
  const { hasHydrated, setPerformanceMode, setIsPerformanceSet } = usePlayerStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [loadStatus, setLoadStatus] = useState<Record<string, boolean>>({
    integrity: false,
    extract: false,
    engine: false,
    gpu: false
  });

  useEffect(() => {
    const runSetup = async () => {
      // Step 1: Integrity (Wait for Hydration)
      setOverallProgress(10);
      setCurrentStep(0);
      while (!hasHydrated) {
        await new Promise(r => setTimeout(r, 100));
      }
      setLoadStatus(prev => ({ ...prev, integrity: true }));
      setOverallProgress(25);

      // Step 2: Extract (Preload Images)
      setCurrentStep(1);
      let loadedCount = 0;
      const preloadPromises = ASSETS_TO_PRELOAD.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loadedCount++;
            setOverallProgress(25 + (loadedCount / ASSETS_TO_PRELOAD.length) * 40);
            resolve(true);
          };
          img.onerror = resolve; // Continue even if one fails
        });
      });
      await Promise.all(preloadPromises);
      setLoadStatus(prev => ({ ...prev, extract: true }));
      setOverallProgress(65);

      // Step 3: Engine Initialization
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 800)); // Real system check simulation
      setLoadStatus(prev => ({ ...prev, engine: true }));
      setOverallProgress(85);

      // Step 4: GPU Optimization
      setCurrentStep(3);
      const performance = detectHardwarePerformance();
      setPerformanceMode(performance);
      setIsPerformanceSet(true);
      await new Promise(r => setTimeout(r, 500));
      setLoadStatus(prev => ({ ...prev, gpu: true }));
      setOverallProgress(100);

      // Finish
      setIsFinishing(true);
      setTimeout(() => {
        setAppInitialized(true);
      }, 1000);
    };

    runSetup();
  }, [hasHydrated, setAppInitialized, setPerformanceMode, setIsPerformanceSet]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-9999 bg-[#0f0c08] flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="fixed inset-0 opacity-[0.03] hologram-grid"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Animated Brand Logo/Symbol */}
        <motion.div
          animate={{ 
            rotateY: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="size-24 bg-primary rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(139,80,0,0.5)] border-2 border-white/20 mb-12"
        >
          <span className="text-4xl font-black text-white italic">Σ</span>
        </motion.div>

        <h2 className="text-xl font-black text-white italic tracking-[0.2em] uppercase mb-2 text-center">
          Math Battle <span className="text-primary">Offline</span>
        </h2>
        <p className="text-[9px] font-black text-white/30 tracking-[0.5em] uppercase mb-16">Initializing Experience</p>

        {/* Setup Steps Console */}
        <div className="w-full bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={SETUP_STEPS[currentStep].id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                {SETUP_STEPS[currentStep].icon}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-white italic tracking-widest uppercase mb-1">
                  {SETUP_STEPS[currentStep].label}
                </div>
                <div className="text-[8px] font-bold text-white/40 uppercase">
                  Status: <span className={loadStatus[SETUP_STEPS[currentStep].id] ? "text-green-400" : "text-primary"}>
                    {loadStatus[SETUP_STEPS[currentStep].id] ? "READY" : "Processing..."}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Detailed Progress Bar */}
          <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              style={{ width: `${overallProgress}%` }}
              className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_15px_rgba(139,80,0,0.8)]"
            />
          </div>
          
          <div className="flex justify-between mt-3">
             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
               {isFinishing ? 'SETUP COMPLETE' : `Step ${currentStep + 1} of ${SETUP_STEPS.length}`}
             </span>
             <span className="text-[8px] font-black text-primary font-mono">
               {Math.round(overallProgress)}%
             </span>
          </div>
        </div>

        {/* Bottom Technical Labels */}
        <div className="flex gap-8 opacity-20">
           <div className="flex flex-col items-center">
              <span className="text-[6px] font-black text-white uppercase tracking-widest mb-1">Build</span>
              <span className="text-[8px] font-bold text-white italic">v1.4.0-STABLE</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[6px] font-black text-white uppercase tracking-widest mb-1">Renderer</span>
              <span className="text-[8px] font-bold text-white italic">Vulkan/GLES3</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[6px] font-black text-white uppercase tracking-widest mb-1">Region</span>
              <span className="text-[8px] font-bold text-white italic">GLOBAL_VN</span>
           </div>
        </div>
      </div>

      {/* Finishing Overlay */}
      <AnimatePresence>
        {isFinishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-20 bg-primary flex items-center justify-center"
          >
             <motion.h1
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-4xl font-black text-white italic uppercase tracking-tighter"
             >
                READY TO BATTLE
             </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AppSetupScreen;
