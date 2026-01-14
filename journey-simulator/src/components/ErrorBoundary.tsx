import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            const route = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
            const runMode = typeof window !== 'undefined' ? localStorage.getItem('mfai-run-mode') || 'unknown' : 'unknown';
            const stack = this.state.error?.stack || 'No stack trace available';

            return (
                <div data-testid="app-error" className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-4 text-red-900">
                    <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
                    <div className="max-w-4xl w-full space-y-4">
                        <div className="rounded bg-red-100 p-4">
                            <p className="font-semibold mb-2">Error Message:</p>
                            <pre className="text-sm overflow-auto">{this.state.error?.message}</pre>
                        </div>
                        <div className="rounded bg-red-100 p-4">
                            <p className="font-semibold mb-2">Context:</p>
                            <p className="text-sm">Route: {route}</p>
                            <p className="text-sm">RunMode: {runMode}</p>
                        </div>
                        <div className="rounded bg-red-100 p-4" data-testid="fatal-error-stack">
                            <p className="font-semibold mb-2">Stack Trace:</p>
                            <pre className="text-xs overflow-auto max-h-96">{stack}</pre>
                        </div>
                        {this.state.errorInfo && (
                            <div className="rounded bg-red-100 p-4">
                                <p className="font-semibold mb-2">Component Stack:</p>
                                <pre className="text-xs overflow-auto max-h-96">{this.state.errorInfo.componentStack}</pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
