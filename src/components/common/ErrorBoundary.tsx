import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="p-8 bg-red-50 text-red-800 h-screen flex flex-col items-center justify-center text-left">
                    <h1 className="text-2xl font-bold mb-4">Uygulama Hatası (White Screen Debugger)</h1>
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200 overflow-auto max-w-4xl w-full">
                        <p className="font-mono text-sm text-red-600 mb-4 whitespace-pre-wrap">
                            {this.state.error?.toString()}
                        </p>
                        <p className="text-gray-500 text-xs">Lütfen bu hatayı geliştiriciye bildirin.</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
                    >
                        Sayfayı Yenile
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
