import { ContainerInstance, DescribeContainerInstancesCommand, ListContainerInstancesCommand } from "@aws-sdk/client-ecs";
import { ecsClient } from "./awsClients";
import { getConfig } from "../utils/config";
import invariant from "tiny-invariant";

export default async function getECSInstances(): Promise<ContainerInstance[]> {
  const getContainerInstancesCommand = new ListContainerInstancesCommand({
    cluster: getConfig().targetClusterArn,
  });

  const containerInstances = await ecsClient.send(getContainerInstancesCommand);

  invariant(containerInstances.containerInstanceArns, "No container instances found");

  const describeContainerInstancesCommand = new DescribeContainerInstancesCommand({
    cluster: getConfig().targetClusterArn,
    containerInstances: containerInstances.containerInstanceArns,
  });

  const containerInstancesDetail = await ecsClient.send(describeContainerInstancesCommand);

  invariant(containerInstancesDetail.containerInstances, "No container instances found");

  return containerInstancesDetail.containerInstances.filter((instance) => instance.status === "ACTIVE");
}
