# 배포 가이드 - 모든 플랫폼

## 📦 생성된 파일 목록

```
고용지원금-test/
├── dist/
│   ├── 2026 고용지원금 최적화 Setup 1.0.0.exe        # Windows 설치 파일 (73MB)
│   └── 2026 고용지원금 최적화-1.0.0-arm64.dmg         # Mac 설치 파일 (ARM64)
├── web-standalone/                                      # 브라우저용 독립 웹앱
│   ├── index.html
│   ├── src/
│   ├── data/
│   └── README.md
└── web-server/                                          # 온라인 웹 서버
    ├── server.js
    ├── package.json
    ├── public/
    └── README.md
```

---

## 🖥️ 1. Windows 데스크톱 앱

### 파일
- `dist/2026 고용지원금 최적화 Setup 1.0.0.exe`

### 배포 방법
1. **직접 공유**
   - .exe 파일을 USB, 이메일, 파일 공유 서비스로 전달
   - 사용자가 더블클릭하여 설치

2. **네트워크 드라이브**
   - 회사 공유 폴더에 업로드
   - 직원들이 접근하여 설치

3. **다운로드 링크**
   - Google Drive, Dropbox, OneDrive 업로드
   - 공유 링크 배포

### 사용자 설치
1. .exe 파일 더블클릭
2. 설치 마법사 따라가기
3. 바탕화면 또는 시작 메뉴에서 실행

### 데이터 업데이트
- 프로그램 내 "📥 데이터 업데이트" 버튼 사용
- 또는 `%APPDATA%\employment-subsidy-optimizer\data\subsidies-2026.json` 교체

---

## 🍎 2. Mac 데스크톱 앱

### 파일
- `dist/2026 고용지원금 최적화-1.0.0-arm64.dmg`

### 배포 방법
1. **직접 공유**
   - .dmg 파일 공유
   - M1/M2/M3 Mac에서만 작동

2. **Intel Mac용 추가 빌드** (필요시)
   ```bash
   npm run build:mac
   # 또는 특정 아키텍처
   electron-builder --mac --x64
   ```

### 사용자 설치
1. .dmg 파일 더블클릭
2. 앱을 Applications 폴더로 드래그
3. Applications에서 실행

### 주의사항
- **코드 서명 없음**: "확인되지 않은 개발자" 경고 발생
- 해결: `시스템 환경설정` → `보안 및 개인정보 보호` → `확인 없이 열기`

### 데이터 업데이트
- 프로그램 내 "📥 데이터 업데이트" 버튼 사용
- 또는 `~/Library/Application Support/employment-subsidy-optimizer/data/subsidies-2026.json` 교체

---

## 🌐 3. 브라우저용 독립 웹앱

### 파일
- `web-standalone/` 전체 폴더

### 배포 방법

#### A. 로컬 네트워크 공유
```bash
cd web-standalone
python3 -m http.server 8080
# 또는
npx http-server -p 8080
```
→ `http://192.168.x.x:8080` 형태로 접속

#### B. GitHub Pages (무료 호스팅)
1. GitHub 저장소 생성
2. `web-standalone/` 내용 업로드
3. Settings → Pages → Source: main branch
4. 공개 URL로 접속 가능

**단계별:**
```bash
cd web-standalone
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### C. Netlify Drop (가장 간단)
1. [Netlify Drop](https://app.netlify.com/drop) 접속
2. `web-standalone/` 폴더 드래그 앤 드롭
3. 즉시 배포 완료!
4. 공개 URL 제공: `https://random-name.netlify.app`

#### D. Vercel (추천)
```bash
cd web-standalone
npx vercel
# 질문에 답변
# 배포 완료 후 URL 제공
```

#### E. Cloudflare Pages
1. Cloudflare 계정 생성
2. Pages → Create a project
3. `web-standalone/` 업로드
4. 배포 완료

### 사용 방법
- 브라우저에서 URL 열기
- 북마크 저장하여 재사용
- 모든 기기(PC, 태블릿, 스마트폰)에서 접속 가능

### 데이터 업데이트
- `data/subsidies-2026.json` 파일 수정
- 재배포 (GitHub Pages, Netlify 등)

---

## 🖧 4. 온라인 웹 서버

### 파일
- `web-server/` 전체 폴더

### 배포 방법

#### A. Vercel (무료, 가장 쉬움)
```bash
cd web-server
npm install
npx vercel
# 로그인 → 프로젝트 설정 → 배포
```

**프로덕션 배포:**
```bash
npx vercel --prod
```

**결과:**
```
https://your-app.vercel.app
```

#### B. Render (무료)
1. [Render.com](https://render.com) 가입
2. New → Web Service
3. GitHub 저장소 연결
4. 설정:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Create Web Service

**결과:**
```
https://your-app.onrender.com
```

#### C. Railway (무료 크레딧 제공)
```bash
npm install -g @railway/cli
cd web-server
railway login
railway init
railway up
railway domain
```

#### D. 직접 서버 (VPS, AWS, GCP 등)
```bash
# 서버에 접속
ssh user@your-server.com

# Node.js 설치 확인
node --version

# 파일 업로드 (FTP, SCP 등)
scp -r web-server/ user@your-server.com:/var/www/

# 서버에서 실행
cd /var/www/web-server
npm install
npm start
```

**PM2로 백그라운드 실행:**
```bash
npm install -g pm2
pm2 start server.js --name "subsidy-app"
pm2 save
pm2 startup
```

**Nginx 리버스 프록시 설정:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### API 사용
```bash
# 버전 확인
curl https://your-app.com/api/version

# 데이터 가져오기
curl https://your-app.com/api/subsidies

# 데이터 업데이트
curl -X POST https://your-app.com/api/update-data \
  -H "Content-Type: application/json" \
  -d @new-data.json
```

---

## 📊 플랫폼 비교

| 플랫폼 | 장점 | 단점 | 사용 케이스 |
|--------|------|------|-------------|
| **Windows .exe** | 설치 쉬움, 오프라인 작동 | Windows만 지원 | 회사 내부 배포 |
| **Mac .dmg** | 네이티브 앱, 오프라인 | Mac만 지원 | Mac 사용자 |
| **브라우저 웹앱** | 모든 OS 지원, 설치 불필요 | 데이터 업데이트 수동 | 간단한 배포 |
| **온라인 서버** | 중앙 관리, 자동 업데이트 | 서버 필요 | 대규모 배포 |

---

## 🔄 업데이트 전략

### 데스크톱 앱 (.exe/.dmg)
1. **프로그램 재배포**
   - 새 버전 빌드
   - 사용자에게 새 설치 파일 배포

2. **데이터만 업데이트**
   - 사용자가 "📥 데이터 업데이트" 버튼 클릭
   - 새 JSON 파일 선택

### 브라우저 웹앱
1. `data/subsidies-2026.json` 수정
2. 재배포 (GitHub Pages, Netlify 등)
3. 사용자가 새로고침

### 온라인 서버
1. **자동 배포** (GitHub 연동)
   - 코드 푸시 → 자동 배포
2. **수동 업데이트**
   - 서버에 접속하여 파일 수정
3. **API 업데이트**
   - POST /api/update-data 사용

---

## 🎯 권장 배포 전략

### 소규모 팀 (10명 이하)
→ **브라우저 웹앱** (Netlify Drop)
- 가장 빠르고 간단
- 무료
- 모든 기기 지원

### 중규모 조직 (100명 이하)
→ **Windows .exe + Mac .dmg**
- 사내 공유 폴더에 업로드
- 오프라인 작동
- 데이터 업데이트 기능 포함

### 대규모 배포 (100명 이상)
→ **온라인 웹 서버** (Vercel/Render)
- 중앙 집중식 관리
- 자동 업데이트
- API 제공
- 사용 통계 수집 가능

### 혼합 전략
- **내부 직원**: 데스크톱 앱
- **외부 파트너**: 온라인 웹 서버
- **긴급 임시 사용**: 브라우저 웹앱

---

## 🔒 보안 고려사항

### 공개 배포 시
- 민감한 데이터 제거
- API 키 숨기기
- Rate limiting 설정

### 사내 배포 시
- VPN 필수 설정
- IP 화이트리스트
- 인증 시스템 추가

---

## 📞 지원

- **기술 문의**: 개발팀
- **정책 문의**: 고용노동부 1350

---

**작성일**: 2026-01-11  
**버전**: 1.0.0
