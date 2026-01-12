# 고용지원금 데이터 업데이트 가이드

## 📌 개요

2026 고용지원금 최적화 시스템은 정부의 고용지원금 정책이 변경될 때 쉽게 데이터를 업데이트할 수 있도록 설계되었습니다.

---

## 🔄 업데이트 방법

### 방법 1: 프로그램 내부에서 업데이트 (권장)

#### 1단계: 새로운 데이터 파일 준비
- `data/subsidies-2026.json` 파일을 복사하여 수정하거나
- 새로운 JSON 파일을 작성합니다

#### 2단계: 프로그램에서 업데이트
1. 프로그램 실행
2. 상단 헤더에서 **"📥 데이터 업데이트"** 버튼 클릭
3. 수정한 JSON 파일 선택
4. 성공 메시지 확인
5. **프로그램 재시작**

✅ **완료!** 새로운 데이터가 적용됩니다.

---

### 방법 2: 수동으로 파일 교체

#### Windows 사용자
1. `C:\Users\[사용자명]\AppData\Roaming\employment-subsidy-optimizer\data\` 폴더로 이동
2. `subsidies-2026.json` 파일을 새로운 파일로 교체
3. 프로그램 재시작

#### Mac 사용자
1. `~/Library/Application Support/employment-subsidy-optimizer/data/` 폴더로 이동
2. `subsidies-2026.json` 파일을 새로운 파일로 교체
3. 프로그램 재시작

---

## 📝 JSON 데이터 형식

### 전체 구조
```json
{
  "version": "2026.1.0",
  "lastUpdated": "2026-01-11",
  "description": "2026년 고용지원금 데이터",
  "subsidies": [ /* 지원금 배열 */ ],
  "companySizeCategories": { /* 기업 규모 분류 */ },
  "industryTypes": [ /* 업종 목록 */ ]
}
```

### 지원금 항목 예시
```json
{
  "id": "youth-job-leap",
  "name": "청년일자리도약장려금",
  "category": "청년고용",
  "description": "청년(15-34세) 정규직 신규 채용 시 지원",
  "eligibility": {
    "minEmployees": 5,
    "maxEmployees": null,
    "industryExclusions": [],
    "requiredEmployeeTypes": ["청년"],
    "minEmploymentPeriod": 6,
    "employeeAgeRange": { "min": 15, "max": 34 }
  },
  "calculation": {
    "type": "per-employee-monthly",
    "baseAmount": 600000,
    "maxMonths": 12,
    "monthlyAmount": 600000
  },
  "mutuallyExclusive": ["youth-intern"],
  "requiredDocuments": [
    "고용보험 피보험자격 취득신고서",
    "임금대장",
    "근로계약서"
  ],
  "notes": "6개월 이상 계속 근무 시 지원"
}
```

---

## ⚙️ 필드 설명

### 기본 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 식별자 (영문, 숫자, 하이픈만 사용) |
| `name` | string | 지원금 이름 |
| `category` | string | 카테고리 (청년고용, 고령자고용, 장애인고용 등) |
| `description` | string | 간단한 설명 |

### 자격요건 (`eligibility`)
| 필드 | 타입 | 설명 |
|------|------|------|
| `minEmployees` | number/null | 최소 근로자 수 |
| `maxEmployees` | number/null | 최대 근로자 수 |
| `requiredEmployeeTypes` | array | 필수 근로자 유형 (`["청년"]`, `["고령자"]`, `["장애인"]`) |
| `minEmploymentPeriod` | number | 최소 고용 기간 (개월) |
| `employeeAgeRange` | object | 연령 범위 `{min: 15, max: 34}` |
| `maxWage` | number | 최대 급여 제한 |

### 계산 방식 (`calculation`)

#### 월별 지급 (`per-employee-monthly`)
```json
{
  "type": "per-employee-monthly",
  "baseAmount": 600000,
  "maxMonths": 12,
  "monthlyAmount": 600000
}
```

#### 분기별 지급 (`per-employee-quarterly`)
```json
{
  "type": "per-employee-quarterly",
  "baseAmount": 2700000,
  "maxQuarters": 8,
  "quarterlyAmount": 2700000
}
```

#### 임금 보전 (`wage-compensation`)
```json
{
  "type": "wage-compensation",
  "conditions": [
    {
      "companySize": "우선지원대상기업",
      "compensationRate": 0.90,
      "maxDailyAmount": 66000
    }
  ],
  "maxDays": 180
}
```

---

## ✅ 데이터 검증 체크리스트

업데이트 전에 다음을 확인하세요:

- [ ] JSON 문법이 올바른가? ([JSON 검증기](https://jsonlint.com/) 사용)
- [ ] `version` 필드가 업데이트되었는가?
- [ ] `lastUpdated` 날짜가 정확한가?
- [ ] 모든 `id`가 고유한가?
- [ ] `mutuallyExclusive`에 참조된 id가 실제로 존재하는가?
- [ ] `requiredEmployeeTypes`가 올바른 값(`청년`, `고령자`, `장애인`)인가?
- [ ] 금액 필드가 숫자형(number)인가? (문자열 아님)

---

## 🔍 업데이트 예시

### 예시 1: 지원 금액 변경
**변경 전:**
```json
{
  "id": "youth-job-leap",
  "calculation": {
    "baseAmount": 600000,
    "monthlyAmount": 600000
  }
}
```

**변경 후:**
```json
{
  "id": "youth-job-leap",
  "calculation": {
    "baseAmount": 700000,
    "monthlyAmount": 700000
  }
}
```

### 예시 2: 새로운 지원금 추가
```json
{
  "subsidies": [
    /* 기존 지원금들... */
    {
      "id": "new-subsidy-2027",
      "name": "신규 청년 고용 지원금",
      "category": "청년고용",
      "description": "2027년 신설 청년 고용 지원 프로그램",
      "eligibility": {
        "minEmployees": 1,
        "maxEmployees": null,
        "requiredEmployeeTypes": ["청년"],
        "minEmploymentPeriod": 3,
        "employeeAgeRange": { "min": 18, "max": 29 }
      },
      "calculation": {
        "type": "per-employee-monthly",
        "baseAmount": 500000,
        "maxMonths": 12,
        "monthlyAmount": 500000
      },
      "mutuallyExclusive": [],
      "requiredDocuments": [
        "고용보험 피보험자격 취득신고서",
        "근로계약서"
      ],
      "notes": "2027년 신설"
    }
  ]
}
```

### 예시 3: 버전 관리
```json
{
  "version": "2026.2.0",
  "lastUpdated": "2026-06-15",
  "description": "2026년 6월 개정 고용지원금 데이터 (청년일자리도약장려금 금액 인상)"
}
```

---

## 🚨 문제 해결

### Q: 데이터 업데이트 후 프로그램이 작동하지 않아요
**A:** JSON 문법 오류일 가능성이 높습니다.
1. [JSONLint](https://jsonlint.com/)에서 파일을 검증하세요
2. 쉼표(,), 중괄호({}), 대괄호([]) 등이 올바른지 확인하세요
3. 문제가 계속되면 원본 `data/subsidies-2026.json`으로 복원하세요

### Q: 업데이트 버튼이 보이지 않아요
**A:** 
- 웹 브라우저에서 index.html을 직접 열었을 경우 버튼이 나타나지 않습니다
- .exe 파일로 실행해야 업데이트 버튼이 표시됩니다
- 브라우저 버전은 수동 업데이트 방법을 사용하세요

### Q: 데이터 파일 위치를 모르겠어요
**A:** 
- Windows: `Win+R` → `%APPDATA%\employment-subsidy-optimizer\data` 입력
- Mac: Finder → `이동` → `폴더로 이동` → `~/Library/Application Support/employment-subsidy-optimizer/data` 입력

### Q: 여러 버전의 데이터를 관리하고 싶어요
**A:**
```
my-data-files/
├── subsidies-2026-v1.json   (1월 버전)
├── subsidies-2026-v2.json   (6월 개정)
└── subsidies-2027.json      (2027년 데이터)
```
이렇게 백업 폴더를 만들어 관리하세요.

---

## 📅 권장 업데이트 주기

- **정기 점검**: 분기별 (3개월마다)
- **정책 변경 시**: 고용노동부 공지 후 즉시
- **신규 지원금**: 발표 즉시 추가

---

## 🔗 참고 자료

- [고용노동부 홈페이지](https://www.moel.go.kr)
- [고용보험 홈페이지](https://www.ei.go.kr)
- [워크넷](https://www.work.go.kr)

---

## 📞 문의

업데이트 중 문제가 발생하면:
- 고용노동부 콜센터: **1350**
- 프로그램 기술지원: 개발팀 연락처

---

**마지막 업데이트:** 2026-01-11  
**문서 버전:** 1.0.0
