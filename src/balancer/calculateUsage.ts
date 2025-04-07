import { ContainerInstance, Task } from "@aws-sdk/client-ecs";
import invariant from "tiny-invariant";

interface InstanceResource {
  arn: string;
  maximumCpu: number;
  currentCpu: number;
  maximumMemory: number;
  currentMemory: number;
}

export function getInstanceResource(instance: ContainerInstance): InstanceResource {
  invariant(instance.registeredResources, "No registered resources found");
  invariant(instance.remainingResources, "No remaining resources found");
  invariant(instance.containerInstanceArn, "No container instance ARN found");

  const registeredCPU = instance.registeredResources.find((resource) => resource.name === "CPU");

  invariant(registeredCPU, "No CPU resource found");
  invariant(typeof registeredCPU.integerValue === "number", "No CPU integer value found");

  const remainingCPU = instance.remainingResources?.find((resource) => resource.name === "CPU");

  invariant(remainingCPU, "No remaining CPU resource found");
  invariant(typeof remainingCPU.integerValue === "number", "No remaining CPU integer value found");

  const registeredMemory = instance.registeredResources.find((resource) => resource.name === "MEMORY");

  invariant(registeredMemory, "No MEMORY resource found");
  invariant(typeof registeredMemory.integerValue === "number", "No MEMORY integer value found");

  const remainingMemory = instance.remainingResources?.find((resource) => resource.name === "MEMORY");

  invariant(remainingMemory, "No remaining MEMORY resource found");
  invariant(typeof remainingMemory.integerValue === "number", "No remaining MEMORY integer value found");

  const tasks = instance.registeredResources.filter((resource) => resource.name === "CPU" || resource.name === "MEMORY");

  return {
    arn: instance.containerInstanceArn,
    maximumCpu: registeredCPU.integerValue,
    currentCpu: registeredCPU.integerValue - remainingCPU.integerValue,
    maximumMemory: registeredMemory.integerValue,
    currentMemory: registeredMemory.integerValue - remainingMemory.integerValue,
  };
}

export interface ReBalanceInstance {
  canReBalance: boolean;
  targetInstanceArn?: string;
}

export function canReBalance(instanceResources: InstanceResource[], tasks: Task[]): ReBalanceInstance {
  console.log("\n=== Starting Rebalancing Check ===");
  console.log(`Total instances: ${instanceResources.length}`);

  // First check if there are any instances with 0% CPU usage
  const zeroCpuInstances = instanceResources.filter((resource) => resource.currentCpu === 0);

  if (zeroCpuInstances.length > 0) {
    // Select one of the instances with 0% CPU usage
    const targetInstance = zeroCpuInstances[0];
    console.log("\nFound instance with zero CPU usage:");
    console.log(`Instance ARN: ${targetInstance.arn}`);
    console.log(`Current CPU: ${targetInstance.currentCpu}`);
    console.log(`Current Memory: ${targetInstance.currentMemory}`);
    console.log("This instance can be terminated as it has no running tasks.");

    return {
      canReBalance: true,
      targetInstanceArn: targetInstance.arn,
    };
  }

  // Find the instance with the lowest CPU usage among non-zero instances
  const sortedResources = instanceResources.sort((a, b) => {
    return a.currentCpu - b.currentCpu;
  });
  const targetInstance = sortedResources[0];

  console.log("\nSelected target instance with lowest CPU usage:");
  console.log(`Instance ARN: ${targetInstance.arn}`);
  console.log(`Current CPU: ${targetInstance.currentCpu}`);
  console.log(`Current Memory: ${targetInstance.currentMemory}`);

  const remainingResources = instanceResources.filter((resource) => resource.arn !== targetInstance.arn);
  console.log(`\nRemaining instances: ${remainingResources.length}`);

  const targetInstanceTasks = tasks.filter((task) => task.containerInstanceArn === targetInstance.arn);
  console.log(`Tasks running on target instance: ${targetInstanceTasks.length}`);

  if (targetInstanceTasks.length === 0) {
    console.log("No tasks found on target instance. Cannot rebalance.");
    return { canReBalance: false };
  }

  // Check if each task can be placed on the remaining instances
  const taskAssignments = new Map<string, string>(); // Maps taskArn to targetInstanceArn
  const remainingResourcesCopy = remainingResources.map((resource) => ({
    ...resource,
    availableCpu: resource.maximumCpu - resource.currentCpu,
    availableMemory: resource.maximumMemory - resource.currentMemory,
  }));

  for (const task of targetInstanceTasks) {
    invariant(task.cpu, "No CPU value found");
    invariant(task.memory, "No memory value found");
    invariant(task.taskArn, "No task ARN found");

    const taskCpu = parseInt(task.cpu, 10);
    const taskMemory = parseInt(task.memory, 10);

    console.log(`\nChecking task ${task.taskArn}:`);
    console.log(`Required CPU: ${taskCpu}, Required Memory: ${taskMemory}`);

    let taskAssigned = false;
    for (const resource of remainingResourcesCopy) {
      if (resource.availableCpu >= taskCpu && resource.availableMemory >= taskMemory) {
        // Place the task on this instance
        resource.availableCpu -= taskCpu;
        resource.availableMemory -= taskMemory;
        taskAssignments.set(task.taskArn, resource.arn);
        taskAssigned = true;

        console.log(`Task can be assigned to instance ${resource.arn}`);
        console.log(`Available CPU: ${resource.availableCpu}, Available Memory: ${resource.availableMemory}`);
        break;
      }
    }

    if (!taskAssigned) {
      console.log("No suitable instance found for this task");
      return { canReBalance: false };
    }
  }

  console.log("\nAll tasks can be redistributed!");
  console.log("Task assignments:");
  for (const [taskArn, instanceArn] of taskAssignments) {
    console.log(`Task ${taskArn} -> Instance ${instanceArn}`);
  }

  return {
    canReBalance: true,
    targetInstanceArn: targetInstance.arn,
  };
}
