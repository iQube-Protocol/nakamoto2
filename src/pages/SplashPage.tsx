import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SplashPage = () => {
  const navigate = useNavigate();

  // Safe video loading with fallback
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!videoLoaded) setShowFallback(true);
    }, 2000);
    return () => clearTimeout(t);
  }, [videoLoaded]);
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-qripto-dark via-qripto-primary to-qripto-secondary">
      <div className="container max-w-4xl mx-auto px-4 py-8 flex flex-col h-full">
        {/* Video Section */}
        <div className="flex-1 flex flex-col justify-center items-center space-y-8">
          <div className="w-full max-w-3xl">
            <div style={{
              padding: '56.25% 0 0 0',
              position: 'relative'
            }}>
              {showFallback ? (
                <div className="relative rounded-lg shadow-2xl overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt="Aigent Nakamoto intro video placeholder"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center space-y-3 px-6">
                      <p className="text-white text-sm md:text-base">Video unavailable in this environment.</p>
                      <a
                        href="https://vimeo.com/1086475550"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-2 text-white hover:bg-white/10 transition"
                      >
                        Open on Vimeo
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe 
                  src="https://player.vimeo.com/video/1086475550?badge=0&autopause=0&player_id=0&app_id=58479" 
                  frameBorder="0" 
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }} 
                  title="AIgent Nakamoto" 
                  className="rounded-lg shadow-2xl" 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setVideoLoaded(true)}
                />
              )}
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-xl md:text-2xl font-semibold text-qripto-accent">
              Aigent Nakamoto
            </h1>
            <p className="text-white/80 text-sm md:text-lg">Get your personalized iQube and COYN AI Agent</p>
            
            {/* Mobile Button - positioned right after description */}
            <div className="md:hidden pt-4">
              <Button 
                onClick={() => navigate('/aigent')} 
                variant="outline" 
                className="w-full max-w-md border-white/30 text-white hover:bg-white/10"
              >
                Try Aigent Nakamoto
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Action Button */}
        <div className="hidden md:flex flex-col space-y-4 max-w-md mx-auto w-full pb-8">
          <Button 
            onClick={() => navigate('/aigent')} 
            variant="outline" 
            className="w-full border-white/30 text-white hover:bg-white/10"
          >
            Try Aigent Nakamoto
          </Button>
        </div>

        <div className="text-xs text-white/50 text-center">Powered by iQubes & Aigentic AI</div>
      </div>
    </div>
  );
};

export default SplashPage;
