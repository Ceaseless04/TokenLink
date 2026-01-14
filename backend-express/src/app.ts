import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi.json';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/docs.json', (_req, res) => res.json(openapi));

// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

export default app;
