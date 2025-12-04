# Weather App

A modern weather application built with Vue 3, TypeScript, Vite, and Tailwind CSS.

## Features

- Real-time weather data
- Location-based forecasts
- Responsive design
- Component-based architecture
- Type-safe development with TypeScript
- Automated testing with Vitest
- CI/CD pipeline with GitHub Actions
- Deployed on Netlify

## Setup Instructions

### Prerequisites

- Node.js 20+ and npm installed

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-app
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your WeatherAPI key to `.env`:
```
VITE_WEATHERAPI_KEY=your_actual_api_key
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Testing

Run the test suite:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test -- --watch
```

### Build

Create a production build:
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/    # Reusable Vue components
├── stores/        # Pinia state management stores
├── services/      # API and utility services
├── types/         # TypeScript type definitions
├── tests/         # Unit and component tests
├── App.vue        # Root component
└── main.ts        # Application entry point
```

## Technologies

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Next-generation frontend build tool
- **Pinia**: Vue state management
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Date-fns**: Date manipulation library
- **Vitest**: Unit testing framework
- **Vue Test Utils**: Vue component testing utilities

## Deployment

### Netlify

The app is configured for deployment on Netlify. Environment secrets are configured in the Netlify dashboard.

Deploy manually:
```bash
npm run build
netlify deploy --prod --dir dist
```

### GitHub Actions

CI/CD pipeline runs on every push:
- Runs tests
- Builds the application
- Deploys to Netlify on main branch merge

## Environment Variables

- `VITE_WEATHERAPI_KEY`: API key for weather data (required)

## License

MIT
