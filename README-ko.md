# ECS Instance Balancer

이 프로젝트는 AWS의 ECS (Elastic Container Service) 인스턴스 밸런싱을 자동화하는 솔루션을 제공합니다. 리소스 사용률을 모니터링하고 필요할 때 인스턴스를 재밸런싱하여 최적의 리소스 활용을 도와줍니다.

## 설정

애플리케이션은 다음과 같은 구조의 `config.json` 파일을 사용합니다:

```json
{
  "region": "ap-northeast-2",
  "targetClusterArn": "arn:aws:ecs:ap-northeast-2:261215343239:cluster/iloa-cluster",
  "capacityProvider": "EC2",
  "autoScalingGroupName": "iloa-cluster-ecs-asg"
}
```

### 설정 파라미터

- `region`: ECS 클러스터가 위치한 AWS 리전
- `targetClusterArn`: 모니터링할 ECS 클러스터의 ARN
- `capacityProvider`: 용량 제공자 유형 (EC2 또는 FARGATE)
- `autoScalingGroupName`: 클러스터와 연결된 Auto Scaling Group의 이름

## 밸런싱 프로세스

밸런서는 다음과 같은 단계로 인스턴스 분포를 최적화합니다:

1. **인스턴스 탐색**: 대상 클러스터의 모든 ECS 인스턴스를 검색
2. **태스크 분석**: 실행 중인 모든 태스크에 대한 정보 수집
3. **리소스 계산**:
   - 각 인스턴스의 리소스 사용량 계산
   - 리소스 활용률을 기반으로 재밸런싱 필요 여부 결정
4. **인스턴스 종료**: 재밸런싱이 필요한 경우 대상 인스턴스 종료
   - Auto Scaling Group이 자동으로 새 인스턴스를 시작
   - ECS가 새 인스턴스에 태스크를 재분배

## 설치

```bash
pnpm install
```

## 사용 방법

```bash
pnpm start
```

## 개발 환경

이 프로젝트는 TypeScript로 작성되었으며 다음을 사용합니다:

- ECS와 상호작용하기 위한 AWS SDK
- Node.js 런타임 환경
- pnpm 패키지 매니저

## 라이선스

MIT
