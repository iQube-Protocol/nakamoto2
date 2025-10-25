import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle, Chrome, Apple } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Listen for beforeinstallprompt event (Chrome/Edge/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle>App Already Installed!</CardTitle>
            <CardDescription>
              Aigent Nakamoto is already installed on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Open App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Install Aigent Nakamoto</CardTitle>
          <CardDescription>
            Get the full app experience with no browser toolbars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">No Browser UI</p>
                <p className="text-sm text-muted-foreground">
                  Works like a native app with no toolbars
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Offline Access</p>
                <p className="text-sm text-muted-foreground">
                  Use the app even without internet
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Home Screen Access</p>
                <p className="text-sm text-muted-foreground">
                  Launch directly from your home screen
                </p>
              </div>
            </div>
          </div>

          {/* iOS Instructions */}
          {isIOS && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Apple className="w-5 h-5" />
                <span>iOS Installation</span>
              </div>
              <ol className="text-sm space-y-1 ml-7 list-decimal">
                <li>Tap the Share button <span className="inline-block">□↑</span></li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          )}

          {/* Android/Chrome Instructions */}
          {(isAndroid || deferredPrompt) && (
            <>
              {deferredPrompt ? (
                <Button 
                  onClick={handleInstallClick} 
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Install Now
                </Button>
              ) : (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Chrome className="w-5 h-5" />
                    <span>Android/Chrome Installation</span>
                  </div>
                  <ol className="text-sm space-y-1 ml-7 list-decimal">
                    <li>Tap the menu (⋮) in your browser</li>
                    <li>Select "Install app" or "Add to Home screen"</li>
                    <li>Tap "Install" to confirm</li>
                  </ol>
                </div>
              )}
            </>
          )}

          {/* Desktop fallback */}
          {!isIOS && !isAndroid && !deferredPrompt && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Installation is available on mobile devices and Chrome desktop.
                Visit this page on your phone to install.
              </p>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            Continue in Browser
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPWA;
