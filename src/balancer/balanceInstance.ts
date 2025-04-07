import getECSTasks from "../ecs/getECSTasks";
import { canReBalance, getInstanceResource } from "./calculateUsage";
import getECSInstances from "../ecs/getECSInstances";
import terminateInstance from "./terminateInstance";

export default async function balanceInstance() {
  const instances = await getECSInstances();

  const tasks = await getECSTasks();

  const instanceResources = await Promise.all(
    instances.map(async (instance) => {
      return getInstanceResource(instance);
    })
  );

  const data = canReBalance(instanceResources, tasks);

  if (data.canReBalance && data.targetInstanceArn) {
    console.log(`Rebalancing instance: ${data.targetInstanceArn}`);
    await terminateInstance(data.targetInstanceArn);
  } else {
    console.log("No rebalancing needed");
  }
}
