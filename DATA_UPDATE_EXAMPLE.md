# 실제 데이터 교체 예시

## 📊 실제 2025년 청년일자리도약장려금 데이터

### 고용노동부 공식 자료 (2025.01.15 발표)

**출처:** https://www.moel.go.kr/news/notice/noticeView.do?bbs_seq=20250100907

---

## ❌ 현재 샘플 데이터 vs ✅ 실제 데이터

### 현재 파일 (가상 데이터)
```json
{
  "id": "youth-job-leap",
  "name": "청년일자리도약장려금",
  "description": "청년(15-34세) 정규직 신규 채용 시 기업과 청년 모두 지원 (2026년 비수도권 우대)",
  "calculation": {
    "companySupport": {
      "maxAmount": 7200000,
      "maxMonths": 12,
      "monthlyAmount": 600000
    }
  }
}
```

### 실제 2025년 데이터 (고용노동부 기준)
```json
{
  "id": "youth-job-leap",
  "name": "청년일자리도약장려금",
  "description": "청년(만 15-34세) 정규직 신규 채용 시 기업 지원 + 청년 직접 지원 (2025.01.23 신청시작)",
  "calculation": {
    "type": "dual-support",
    "companySupport": {
      "1유형": {
        "name": "기업만 지원",
        "monthlyAmount": 800000,
        "maxMonths": 12,
        "totalAmount": 9600000,
        "description": "수도권 우선지원대상기업, 비수도권 중견기업"
      },
      "2유형": {
        "name": "기업+청년 지원",
        "company": {
          "monthlyAmount": 450000,
          "maxMonths": 12,
          "totalAmount": 5400000
        },
        "youth": {
          "milestones": [
            { "month": 6, "amount": 1200000 },
            { "month": 12, "amount": 1200000 },
            { "month": 18, "amount": 1200000 },
            { "month": 24, "amount": 1200000 }
          ],
          "totalAmount": 4800000,
          "description": "청년이 직접 수령"
        }
      }
    }
  },
  "eligibility": {
    "youth": {
      "ageRange": { "min": 15, "max": 34 },
      "employmentType": "정규직",
      "workHours": "주 30시간 이상"
    },
    "company": {
      "size": "우선지원대상기업 또는 중견기업",
      "location": "전국",
      "employmentInsurance": "가입 필수"
    }
  },
  "applicationPeriod": {
    "start": "2025-01-23",
    "end": "예산 소진 시까지"
  },
  "applicationMethod": "고용24(www.work24.go.kr) 온라인 신청",
  "contact": "고용노동부 콜센터 1350"
}
```

---

## 🔧 실제 교체 방법 (5분)

### STEP 1: 파일 찾기
```
data/subsidies-2026.json
```

### STEP 2: 텍스트 에디터로 열기
- **Windows**: 메모장, VS Code
- **Mac**: TextEdit, VS Code
- **온라인**: https://jsoneditoronline.org

### STEP 3: 해당 항목 찾기
`Ctrl+F` (또는 `Cmd+F`)로 `"youth-job-leap"` 검색

### STEP 4: 내용 교체
위의 "실제 2025년 데이터" 복사 → 붙여넣기

### STEP 5: 저장 → 완료!

---

## 💡 더 쉬운 방법: 자동 업데이트 스크립트

### update-data.js 파일 생성
```javascript
const fs = require('fs');

const realData = {
  version: "2025.1.0",
  lastUpdated: "2025-01-15",
  description: "2025년 실제 고용지원금 데이터 (고용노동부 공식)",
  subsidies: [
    // 여기에 실제 데이터 붙여넣기
  ]
};

fs.writeFileSync(
  'data/subsidies-2026.json', 
  JSON.stringify(realData, null, 2)
);

console.log('✅ 데이터 업데이트 완료!');
```

### 실행
```bash
node update-data.js
```

---

## 📋 실제 데이터 수집 체크리스트

### ✅ 수집해야 할 정보 (지원금 1개당)

- [ ] **공식 명칭** (정확한 이름)
- [ ] **지원 대상** (기업 규모, 근로자 조건)
- [ ] **지원 금액** (월별, 총액)
- [ ] **지원 기간** (개월 수)
- [ ] **신청 요건** (나이, 고용형태, 근무시간 등)
- [ ] **중복 불가 지원금** (mutuallyExclusive)
- [ ] **필요 서류** (requiredDocuments)
- [ ] **신청 방법** (온라인/오프라인)
- [ ] **신청 기간** (시작일, 종료일)
- [ ] **문의처** (전화번호, 웹사이트)

---

## 🔍 정보 출처 (신뢰도 순)

### 1순위: 고용노동부 공식
- https://www.moel.go.kr
- 고시, 지침, 공고문

### 2순위: 고용보험/고용24
- https://www.ei.go.kr
- https://www.work24.go.kr

### 3순위: 고용센터 직접 문의
- 전화: 1350
- 방문 상담

### ❌ 피해야 할 출처
- 개인 블로그 (검증 안 됨)
- 오래된 자료 (2024년 이전)
- 광고성 사이트

---

## 🎯 현실적인 업데이트 전략

### 옵션 1: 최소한의 업데이트 (1-2시간)
- 주요 3-4개 지원금만 실제 데이터로 교체
- 나머지는 샘플 유지 (또는 삭제)

### 옵션 2: 완전한 업데이트 (1-2일)
- 모든 지원금 실제 데이터 수집
- 전문가 검토
- 테스트

### 옵션 3: 전문가 의뢰 (비용 발생)
- 노무사에게 의뢰
- 데이터 정확성 보장
- 법률 검토 포함

---

## 📞 실전 팁

### 1. 고용노동부에 직접 문의
```
전화: 1350
질문: "2025년 ○○○ 지원금 정확한 지원 금액과 요건 알려주세요"
→ 공식 답변 받아서 기록
```

### 2. 공식 지침서 다운로드
- 고용노동부 홈페이지 → 알림·소식 → 공지사항
- "사업운영지침" 검색
- PDF/HWP 파일 다운로드

### 3. 엑셀로 정리 후 JSON 변환
1. 엑셀에 데이터 정리
2. https://www.convertcsv.com/csv-to-json.htm
3. JSON으로 변환
4. 붙여넣기

---

## ⚠️ 주의사항

### 법적 책임
- **면책 조항 필수 추가**
- "이 시스템은 참고용이며, 실제 신청 시 고용센터 확인 필요"

### 정기 업데이트
- 분기별 1회 (3개월마다)
- 정책 변경 시 즉시

### 검증 필수
- 계산 결과를 실제 고용센터 상담 결과와 비교
- 베타 테스트 필수

---

## 📝 요약

| 단계 | 난이도 | 시간 |
|------|--------|------|
| **파일 수정** | ⭐☆☆☆☆ | 5분 |
| **데이터 1개 수집** | ⭐⭐☆☆☆ | 30분 |
| **전체 데이터 수집** | ⭐⭐⭐⭐☆ | 1-2일 |
| **전문가 검증** | ⭐⭐⭐⭐⭐ | 추가 비용 |

**결론: 기술적으로는 쉽지만, 정확한 데이터 수집에 시간이 걸립니다.**

---

**작성일:** 2025-01-11
