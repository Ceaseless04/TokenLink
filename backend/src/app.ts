import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import swaggerSpec from './swagger';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Swagger UI (mounted only in non-production to avoid exposing API docs in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
} else {
  // in production we still expose the raw spec only if explicitly enabled via env
  if (process.env.EXPOSE_API_DOCS === 'true') {
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
  }
}

// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

export default app;
