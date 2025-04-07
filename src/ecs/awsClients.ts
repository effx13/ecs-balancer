import { ECSClient } from "@aws-sdk/client-ecs";
import { AutoScalingClient } from "@aws-sdk/client-auto-scaling";
import { getConfig } from "../utils/config";
import { EC2Client } from "@aws-sdk/client-ec2";

const ecsClient = new ECSClient({
  region: getConfig().region,
});

const ec2Client = new EC2Client({
  region: getConfig().region,
});

const asgClient = new AutoScalingClient({
  region: getConfig().region,
});

export { ecsClient, ec2Client, asgClient };
