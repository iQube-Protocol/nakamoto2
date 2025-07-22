
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface MermaidErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface MermaidErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class MermaidErrorBoundary extends React.Component<MermaidErrorBoundaryProps, MermaidErrorBoundaryState> {
  constructor(props: MermaidErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MermaidErrorBoundaryState {
    console.error('🔧 BOUNDARY: Mermaid error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔧 BOUNDARY: Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-3 rounded border border-red-300 bg-red-50 mt-2">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-red-600 text-sm font-medium">Diagram Error</p>
              <p className="text-red-500 text-xs mt-1">
                The diagram couldn't be rendered safely. Content continues below.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MermaidErrorBoundary;
