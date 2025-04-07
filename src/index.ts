import { setUpEnvironment } from "./utils/config";
import balanceInstance from "./balancer/balanceInstance";
import logger from "./utils/logger";

export const handler = async () => {
  try {
    setUpEnvironment();
  } catch (e: unknown) {
    logger.error("Environment setup failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    process.exit(1);
  }

  await balanceInstance();
};

handler();
