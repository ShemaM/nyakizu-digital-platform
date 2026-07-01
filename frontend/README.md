# Nyakizu Frontend

Production-ready React/Next.js frontend for the Nyakizu digital platform.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Components
- **UI Components**: Reusable base components (Button, Card, Badge, Input, etc.)
- **Layouts**: Page layouts (Landing, Auth, Dashboard)
- **Features**: Role-specific feature components

### Pages
- `/` - Landing page with feature overview
- `/login` - User authentication
- `/register` - New account creation
- `/buyer/*` - Buyer dashboard and features
- `/seller/*` - Seller dashboard and features
- `/admin/*` - Admin management panel

## Design System

- **Colors**: Dark mode with gold accents
- **Typography**: Clean sans-serif with semantic hierarchy
- **Spacing**: 8px base unit system
- **Animations**: Smooth transitions and micro-interactions

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
