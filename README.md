# Node.js환경 CLI 로그라이크

## CLI 텍스트 기반 로그라이크 게임

- how to play? : type "node server.js" to run the game

### 필수구현

#### 완료한 필수구현 사항
- Player 클래스, Monster 클래스를 통한 stat 관리
- 턴제 진행
- 스테이지 비례 점진적 몬스터 스탯 증가
- 공격, 피격, 사망 구현
- 플레이어 선택지 : [공격]
- 몬스터 랜덤 선택지 : [공격]

#### 아직 미완료한 필수구현 사항
- 스테이지 클리어 시 일정 체력 회복

### 추가구현 (예정)
- 선택지 : [반격] : 반격 액션 이후 상대의 공격 시, 절반의 데미지 경감 + 1.5배의 플레이어 공격 / 상대의 액션이 공격이 아닐 시, 아무런 영향 없음
- 선택지 : [방어] : 
- 상태 이상 : [스턴] : 1개의 턴 동안 액션을 할 수 없음
- 상태 이상 : [피해망상] : 피격시 일정 배수 혹은 일정 수치만큼 추가 피해를 받음
- 몬스터의 종류 추가
- 특정 스테이지에는 보스 몬스터

#### 무기 장비 시스템

- [무기]를 착용함에 영향을 받는다.

- 시작 시 기본 무기 [낡은 장검]을 장착한다. 내구도 100/100 + DMG 10

- 무기 손질 시스템:
무기의 내구도를 정한다. 100/100
공격을 진행할 때마다 5-10 내구도 경감
내구도에 비례하여 dmg가 계산된다. 
내구도를 회복하기 위해서는, 선택지 [무기 손질]을 통해 내구도 회복을 시도해야 한다.

ex. 기본 dmg 10, 내구도 100 시작 => 초기 데미지 계산 10 * (100/100) = 10
기본 dmg 10, 내구도 72 => 데미지 계산 10 * (72/100) = 7.2 => 7 (소수한자리 반올림)

- 몬스터 처치 시, 일정 확률로 무기를 드랍한다. 무기 드랍 시, 유저는 무기를 교체할 지 선택할 수 있다.

- 무기 종류
- - [암살자의 대거] 내구도 75/75 + DMG 8 : 공격 시 2회 타격
- - [기사의 양날검] 내구도 100/100 + DMG 16
- - [아이언메이스] 내구도 60/60 + DMG 30 : 일정확률로 상대에게 상태이상 [스턴]을 부여
- - [롱기누스] 내구도 100/100 + DMG 18 : 방어 무시

#### 작업 메모

플레이어 공격 구현 / 에러 메시지 로깅 관련 편의성 구현