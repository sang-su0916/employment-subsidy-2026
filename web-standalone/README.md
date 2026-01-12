# 2026 고용지원금 최적화 시스템 - 웹 버전

## 📌 개요

브라우저에서 바로 실행 가능한 독립형 웹 애플리케이션입니다.
서버 없이 로컬에서 실행됩니다.

---

## 🚀 사용 방법

### 방법 1: 더블클릭으로 실행 (가장 간단)

1. `index.html` 파일을 **더블클릭**
2. 기본 브라우저에서 자동으로 열립니다
3. 바로 사용 가능!

**주의**: 일부 브라우저는 로컬 파일의 CORS 정책 때문에 JSON 로드가 실패할 수 있습니다.  
이 경우 방법 2를 사용하세요.

---

### 방법 2: 로컬 서버 실행 (권장)

#### Python 3 사용
```bash
# 이 폴더에서 실행
python3 -m http.server 8080
```

#### Node.js 사용
```bash
# npx 사용 (Node.js 설치 필요)
npx http-server -p 8080
```

#### PHP 사용
```bash
php -S localhost:8080
```

그 다음 브라우저에서 접속:
- `http://localhost:8080`

---

## 📂 파일 구조

```
web-standalone/
├── index.html              # 메인 HTML 파일
├── src/                    # JavaScript 소스 코드
│   ├── data/
│   │   └── subsidies.js    # 내장 데이터 (fallback)
│   ├── logic/
│   │   ├── eligibility.js  # 자격요건 검증
│   │   └── optimizer.js    # 최적화 알고리즘
│   ├── ui/
│   │   └── renderer.js     # UI 렌더링
│   ├── utils/
│   │   ├── validators.js   # 입력 검증
│   │   └── data-loader.js  # 데이터 로더
│   └── main.js             # 메인 로직
├── data/
│   └── subsidies-2026.json # 지원금 데이터 (수정 가능)
└── README.md               # 이 파일
```

---

## 🔄 데이터 업데이트 방법

### 1단계: 데이터 파일 수정
`data/subsidies-2026.json` 파일을 텍스트 에디터로 열어서 수정합니다.

### 2단계: 브라우저 새로고침
- `Ctrl+R` (Windows/Linux)
- `Cmd+R` (Mac)

데이터가 즉시 반영됩니다!

---

## ✅ 브라우저 호환성

| 브라우저 | 지원 여부 |
|---------|----------|
| Chrome | ✅ 완벽 지원 |
| Edge | ✅ 완벽 지원 |
| Firefox | ✅ 완벽 지원 |
| Safari | ✅ 완벽 지원 |
| IE 11 | ❌ 지원 안 함 |

---

## 🌐 온라인 배포

### GitHub Pages
1. GitHub 저장소 생성
2. 이 폴더 내용 업로드
3. Settings → Pages → Source: main branch
4. 공개 URL로 접속 가능

### Netlify
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 배포
netlify deploy --dir=. --prod
```

### Vercel
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

---

## 🔧 커스터마이징

### 색상 변경
`index.html` 파일의 `<style>` 섹션에서:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 로고/제목 변경
```html
<h1>🎯 2026 고용지원금 최적화 시스템</h1>
```

---

## 📱 모바일 지원

- 반응형 디자인으로 모바일/태블릿에서도 완벽하게 작동
- 터치 인터페이스 지원
- 작은 화면에 최적화

---

## ⚠️ 주의사항

1. **인터넷 연결 불필요**: 완전히 오프라인에서 작동
2. **데이터 보안**: 모든 계산이 브라우저 내에서만 수행됨 (서버 전송 없음)
3. **파일 경로**: 폴더 구조를 유지해야 정상 작동

---

## 🆚 데스크톱 앱 vs 웹 버전

| 기능 | 데스크톱 앱 (.exe/.app) | 웹 버전 |
|------|------------------------|---------|
| 설치 | 필요 | 불필요 |
| 실행 | 독립 실행 | 브라우저 필요 |
| 데이터 업데이트 | GUI 버튼 | 파일 수정 |
| 배포 | 파일 공유 | URL 공유 가능 |
| 성능 | 빠름 | 빠름 |

---

## 📞 문의

- 고용노동부 콜센터: **1350**
- 고용보험: https://www.ei.go.kr

---

**버전**: 1.0.0 (웹 버전)  
**최종 업데이트**: 2026-01-11
