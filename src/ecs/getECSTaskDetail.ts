import {DescribeTasksCommand} from "@aws-sdk/client-ecs";
import {ecsClient} from "./awsClients";
import {getConfig} from "../utils/config";

export default async function getECSTaskDetail(
  arns: string[]
) {
  const command = new DescribeTasksCommand({
    cluster: getConfig().targetClusterArn,
    tasks: arns
  })

  return ecsClient.send(
    command
  )
}