---
description: 핫플레이스 매거진(magazine_posts) 생성·수정 — 전담 에이전트로 위임
argument-hint: "[주제/개수/시즌 예: 초여름 카페 매거진 3개]"
---

petswgwon 핫플레이스 매거진 작업을 시작한다. 아래 요청을 **`magazine-author` 서브에이전트**에 위임하라 (Agent 도구, subagent_type: "magazine-author").

사용자 요청: $ARGUMENTS

위임 시 에이전트에 전달할 것:
- 표준 기준은 `docs/magazine-authoring-guide.md` 이며 반드시 그 양식을 따른다.
- 추천 장소는 `places` 테이블에 등록된 장소만, 본문은 가이드의 절대 규칙(리스트 내 볼드 금지·가로형 이미지·`/api/image` 프록시 경로)을 지킨다.
- 프로덕션 DB에 직접 쓰기 전, 주제·추천 장소 목록을 요약해 사용자에게 확인받는다(요청에 "바로 만들어"가 명시된 경우는 생략 가능).
- 생성 후 `/api/magazine/posts` 노출과 라이브 렌더(이미지 크기·literal `**` 없음)를 검증하고, 결과를 표로 보고한다.

요청이 비어 있거나 모호하면(`$ARGUMENTS`가 없음) 현재 시즌과 기존 매거진을 확인해 주제 후보를 제안하고 개수를 사용자에게 확인한 뒤 진행한다.
