# 2026 고용지원금 최적화 시스템 - 웹 서버 버전

## 📌 개요

Node.js Express 기반 온라인 웹 애플리케이션입니다.
서버에 배포하여 여러 사용자가 동시에 접속할 수 있습니다.

---

## 🚀 로컬 실행

### 1단계: 의존성 설치
```bash
cd web-server
npm install
```

### 2단계: 서버 실행
```bash
# 프로덕션 모드
npm start

# 개발 모드 (자동 재시작)
npm run dev
```

### 3단계: 브라우저 접속
```
http://localhost:3000
```

---

## 🌐 온라인 배포

### Vercel 배포 (무료, 추천)

#### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2. 배포
```bash
cd web-server
vercel
```

#### 3. 프로덕션 배포
```bash
vercel --prod
```

배포 완료 후 공개 URL 제공됩니다:
```
https://your-app.vercel.app
```

---

### Render 배포 (무료)

#### 1. GitHub에 코드 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 2. Render 설정
1. [Render.com](https://render.com) 가입
2. New → Web Service
3. GitHub 저장소 연결
4. 설정:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Create Web Service

배포 완료 후 공개 URL 제공:
```
https://your-app.onrender.com
```

---

### Railway 배포 (무료)

#### 1. Railway CLI 설치
```bash
npm install -g @railway/cli
```

#### 2. 로그인 및 배포
```bash
railway login
railway init
railway up
```

#### 3. 도메인 설정
```bash
railway domain
```

---

### Heroku 배포

#### 1. Procfile 생성
```bash
echo "web: npm start" > Procfile
```

#### 2. Heroku CLI로 배포
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku open
```

---

## 📂 디렉토리 구조

```
web-server/
├── server.js               # Express 서버
├── package.json            # 의존성 관리
├── public/                 # 정적 파일
│   ├── index.html          # 메인 페이지
│   ├── src/                # JavaScript 소스
│   └── data/               # 지원금 데이터
└── README.md               # 이 파일
```

---

## 🔌 API 엔드포인트

### GET /
메인 페이지 반환

### GET /api/version
데이터 버전 정보 반환
```json
{
  "version": "2026.1.0",
  "lastUpdated": "2026-01-11",
  "description": "2026년 고용지원금 데이터"
}
```

### GET /api/subsidies
전체 지원금 데이터 반환
```json
{
  "version": "2026.1.0",
  "subsidies": [...],
  "companySizeCategories": {...},
  "industryTypes": [...]
}
```

### POST /api/update-data
지원금 데이터 업데이트 (관리자용)
```bash
curl -X POST http://localhost:3000/api/update-data \
  -H "Content-Type: application/json" \
  -d @new-data.json
```

---

## 🔐 보안 설정 (프로덕션)

### 환경 변수 설정
`.env` 파일 생성:
```env
PORT=3000
NODE_ENV=production
ADMIN_API_KEY=your-secret-key
```

### API 인증 추가
`server.js`에 미들웨어 추가:
```javascript
const apiAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.post('/api/update-data', apiAuth, async (req, res) => {
    // ...
});
```

---

## 📊 성능 최적화

### 1. 압축 활성화
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. 캐싱 설정
```javascript
app.use(express.static('public', {
    maxAge: '1d',
    etag: true
}));
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use('/api/', limiter);
```

---

## 🔄 데이터 업데이트

### 방법 1: 파일 직접 수정
```bash
# 서버에서
vi public/data/subsidies-2026.json
# 또는
nano public/data/subsidies-2026.json
```

### 방법 2: API 사용
```bash
curl -X POST https://your-app.com/api/update-data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d @new-data.json
```

### 방법 3: FTP/SFTP
서버에 접속하여 `public/data/subsidies-2026.json` 교체

---

## 📈 모니터링

### 로그 확인
```bash
# Vercel
vercel logs

# Render
render logs

# Railway
railway logs

# Heroku
heroku logs --tail
```

### 상태 확인
```bash
curl https://your-app.com/api/version
```

---

## 🐛 문제 해결

### 서버가 시작되지 않음
```bash
# 포트 충돌 확인
lsof -i :3000

# 다른 포트 사용
PORT=8080 npm start
```

### 데이터가 로드되지 않음
```bash
# 파일 권한 확인
ls -l public/data/subsidies-2026.json

# 경로 확인
pwd
ls -R public/
```

### CORS 오류
`server.js`에서 CORS 설정 확인:
```javascript
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));
```

---

## 🔧 커스터마이징

### 포트 변경
```javascript
const PORT = process.env.PORT || 8080;
```

### 도메인 연결
각 플랫폼에서 커스텀 도메인 설정:
- Vercel: Domains → Add
- Render: Settings → Custom Domain
- Railway: Settings → Networking

---

## 📞 지원

- **기술 문의**: 개발팀
- **정책 문의**: 고용노동부 1350

---

**버전**: 1.0.0 (웹 서버)  
**최종 업데이트**: 2026-01-11
