import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Root-level Error Boundary that prevents a full white-screen crash.
 * Offers a "Reset & Reload" button that clears localStorage (which is
 * the most likely source of corrupt-data crashes) and hard-reloads.
 */
export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('HearQuran — Uncaught render error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        backgroundColor: '#000',
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                            Something went wrong
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#8E8E93', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            The app encountered an unexpected error. You can try resetting to fix it.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#E0A899',
                                color: '#000',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                            }}
                        >
                            Reset &amp; Reload
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
