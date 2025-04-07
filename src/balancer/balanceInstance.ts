import getECSInstances from "../ecs/getECSInstances";
import getECSTasks from "../ecs/getECSTasks";
import logger from "../utils/logger";
import { canReBalance, getInstanceResource } from "./calculateUsage";
import terminateInstance from "./terminateInstance";

export default async function balanceInstance() {
  const instances = await getECSInstances();

  const tasks = await getECSTasks();

  const instanceResources = await Promise.all(
    instances.map(async (instance) => {
      return getInstanceResource(instance);
    })
  );

  logger.info("Starting Rebalancing Check", {
    totalInstances: instanceResources.length,
  });

  const data = canReBalance(instanceResources, tasks);

  logger.debug("Rebalancing Check Result", {
    canReBalance: data.canReBalance,
    targetInstanceArn: data.targetInstanceArn,
  });

  if (data.canReBalance && data.targetInstanceArn) {
    logger.info(`Rebalancing instance: ${data.targetInstanceArn}`);
    await terminateInstance(data.targetInstanceArn);
  } else {
    logger.info("No rebalancing needed");
  }
}
