import { ecsClient } from "./awsClients";
import { ListTasksCommand, Task } from "@aws-sdk/client-ecs";
import getECSTaskDetail from "./getECSTaskDetail";
import { getConfig } from "../utils/config";

/**
 * Get all ECS tasks in the cluster
 */
export default async function getECSTasks(): Promise<Task[]> {
  const command = new ListTasksCommand({
    cluster: getConfig().targetClusterArn,
    launchType: "EC2",
  });

  const data = await ecsClient.send(command);

  if (!data.taskArns) {
    return [];
  }

  const taskArns = data.taskArns;

  const taskDetails = await getECSTaskDetail(taskArns);

  return taskDetails.tasks ?? [];
}
