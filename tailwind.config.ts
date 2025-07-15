import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			cute: {
  				pink: {
  					50: '#fef1f9',
  					100: '#fce8f3',
  					200: '#fad1e8',
  					300: '#f8b4d9',
  					400: '#f687b3',
  					500: '#ed64a6',
  				},
  				purple: {
  					50: '#faf5ff',
  					100: '#f3e8ff',
  					200: '#e9d5ff',
  					300: '#d8b4fe',
  					400: '#c084fc',
  					500: '#a855f7',
  				},
  				blue: {
  					50: '#eff6ff',
  					100: '#dbeafe',
  					200: '#bfdbfe',
  					300: '#93c5fd',
  					400: '#60a5fa',
  					500: '#3b82f6',
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'cute-sm': 'var(--cute-radius-sm)',
  			'cute-md': 'var(--cute-radius-md)',
  			'cute-lg': 'var(--cute-radius-lg)',
  			'cute-xl': 'var(--cute-radius-xl)'
  		},
  		boxShadow: {
  			'cute-sm': 'var(--cute-shadow-sm)',
  			'cute-md': 'var(--cute-shadow-md)',
  			'cute-lg': 'var(--cute-shadow-lg)',
  			'cute-xl': 'var(--cute-shadow-xl)',
  			'cute-primary': 'var(--cute-shadow-pink)',
  			'cute-secondary': 'var(--cute-shadow-purple)',
  			'cute-ghost': 'var(--cute-shadow-blue)',
  			'kawaii': '0 4px 16px rgba(246, 135, 179, 0.2)',
  		},
  		spacing: {
  			'cute-xs': 'var(--cute-spacing-xs)',
  			'cute-sm': 'var(--cute-spacing-sm)',
  			'cute-md': 'var(--cute-spacing-md)',
  			'cute-lg': 'var(--cute-spacing-lg)',
  			'cute-xl': 'var(--cute-spacing-xl)'
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
  			'bounce-soft': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-10px)' }
  			},
  			'wiggle': {
  				'0%, 100%': { transform: 'rotate(0deg)' },
  				'25%': { transform: 'rotate(-3deg)' },
  				'75%': { transform: 'rotate(3deg)' }
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
  				'33%': { transform: 'translateY(-20px) rotate(5deg)' },
  				'66%': { transform: 'translateY(-10px) rotate(-5deg)' }
  			},
  			'cute-pulse': {
  				'0%, 100%': { opacity: '1', transform: 'scale(1)' },
  				'50%': { opacity: '0.8', transform: 'scale(1.05)' }
  			},
  			'cute-bounce': {
  				'0%, 100%': { transform: 'translateY(0) scaleY(1)' },
  				'50%': { transform: 'translateY(-20px) scaleY(1.1)' }
  			},
  			'sparkle': {
  				'0%, 100%': { opacity: '0', transform: 'scale(0)' },
  				'50%': { opacity: '1', transform: 'scale(1)' }
  			},
  			'slide-in-up': {
  				'0%': { transform: 'translateY(100%)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			'fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
  			'wiggle': 'wiggle 1s ease-in-out infinite',
  			'float': 'float 6s ease-in-out infinite',
  			'cute-pulse': 'cute-pulse 2s ease-in-out infinite',
  			'cute-bounce': 'cute-bounce 1s ease-in-out infinite',
  			'sparkle': 'sparkle 2s ease-in-out infinite',
  			'slide-in-up': 'slide-in-up 0.5s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
