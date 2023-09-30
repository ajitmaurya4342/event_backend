import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import pinoHttp from 'pino-http';

const app = express();
app.set('trust proxy', 1);
app.set('view engine', 'ejs');

app.use(
  pinoHttp({
    transport: {
      target: 'pino-http-print', // use the pino-http-print transport and its formatting output

      options: {
        translateTime: true,
      },
    },
  }),
);

app.use(cors());
app.use(hpp());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use(
  express.static(__dirname + '/public', {
    maxAge: '7d',
  }),
);

app.get('/', async function (req, res) {
  res.status(200).json({
    message: 'Success',
  });
});

export const appInstance = app;
