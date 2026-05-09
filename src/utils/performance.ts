/**
 * TIỆN ÍCH PHÂN TÍCH HIỆU NĂNG (PERFORMANCE DETECTION UTILS)
 * Giúp tự động nhận diện sức mạnh phần cứng của thiết bị.
 */

export type PerformanceMode = 'ECO' | 'BALANCED' | 'ULTRA';

/**
 * Phân tích cấu hình máy dựa trên RAM và số nhân CPU.
 * Cải tiến: Khắt khe hơn với thiết bị di động để tránh lag.
 */
export const detectHardwarePerformance = (): PerformanceMode => {
  // 1. Kiểm tra bộ nhớ RAM (nếu trình duyệt hỗ trợ)
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  
  // 2. Kiểm tra số nhân CPU
  const cpuCores = navigator.hardwareConcurrency || 4;

  // 3. Kiểm tra thiết bị di động
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // LOGIC PHÂN LOẠI CẢI TIẾN:
  // - Di động: Mặc định tối đa là BALANCED trừ khi máy cực khủng.
  // - Nếu máy yếu (RAM < 3GB hoặc CPU < 4 nhân): Luôn ECO.
  
  if (isMobile) {
    if (memory >= 8 && cpuCores >= 8) return 'BALANCED'; // Máy mạnh trên Mobile chỉ nên chạy Balanced
    return 'ECO'; // Đa số điện thoại nên để ECO cho mượt
  }

  if (memory >= 12 && cpuCores >= 8) return 'ULTRA';
  if (memory >= 6 && cpuCores >= 4) return 'BALANCED';

  return 'ECO';
};

/**
 * Các cờ hiệu năng để components sử dụng trực tiếp.
 */
export const getPerfFlags = (mode: PerformanceMode) => ({
  enableBlur: mode !== 'ECO',
  enableParticles: mode === 'ULTRA',
  enableHeavyAnimations: mode === 'ULTRA',
  enableShadows: mode !== 'ECO',
  animationScale: mode === 'ECO' ? 0.5 : 1, // Giảm 50% thời gian animation ở ECO (nhanh hơn)
  maxParticles: mode === 'ULTRA' ? 100 : mode === 'BALANCED' ? 30 : 0,
});
