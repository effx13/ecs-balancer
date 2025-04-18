import { TerminateInstanceInAutoScalingGroupCommand } from "@aws-sdk/client-auto-scaling";
import { DeregisterContainerInstanceCommand, DescribeContainerInstancesCommand, UpdateContainerInstancesStateCommand } from "@aws-sdk/client-ecs";
import { asgClient, ecsClient } from "../ecs/awsClients";
import { getConfig } from "../utils/config";
import logger from "../utils/logger";

export default async function terminateInstance(arn: string) {
  const command = new DescribeContainerInstancesCommand({
    cluster: getConfig().targetClusterArn,
    containerInstances: [arn],
  });

  const instanceData = await ecsClient.send(command);

  const instance = instanceData.containerInstances?.find((instance) => instance.containerInstanceArn === arn);

  if (!instance) {
    return;
  }

  const drainCommand = new UpdateContainerInstancesStateCommand({
    cluster: getConfig().targetClusterArn,
    containerInstances: [arn],
    status: "DRAINING",
  });

  await ecsClient.send(drainCommand);

  while (true) {
    const isDrained = await checkIsDrained(arn);

    if (isDrained) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  const deregisterCommand = new DeregisterContainerInstanceCommand({
    containerInstance: arn,
    cluster: getConfig().targetClusterArn,
  });

  await ecsClient.send(deregisterCommand);

  if (instance.ec2InstanceId) {
    const terminateCommand = new TerminateInstanceInAutoScalingGroupCommand({
      InstanceId: instance.ec2InstanceId,
      ShouldDecrementDesiredCapacity: true,
    });

    await asgClient.send(terminateCommand);
  }

  logger.debug("Instance termination process", {
    instanceId: arn,
    status: "terminated",
  });
}

async function checkIsDrained(arn: string): Promise<boolean> {
  const command = new DescribeContainerInstancesCommand({
    cluster: getConfig().targetClusterArn,
    containerInstances: [arn],
  });

  const data = await ecsClient.send(command);

  const targetInstance = data.containerInstances?.find((instance) => instance.containerInstanceArn === arn);

  if (!targetInstance) {
    // If the instance doesn't exist, consider the drain as completed
    return true;
  }

  return targetInstance.runningTasksCount === 0;
}
