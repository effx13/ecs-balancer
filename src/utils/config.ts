import invariant from "tiny-invariant";
import { EBConfig } from "../types/EBConfig";
import { readFileSync } from "fs";
import logger from "./logger";

function readFromConfigFile(): EBConfig {
  const data = readFileSync(`${process.cwd()}/config.json`, "utf-8");

  try {
    return JSON.parse(data) as EBConfig;
  } catch (e) {
    throw new Error("Invalid config file");
  }
}

export function setUpEnvironment() {
  const { region, targetClusterArn, capacityProvider, autoScalingGroupName, debug } = readFromConfigFile();

  invariant(region, "region must be set");
  invariant(targetClusterArn, "targetClusterArn must be set");
  invariant(capacityProvider, "capacityProvider must be set");
  invariant(autoScalingGroupName, "autoScalingGroupName must be set");

  if (debug) {
    logger.level = "debug";
  }
}

export function getConfig(): EBConfig {
  return readFromConfigFile();
}
