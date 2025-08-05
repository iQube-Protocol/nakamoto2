
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	safelist: [
		// Preserve Mermaid classes from purging
		{ pattern: /^mermaid/ },
		{ pattern: /^diagram/ },
		{ pattern: /^flowchart/ },
		{ pattern: /^node/ },
		{ pattern: /^edge/ },
		{ pattern: /^label/ },
		{ pattern: /^cluster/ },
		{ pattern: /^actor/ },
		{ pattern: /^message/ },
		{ pattern: /^relation/ },
		{ pattern: /^state/ },
		{ pattern: /^task/ },
		{ pattern: /^section/ },
		{ pattern: /^pie/ },
		{ pattern: /^legend/ },
		{ pattern: /^er-/ },
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				qrypto: {
					primary: '#8B5CF6',     // Purple primary
					secondary: '#A855F7',   // Purple secondary  
					accent: '#FB923C',      // Orange accent
					dark: '#1E1B4B',        // Dark purple
					light: '#F3F4F6'        // Light background
				},
				// Legacy support for any remaining references
				iqube: {
					primary: '#8B5CF6',
					secondary: '#A855F7',
					accent: '#FB923C'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundSize: {
				'300%': '300%',
			},
			// Standard gap utilities (removing experimental column-gap references)
			spacing: {
				'0': '0px',
				'0.5': '0.125rem',
				'1': '0.25rem',
				'1.5': '0.375rem',
				'2': '0.5rem',
				'2.5': '0.625rem',
				'3': '0.75rem',
				'3.5': '0.875rem',
				'4': '1rem',
				'5': '1.25rem',
				'6': '1.5rem',
				'7': '1.75rem',
				'8': '2rem',
				'9': '2.25rem',
				'10': '2.5rem',
				'11': '2.75rem',
				'12': '3rem',
				'14': '3.5rem',
				'16': '4rem',
				'20': '5rem',
				'24': '6rem',
				'28': '7rem',
				'32': '8rem',
				'36': '9rem',
				'40': '10rem',
				'44': '11rem',
				'48': '12rem',
				'52': '13rem',
				'56': '14rem',
				'60': '15rem',
				'64': '16rem',
				'72': '18rem',
				'80': '20rem',
				'96': '24rem',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-slow': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.6'
					}
				},
				'gradient-flow': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'dot-wave': {
					'0%': { 
						transform: 'scale(1)', 
						opacity: '1',
						boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)'
					},
					'25%': { 
						transform: 'scale(1.15)', 
						opacity: '0.9',
						boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.6)'
					},
					'50%': { 
						transform: 'scale(1.2)', 
						opacity: '0.8',
						boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.4)'
					},
					'75%': { 
						transform: 'scale(1.1)', 
						opacity: '0.9',
						boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.3)'
					},
					'100%': { 
						transform: 'scale(1)', 
						opacity: '1',
						boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)'
					}
				},
				'shimmer-pass': {
					'0%': { 
						opacity: '0',
						transform: 'translateX(-100%)'
					},
					'50%': { 
						opacity: '1',
						transform: 'translateX(0%)'
					},
					'100%': { 
						opacity: '0',
						transform: 'translateX(100%)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				'gradient-flow': 'gradient-flow 8s ease infinite',
				'dot-wave': 'dot-wave 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'shimmer-pass': 'shimmer-pass 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
