import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { usePlayerStore } from '../store/playerStore';

/**
 * Danh sách các tệp âm thanh trong ứng dụng
 * Tất cả các tệp này phải được đặt trong thư mục /public/sounds/
 * Lưu ý: Tên file phải khớp chính xác kể cả chữ hoa/thường
 */
const SOUNDS = {
  click: 'sounds/click.ogg',         // Tiếng click chuột/nút bấm chung
  place: 'sounds/place.ogg',         // Tiếng khi đặt thẻ bài vào ô trống
  submit: 'sounds/submit.ogg',       // Tiếng khi xác nhận lượt đánh
  win: 'sounds/win.ogg',             // Tiếng khi thắng trận đấu
  loss: 'sounds/loss.ogg',           // Tiếng khi thua trận đấu
  combo: 'sounds/combo.ogg',         // Tiếng khi đạt chuỗi tính toán đúng
  timer: 'sounds/timer.ogg',         // Tiếng đếm ngược thời gian
  drawer_open: 'sounds/click.ogg',   // Tiếng khi mở các bảng điều khiển
  drawer_close: 'sounds/click.ogg',  // Tiếng khi đóng các bảng điều khiển
  reward: 'sounds/reward.ogg',       // Tiếng khi nhận phần thưởng
  upgrade: 'sounds/upgrade.ogg',     // Tiếng khi nâng cấp thẻ bài
  skill: 'sounds/skill.ogg',         // Tiếng khi kích hoạt kỹ năng đặc biệt
  attack: 'sounds/attack.ogg',       // Tiếng khi tấn công đối thủ
  defense: 'sounds/defense.ogg',     // Tiếng khi phòng thủ hoặc chặn đòn
  summon: 'sounds/summon.ogg',       // Tiếng khi thực hiện triệu hồi thẻ
  bgm: 'sounds/bgm.ogg',             // Nhạc nền (Background Music)
};

export type SoundName = keyof typeof SOUNDS;

/**
 * Hook quản lý âm thanh và rung (Haptics) cho toàn bộ trò chơi
 * Hỗ trợ Web (Howler.js) và Native (Capacitor Haptics)
 */
export function useSound() {
  // Lưu trữ các đối tượng âm thanh để tránh khởi tạo lại nhiều lần
  const soundsRef = useRef<Record<string, Howl>>({});
  const { isMuted } = usePlayerStore(); // Lấy trạng thái tắt tiếng từ Store

  // Khởi tạo tất cả âm thanh khi Hook được mount lần đầu
  useEffect(() => {
    const currentSounds = soundsRef.current;
    
    Object.entries(SOUNDS).forEach(([name, url]) => {
      currentSounds[name] = new Howl({
        src: [url],
        volume: name === 'bgm' ? 0.3 : (name === 'summon' ? 0.8 : 0.5), 
        preload: true,
        loop: name === 'bgm' || name === 'summon', // Nhạc nền và triệu hồi sẽ lặp lại
        onloaderror: (_id, err) => {
            console.warn(`Lỗi tải âm thanh. Vui lòng kiểm tra file: public${url}`, err);
        }
      });
    });

    // Cleanup: Giải phóng bộ nhớ khi Component bị unmount
    return () => {
      Object.values(currentSounds).forEach(s => s.unload());
    };
  }, []);

  // Đồng bộ trạng thái tắt tiếng (Mute) với tất cả các đối tượng Howl
  useEffect(() => {
    const bgm = soundsRef.current['bgm'];
    if (bgm) {
      bgm.volume(isMuted ? 0 : 0.3);
    }
    Object.entries(soundsRef.current).forEach(([name, sound]) => {
      if (name !== 'bgm') {
        sound.volume(isMuted ? 0 : 0.5);
      }
    });
  }, [isMuted]);

  /**
   * Phát một hiệu ứng âm thanh và kích hoạt rung trên thiết bị di động
   * @param name Tên âm thanh trong danh sách SOUNDS
   * @param volume Độ lớn tùy chỉnh (0.0 đến 1.0)
   */
  const playSound = useCallback((name: SoundName, volume?: number) => {
    const sound = soundsRef.current[name];
    if (sound) {
      if (volume !== undefined) sound.volume(volume);
      sound.play();

      // Xử lý rung (Haptics) nếu đang chạy trên thiết bị di động (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        switch (name) {
          case 'win':
          case 'reward':
          case 'upgrade':
          case 'attack':
          case 'summon':
            Haptics.impact({ style: ImpactStyle.Heavy }); // Rung mạnh cho các sự kiện quan trọng
            break;
          case 'loss':
            Haptics.notification({ type: NotificationType.Error }); // Rung kiểu cảnh báo lỗi
            break;
          case 'skill':
          case 'submit':
          case 'place':
          case 'defense':
            Haptics.impact({ style: ImpactStyle.Medium }); // Rung vừa cho tương tác game
            break;
          case 'click':
          case 'timer':
            Haptics.impact({ style: ImpactStyle.Light }); // Rung nhẹ cho click chuột
            break;
          default:
            break;
        }
      }
    }
  }, []);

  /** Phát nhạc nền */
  const playBGM = useCallback(() => {
    const bgm = soundsRef.current['bgm'];
    if (bgm && !bgm.playing()) {
      bgm.play();
    }
  }, []);

  /** Dừng nhạc nền */
  const stopBGM = useCallback(() => {
    const bgm = soundsRef.current['bgm'];
    if (bgm) {
      bgm.stop();
    }
  }, []);

  /** Dừng một hiệu ứng âm thanh cụ thể */
  const stopSound = useCallback((name: SoundName) => {
    const sound = soundsRef.current[name];
    if (sound) {
      sound.stop();
    }
  }, []);

  /** Giảm dần âm lượng rồi dừng hẳn (thường dùng cho BGM) */
  const fadeOutSound = useCallback((name: SoundName, duration: number = 1000) => {
    const sound = soundsRef.current[name];
    if (sound && sound.playing()) {
      sound.fade(sound.volume(), 0, duration);
      setTimeout(() => sound.stop(), duration);
    }
  }, []);

  /** Thay đổi âm lượng nhạc nền */
  const setBGMVolume = useCallback((volume: number) => {
    const bgm = soundsRef.current['bgm'];
    if (bgm) {
      bgm.volume(volume);
    }
  }, []);

  return { playSound, stopSound, fadeOutSound, playBGM, stopBGM, setBGMVolume };
}
