# Beyond Prediction Website

A modern, TypeScript-based website built with Vite and Bootstrap 5, designed to run locally and deploy to a Nectar cloud VM using Docker.

## Tech Stack

- **Node.js** + **npm** - Package management and tooling
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript with strict mode enabled
- **Bootstrap 5** - CSS framework for responsive design
- **Docker** - Containerization for deployment

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose** (optional, for containerized development/deployment)

## Local Development (Without Docker)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The development server includes hot module replacement (HMR), so changes to your files will automatically reload in the browser.

### Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production (outputs to `dist/`)
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code using Prettier

## Local Development (With Docker)

If you prefer to develop entirely within Docker:

1. Start the development service:
   ```bash
   docker compose up web-dev
   ```

2. Open your browser to:
   ```
   http://localhost:5173
   ```

The container will install dependencies and start the Vite dev server with hot reload enabled. File changes on your host machine will be reflected in the container.

To stop the service:
```bash
 docker compose down
```

## Building for Production

### Local Build

1. Build the project:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

### Production Build with Docker

1. Build the production container:
   ```bash
   docker compose build web-prod
   ```

2. Run the production container:
   ```bash
   docker compose up web-prod
   ```

3. Open your browser to:
   ```
   http://localhost:8080
   ```

The production build uses a multi-stage Docker build:
- **Build stage**: Uses Node.js to compile TypeScript and bundle assets with Vite
- **Runtime stage**: Uses nginx to serve the static files efficiently

## Deployment to Nectar Cloud VM

The production Docker container is suitable for deployment on any Linux VM with Docker installed (including Nectar cloud VMs).

### Steps for Deployment

1. **On your local machine**, ensure the project builds successfully:
   ```bash
   docker compose build web-prod
   ```

2. **On your Nectar VM**, copy the project files:
   ```bash
   # Use scp, rsync, or git to transfer files
   scp -r . user@your-vm-ip:/path/to/project
   ```

3. **On your Nectar VM**, navigate to the project directory and build:
   ```bash
   cd /path/to/project
   docker compose build web-prod
   ```

4. **On your Nectar VM**, run the container:
   ```bash
   docker compose up -d web-prod
   ```

5. **Configure firewall/security groups** on your Nectar VM to allow traffic on port 8080 (or map to port 80 if you have root access).

### Alternative: Using Docker Run

If you prefer `docker run` directly:

```bash
# Build the image
docker build -t beyond-prediction-website .

# Run the container
docker run -d -p 80:80 --name beyond-prediction beyond-prediction-website
```

## Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── navbar.ts          # Navbar component
│   │   └── hero.ts            # Hero section component
│   ├── main.ts                # Application entry point
│   └── styles.css             # Custom CSS styles
├── public/                    # Static assets
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
├── Dockerfile                 # Production Docker build
├── docker-compose.yml         # Docker Compose services
└── README.md                  # This file
```

## TypeScript Configuration

The project uses TypeScript with strict mode enabled (`"strict": true` in `tsconfig.json`). This ensures:

- All variables are explicitly typed
- Null checks are enforced
- No implicit `any` types
- Better IDE support and error detection

## Bootstrap Integration

Bootstrap 5 is installed via npm and imported directly in `src/main.ts`. This ensures:

- Bootstrap CSS and JavaScript are bundled with your application
- No external CDN dependencies
- Better performance through bundling
- Type safety for Bootstrap components

Custom styles in `src/styles.css` extend Bootstrap's default styles.

## Development Notes

- All TypeScript files are in `src/`
- Components in `src/components/` are simple functions that render HTML
- The main application logic is in `src/main.ts`
- Bootstrap JavaScript is loaded for interactive components (navbar toggle, etc.)
- Custom styles should go in `src/styles.css` to extend Bootstrap safely

## License

This project is private and proprietary.

