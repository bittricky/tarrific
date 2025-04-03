# Tariffic - Tariff Calculator

A modern web application for calculating import/export tariffs based on HS codes, countries, and other trade parameters. This tool helps businesses estimate the cost implications of international trade under different tariff scenarios.

## Features

- **HS Code Selection**: Choose from a comprehensive list of Harmonized System codes
- **Country Selection**: Specify origin and destination countries for shipments
- **Currency Conversion**: Automatic conversion between different currencies
- **Tariff Comparison**: Compare current vs. proposed tariff rates
- **Detailed Cost Breakdown**: View shipping, logistics, and additional duty costs
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: TailwindCSS
- **Data Sources**: Local CSV files for HS codes and sections

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or pnpm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/bittricky/tariff-calculator.git
   cd tariff-calculator
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Project Structure

```
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── ui/         # Reusable UI components
│   │   └── ...         # Feature-specific components
│   ├── data/           # Local data files
│   │   ├── HSCode.csv  # HS code data
│   │   └── HSCodeSections.csv # HS code sections
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── global.d.ts     # TypeScript declarations
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── package.json        # Project dependencies
└── vite.config.ts      # Vite configuration
```

## Recent Developments

### UI Enhancements
- Implemented a modern, accessible UI using Radix UI design principles
- Added form validation with clear error messages
- Improved responsive layout for better mobile experience

### Data Management
- Integrated local CSV files for HS code data instead of external API dependency
- Implemented CSV parsing logic with fallback mechanisms
- Created custom hooks for data fetching and state management

### Form Handling
- Simplified select field implementation for better compatibility
- Added proper event handling for form inputs
- Implemented consistent styling across all form elements