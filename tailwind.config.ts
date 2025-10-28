
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
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'orbitron': ['Orbitron', 'sans-serif'],
			},
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
				qripto: {
					primary: 'hsl(262 83% 58%)',     // Purple primary 
					secondary: 'hsl(262 69% 66%)',   // Purple secondary 
					accent: 'hsl(24 95% 53%)',       // Orange accent 
					dark: 'hsl(237 45% 20%)',        // Dark purple 
					light: 'hsl(220 14% 96%)'        // Light background 
				},
				knyt: {
					primary: 'hsl(262 83% 58%)',     // Magenta primary (same as qripto)
					secondary: 'hsl(262 69% 66%)',   // Lighter magenta
					accent: 'hsl(197 71% 52%)',      // Blue accent
					dark: 'hsl(262 45% 20%)',        // Dark magenta
					light: 'hsl(262 14% 96%)'        // Light background
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
			// Fix for column-gap utility classes
			gap: {
				'0': '0px',
				'1': '0.25rem',
				'2': '0.5rem',
				'3': '0.75rem',
				'4': '1rem',
				'5': '1.25rem',
				'6': '1.5rem',
				'8': '2rem',
				'10': '2.5rem',
				'12': '3rem',
				'16': '4rem',
				'20': '5rem',
				'24': '6rem',
				'32': '8rem',
				'40': '10rem',
				'48': '12rem',
				'56': '14rem',
				'64': '16rem',
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
