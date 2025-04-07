export interface EBConfig {
  region: string;
  targetClusterArn: string;
  capacityProvider: string;
  autoScalingGroupName: string;
  debug?: boolean;
}
