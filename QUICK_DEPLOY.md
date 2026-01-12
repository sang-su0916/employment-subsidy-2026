# 빠른 배포 가이드 - Git 없이

## 🚀 1분 안에 온라인 배포하기

---

## 방법 1: 로컬 서버 (0초) ⚡

### 현재 폴더에서 실행
```bash
# Python 사용
cd web-standalone
python3 -m http.server 8080

# 또는 Node.js
cd web-standalone
npx http-server -p 8080
```

**접속:** http://localhost:8080

**장점:**
- 즉시 실행
- 설치 불필요
- 무료

**단점:**
- 본인만 접속 가능
- 컴퓨터 끄면 중단

---

## 방법 2: Netlify Drop (30초) 🎯 **가장 쉬움!**

### 단계
1. https://app.netlify.com/drop 접속
2. `web-standalone` 폴더를 브라우저에 드래그 앤 드롭
3. **끝!**

**결과:**
```
https://random-name-12345.netlify.app
```

**장점:**
- Git 불필요
- 무료
- 공개 URL 즉시 생성
- SSL 자동 (https)

**단점:**
- 업데이트 시 다시 드래그 앤 드롭 필요

---

## 방법 3: Vercel CLI (1분)

### 설치 & 배포
```bash
# 1. Vercel CLI 설치 (한 번만)
npm install -g vercel

# 2. 배포
cd web-standalone
vercel

# 질문에 답변:
# - Set up and deploy? Yes
# - Which scope? (엔터)
# - Link to existing project? No
# - Project name? (엔터)
# - In which directory? (엔터)
```

**결과:**
```
https://your-project.vercel.app
```

**장점:**
- Git 불필요
- 무료
- 명령어 한 줄로 배포
- 자동 SSL

**단점:**
- CLI 도구 설치 필요

---

## 방법 4: GitHub Pages (Git 필요, 3분)

**Git을 배우고 싶다면** 이 방법 추천!

### 단계
```bash
# 1. Git 초기화
cd web-standalone
git init

# 2. 파일 추가
git add .
git commit -m "첫 배포"

# 3. GitHub 저장소 생성 (웹에서)
# https://github.com/new

# 4. 푸시
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main

# 5. GitHub Pages 활성화
# 저장소 Settings → Pages → Source: main branch
```

**결과:**
```
https://your-username.github.io/your-repo
```

**장점:**
- 무료
- 버전 관리
- 자동 배포 (코드 푸시하면 자동 업데이트)

**단점:**
- Git 학습 필요
- 초기 설정 복잡

---

## 🎯 추천 방법

| 상황 | 추천 |
|------|------|
| **지금 바로 테스트** | 방법 1 (로컬 서버) |
| **동료에게 공유** | 방법 2 (Netlify Drop) |
| **계속 사용할 예정** | 방법 3 (Vercel CLI) |
| **Git 배우고 싶다** | 방법 4 (GitHub Pages) |

---

## 온라인 서버 배포 (web-server 폴더)

### Vercel로 서버 배포
```bash
cd web-server
npm install
npx vercel

# 프로덕션 배포
npx vercel --prod
```

### Render로 서버 배포 (Git 필요)
1. https://render.com 가입
2. New → Web Service
3. Connect GitHub repository
4. 설정:
   - Build: `npm install`
   - Start: `npm start`

---

## ⚡ 지금 바로 시작하려면?

### 1단계: 터미널 열기

### 2단계: 명령어 복사 & 붙여넣기
```bash
cd /Users/isangsu/tmp/고용지원금-test/web-standalone
python3 -m http.server 8080
```

### 3단계: 브라우저 열기
```
http://localhost:8080
```

**완료! 🎉**

---

## 문제 해결

### "python3: command not found"
→ Node.js 사용:
```bash
npx http-server -p 8080
```

### "포트가 이미 사용 중"
→ 다른 포트 사용:
```bash
python3 -m http.server 8888
```

### "파일을 찾을 수 없음"
→ 경로 확인:
```bash
pwd
ls
```

---

**만든 날짜:** 2026-01-11
