import { setUpEnvironment } from "./utils/config";
import balanceInstance from "./balancer/balanceInstance";

export const handler = async () => {
  try {
    setUpEnvironment();
  } catch (e: unknown) {
    console.error(e);
    process.exit(1);
  }

  await balanceInstance();
};

handler();
