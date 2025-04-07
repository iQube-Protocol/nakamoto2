
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, GraduationCap, Wallet, Users } from 'lucide-react';

const SplashPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-iqube-primary/20 via-background to-iqube-accent/20 pt-16 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-iqube-primary to-iqube-accent flex items-center justify-center text-white font-bold text-xl">M</div>
              <span className="ml-2 text-2xl font-bold">MonDAI</span>
            </div>
            <div className="flex gap-4">
              <Link to="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signin">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Your Crypto-Agentic Community Agent
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
                MonDAI provides an intelligent crypto-agentic platform for automated trading insights, real-time market analysis, and enhanced community engagement in the Web3 ecosystem.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/signin">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button size="lg" variant="outline">Learn More</Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md aspect-square bg-gradient-to-br from-iqube-primary/30 to-iqube-accent/30 rounded-3xl p-10 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl"></div>
                <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center relative z-10">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-iqube-primary to-iqube-accent flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Learn Feature */}
            <div className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Learn</h3>
              <p className="text-muted-foreground mb-4">
                Access AI-powered market insights and trading strategies through advanced algorithms and predictive analysis.
              </p>
            </div>
            
            {/* Earn Feature */}
            <div className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Earn</h3>
              <p className="text-muted-foreground mb-4">
                Leverage automated trading strategies and discover high-potential crypto opportunities with AI-driven recommendations.
              </p>
            </div>
            
            {/* Connect Feature */}
            <div className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-muted-foreground mb-4">
                Engage with a network of crypto enthusiasts and experts while automated agents monitor and optimize your community interactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-iqube-primary/10 via-background to-iqube-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-iqube-primary/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-iqube-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to leverage AI for your crypto journey?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join MonDAI today and experience the power of crypto-agentic AI working for your financial success in Web3.
          </p>
          <Link to="/signin">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-iqube-primary to-iqube-accent flex items-center justify-center text-white font-bold text-sm">M</div>
              <span className="ml-2 text-lg font-bold">MonDAI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MonDAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SplashPage;
