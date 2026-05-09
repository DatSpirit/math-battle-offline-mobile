import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fcfae4',
          padding: '24px',
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🧭</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#8b5000', marginBottom: 16 }}>Ồ! Đã có lỗi xảy ra</h1>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#8b5000', opacity: 0.6, maxWidth: 500, lineHeight: 1.6, marginBottom: 32 }}>
            Trò chơi gặp phải một sự cố không mong muốn. Đừng lo lắng, tiến trình của bạn có thể vẫn được an toàn.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#8b5000', color: '#ffffff', padding: '16px 32px', borderRadius: 20,
                border: 'none', fontWeight: 900, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(139, 80, 0, 0.2)'
              }}
            >
              Tải lại trang
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'rgba(139, 80, 0, 0.05)', color: '#8b5000', padding: '16px 32px', borderRadius: 20,
                border: '2px solid rgba(139, 80, 0, 0.1)', fontWeight: 900, fontSize: 14, cursor: 'pointer'
              }}
            >
              Về Trang Chủ
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre style={{
              marginTop: 48, padding: 24, background: 'rgba(0,0,0,0.05)', borderRadius: 16,
              fontSize: 12, textAlign: 'left', overflow: 'auto', maxWidth: '100%'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
