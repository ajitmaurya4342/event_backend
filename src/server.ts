import { createServer } from 'http';

import { appInstance as app } from '@/app';
import { connectToRedis } from '@/cache';
import { connectToCinematicDatabase, connectToDatabase, knex } from '@/database';
// middle-wares
import { cacheResponse } from '@/middlewares/cacheResponse';
import { errorHandler, notFound } from '@/middlewares/errorMiddlewares';
import { setRequestVariables } from '@/middlewares/setRequestVariables';
import { getRootRouter } from '@/router';
import { logger, setupGracefulShutdown } from '@/utils/utils';

import { releaseSeats } from './cronjobFunction';
import { checkLogin } from './modules/Login/LoginController';

const port = process.env.PORT;
export const server = createServer(app);

Promise.all([connectToDatabase(), connectToCinematicDatabase(), connectToRedis()])
  .then(async ([db, mainDb, redis]) => {
    global.knexConnection = db;
    global.__base = __dirname;
    const ops: AppRouterOptions = { db, mainDb, app, redis };

    // load middlewares here
    app.use(cacheResponse);
    app.use(setRequestVariables);

    const globalOptions = await global.knexConnection('global_options');
    const globalOptionsPrivate = await global.knexConnection('global_options_private');

    const globalOptionsMap: Record<string, string> = {};
    const globalOptionsPrivateMap: Record<string, string> = {};

    globalOptions.forEach(row => {
      globalOptionsMap[row.go_key] = row.go_value;
    });

    globalOptionsPrivate.forEach(row => {
      globalOptionsPrivateMap[row.go_key] = row.go_value;
    });

    // req.globalOptions = globalOptionsMap;
    // req.globalOptionsPrivate = globalOptionsPrivateMap;
    global.globalOptions = globalOptionsMap;
    global.globalOptionsPrivate = globalOptionsPrivate;

    setInterval(
      () => {
        releaseSeats().then(res => {});
      },
      1000 * 60 * 2,
    );

    // loading root router, load other routes inside root router
    app.use(getRootRouter(ops));

    app.use(notFound);
    app.use(errorHandler);

    // setupGracefulShutdown(server);

    server.listen(port, () => {
      logger.info(
        `Listening: http://localhost:${port} using Database: ${process.env.DBNAME}`,
      );
    });
  })
  .catch(error => {
    logger.info('Error Connecting Database', { error });
  });
