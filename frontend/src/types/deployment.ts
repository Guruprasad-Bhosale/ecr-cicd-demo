export type Status =
  | 'PASSED'
  | 'RUNNING'
  | 'BLOCKED'
  | 'FAILED'
  | 'NOT_EXECUTED'
  | 'ACTIVE'
  | 'PROVISIONING_REQUIRED';

export interface PipelineStage {
  id: string;
  name: string;
  jobName: string;
  trigger: string;
  dependency?: string;
  purpose: string;
  status: Status;
  statusDetails: string;
  iconType: 'test' | 'build' | 'oidc' | 'ecr' | 'ecs' | 'stability' | 'alb';
  executionTime?: string;
}

export interface AwsResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: Status;
  statusMessage: string;
  details: {
    label: string;
    value: string;
  }[];
}

export interface DeploymentStep {
  name: string;
  status: Status;
  timestamp: string;
  duration: string;
  details: string;
}

export interface Deployment {
  id: string;
  commitSha: string;
  shortSha: string;
  commitMessage: string;
  branch: string;
  imageUri: string;
  imageTag: string;
  imageDigest: string;
  environment: string;
  status: Status;
  reason?: string;
  startedAt: string;
  duration: string;
  steps: DeploymentStep[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: 'pipeline' | 'docker' | 'ecr' | 'ecs' | 'terraform' | 'alb';
  message: string;
}

export interface ProjectConfig {
  projectName: string;
  projectTagline: string;
  repository: string;
  branch: string;
  commitSha: string;
  shortSha: string;
  awsAccount: string;
  awsRegion: string;
  ecrRepository: string;
  ecsCluster: string;
  ecsService: string;
  containerName: string;
  containerPort: number;
  containerUser: string;
  authMethod: string;
  albName: string;
  healthCheckPath: string;
}
