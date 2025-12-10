import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        project: './project.html',
        search: './search.html',
        about: './about.html',
        people: './people.html',
        person: './person.html',
        reports: './reports.html',
        report: './report.html',
      },
    },
  },
});
