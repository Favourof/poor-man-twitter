import fp from "fastify-plugin";
import { AppDataSource } from "../database/data-source";

export default fp(async (fastify) => {
  await AppDataSource.initialize();

  fastify.log.info("Database connected...");
  fastify.decorate("db", AppDataSource);
  fastify.addHook("onClose", async () => {
    await AppDataSource.destroy();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    db: typeof AppDataSource;
  }
}
