# 빌드 가이드

## Electron을 사용한 독립 실행 파일 생성

### 1. 사전 준비

Node.js가 설치되어 있어야 합니다.

```bash
# Node.js 버전 확인
node --version
npm --version
```

### 2. 의존성 설치

```bash
cd /Users/isangsu/tmp/고용지원금-test
npm install
```

### 3. 로컬 테스트

```bash
# Electron 앱으로 실행 테스트
npm start
```

### 4. 실행 파일 빌드

#### Windows용 .exe 파일 생성
```bash
npm run build:win
```

**결과물**: `dist/고용지원금 최적화 Setup 1.0.0.exe`

#### macOS용 .app 파일 생성
```bash
npm run build:mac
```

**결과물**: `dist/고용지원금 최적화-1.0.0.dmg`

#### Linux용 실행 파일 생성
```bash
npm run build:linux
```

**결과물**: 
- `dist/고용지원금 최적화-1.0.0.AppImage`
- `dist/고용지원금 최적화_1.0.0_amd64.deb`

#### 모든 플랫폼용 빌드
```bash
npm run build:all
```

### 5. 빌드 결과물 위치

빌드가 완료되면 `dist/` 디렉토리에 실행 파일이 생성됩니다:

```
dist/
├── 고용지원금 최적화 Setup 1.0.0.exe      # Windows 설치 파일
├── 고용지원금 최적화-1.0.0.dmg             # macOS 설치 파일
├── 고용지원금 최적화-1.0.0.AppImage        # Linux AppImage
└── 고용지원금 최적화_1.0.0_amd64.deb       # Debian/Ubuntu 패키지
```

### 6. 아이콘 설정 (선택사항)

각 플랫폼별 아이콘 파일을 추가할 수 있습니다:

- **Windows**: `icon.ico` (256x256 픽셀)
- **macOS**: `icon.icns` (512x512 픽셀)
- **Linux**: `icon.png` (512x512 픽셀)

아이콘이 없으면 기본 Electron 아이콘이 사용됩니다.

### 7. 배포

생성된 설치 파일을 사용자에게 배포하면 됩니다:

- **Windows**: `.exe` 파일 실행하여 설치
- **macOS**: `.dmg` 파일 열어서 Applications 폴더로 드래그
- **Linux**: `.AppImage` 실행 권한 부여 후 실행, 또는 `.deb` 패키지 설치

### 8. 주의사항

#### 코드 서명 (선택사항, 프로덕션 권장)

실제 배포 시에는 코드 서명을 권장합니다:

**Windows**:
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "password"
    }
  }
}
```

**macOS**:
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name"
    }
  }
}
```

#### 빌드 환경

- Windows 빌드는 Windows에서
- macOS 빌드는 macOS에서 
- Linux 빌드는 Linux/macOS/Windows에서 가능

### 9. 문제 해결

#### 빌드 실패 시

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
npm cache clean --force
```

#### 실행 파일이 바이러스로 오인될 때

- Windows Defender나 백신 프로그램의 오탐입니다
- 코드 서명을 추가하면 해결됩니다

### 10. 파일 크기 최적화

기본 빌드 크기는 약 100-200MB입니다. 이는 Electron (Chromium + Node.js)이 포함되기 때문입니다.

최적화 옵션:
- 사용하지 않는 파일 제거
- 이미지 압축
- JavaScript 최소화 (minification)

---

## 간단 요약

```bash
# 1. 의존성 설치
npm install

# 2. Windows용 빌드 (Windows에서)
npm run build:win

# 3. 결과물
dist/고용지원금 최적화 Setup 1.0.0.exe
```

**완료!** 생성된 .exe 파일을 배포하면 됩니다.
