export interface TutorialStep {
  targetId?: string; // ID of the element to highlight
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionType: 'click' | 'next' | 'none'; // 'click' means user must click the target to proceed
  requiredId?: string; // ID of the element user MUST click
}

export const HOME_TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Chào mừng bạn!",
    content: "Chào mừng bạn đến với Math Battle! Hãy để tôi hướng dẫn bạn các tính năng cơ bản.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "home-mode-ai",
    title: "Đấu với AI",
    content: "Đây là chế độ chơi chính. Bạn sẽ đối đầu với máy để rèn luyện tư duy.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "home-mode-campaign",
    title: "Chế độ Vượt ải",
    content: "Khám phá thế giới toán học qua hàng trăm thử thách theo cốt truyện.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "home-mode-pass-play",
    title: "Pass & Play",
    content: "Chơi cùng bạn bè trên cùng một thiết bị.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "home-mode-logic",
    title: "Chế độ Logic",
    content: "Thử thách tính toán thuần túy, không sử dụng kỹ năng thẻ bài.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "home-start-ai-btn",
    title: "Bắt đầu ngay",
    content: "Hãy chọn 'Dễ' và nhấn 'BẮT ĐẦU NGAY' để bắt đầu trận đấu hướng dẫn đầu tiên của bạn!",
    position: 'center',
    actionType: 'click',
    requiredId: "home-start-ai-btn"
  }
];

export const BATTLE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Trận đấu bắt đầu!",
    content: "Đây là chiến trường của những con số. Hãy chú ý các thành phần quan trọng.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-rules-btn",
    title: "Luật chơi",
    content: "Nếu quên luật, hãy nhấn vào dấu chấm hỏi này bất cứ lúc nào.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-guide-btn",
    title: "Hướng dẫn đặt thẻ",
    content: "Nhấn vào đây để xem lại yêu cầu cụ thể của từng màn chơi.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-turn-req",
    title: "Yêu cầu lượt",
    content: "Mỗi lượt có yêu cầu khác nhau. Hãy đảm bảo bạn đặt đúng số lượng thẻ số và phép tính.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-timer",
    title: "Thời gian",
    content: "Mỗi lượt bạn có 60 giây để suy nghĩ. Đừng để hết thời gian nhé!",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-scores",
    title: "Điểm số",
    content: "Đây là tổng điểm của bạn và đối thủ. Hãy cố gắng đạt điểm cao hơn!",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-emotes",
    title: "Cảm xúc",
    content: "Bạn có thể gửi các biểu tượng cảm xúc vui nhộn cho đối thủ ở đây.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-skills",
    title: "Kỹ năng đặc biệt",
    content: "Sử dụng 'Đổi Bài' hoặc 'Kỹ Năng' để lật ngược thế cờ khi gặp khó khăn.",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-interaction-zone",
    title: "Cách chơi",
    content: "Bây giờ, hãy thử nhấn giữ vào lá bài này và kéo nó vào ô trống trên bàn đấu!",
    position: 'center',
    actionType: 'next'
  },
  {
    targetId: "arena-confirm-btn",
    title: "Sẵn sàng chưa?",
    content: "Sau khi đặt xong, hãy nhấn 'XÁC NHẬN LƯỢT' để hoàn tất!",
    position: 'center',
    actionType: 'next'
  }
];
