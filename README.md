# ECS Instance Balancer

This project provides an automated solution for balancing ECS (Elastic Container Service) instances in AWS. It helps optimize resource utilization by monitoring and rebalancing instances when necessary.

## Configuration

The application uses a `config.json` file with the following structure:

```json
{
  "region": "<region>",
  "targetClusterArn": "arn:aws:ecs:<region>:<user-id>:cluster/<cluster-name>",
  "capacityProvider": "EC2",
  "autoScalingGroupName": "<asg-name>"
}
```

### Configuration Parameters

- `region`: AWS region where your ECS cluster is located
- `targetClusterArn`: ARN of the ECS cluster to monitor
- `capacityProvider`: Type of capacity provider (EC2 or FARGATE)
- `autoScalingGroupName`: Name of the Auto Scaling Group associated with the cluster

## Balancing Process

The balancer follows these steps to optimize instance distribution:

1. **Instance Discovery**: Retrieves all ECS instances in the target cluster
2. **Task Analysis**: Gathers information about all running tasks
3. **Resource Calculation**:
   - Calculates resource usage for each instance
   - Determines if rebalancing is needed based on resource utilization
4. **Instance Termination**: If rebalancing is required, terminates the target instance
   - The Auto Scaling Group will automatically launch a new instance
   - ECS will redistribute tasks to the new instance

## Installation

```bash
pnpm install
```

## Usage

1. Copy `config.json.example` to `config.json`:

```bash
cp config.json.example config.json
```

2. Edit `config.json` with your AWS ECS cluster details:

```json
{
  "region": "your-aws-region",
  "targetClusterArn": "your-ecs-cluster-arn",
  "capacityProvider": "EC2",
  "autoScalingGroupName": "your-asg-name"
}
```

3. Start the balancer:

```bash
pnpm start
```

## Development

This project is written in TypeScript and uses:

- AWS SDK for interacting with ECS
- Node.js runtime environment
- pnpm as the package manager

## License

MIT
