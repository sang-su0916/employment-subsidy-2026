#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const { SUBSIDIES, REGION_TYPES, INDUSTRY_TYPES } = require('./src/data/subsidies.js');
const { getAllEligibleSubsidies } = require('./src/logic/eligibility.js');
const { findOptimalSubsidy, generateAllCalculations, compareSubsidies } = require('./src/logic/optimizer.js');
const { exportToExcel, exportToPDF, generateFileName } = require('./src/export/exporter.js');

const isTTY = process.stdin.isTTY;
let inputLines = [];
let lineIndex = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: isTTY
});

// 색상 코드
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    bgBlue: '\x1b[44m',
    bgGreen: '\x1b[42m'
};

function c(color, text) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
    console.clear();
    console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(c('bright', '           2026년 고용지원금 최적화 시스템'));
    console.log(c('dim', '              Employment Subsidy Optimizer'));
    console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log();
}

function ask(question) {
    return new Promise(resolve => {
        if (!isTTY && lineIndex < inputLines.length) {
            const answer = inputLines[lineIndex++];
            console.log(c('yellow', '? ') + question + ' ' + c('dim', answer));
            resolve(answer.trim());
        } else {
            rl.question(c('yellow', '? ') + question + ' ', answer => {
                resolve(answer.trim());
            });
        }
    });
}

function askNumber(question, defaultValue = 0) {
    return new Promise(resolve => {
        if (!isTTY && lineIndex < inputLines.length) {
            const answer = inputLines[lineIndex++];
            console.log(c('yellow', '? ') + question + ` (기본값: ${defaultValue}) ` + c('dim', answer));
            const num = parseInt(answer, 10);
            resolve(isNaN(num) ? defaultValue : num);
            return;
        }
        rl.question(c('yellow', '? ') + question + ` (기본값: ${defaultValue}) `, answer => {
            const num = parseInt(answer.trim()) || defaultValue;
            resolve(num);
        });
    });
}

function askYesNo(question, defaultValue = false) {
    return new Promise(resolve => {
        const hint = defaultValue ? '(Y/n)' : '(y/N)';
        if (!isTTY && lineIndex < inputLines.length) {
            const answer = inputLines[lineIndex++];
            console.log(c('yellow', '? ') + question + ` ${hint} ` + c('dim', answer));
            const a = answer.trim().toLowerCase();
            if (a === '') resolve(defaultValue);
            else resolve(a === 'y' || a === 'yes' || a === '예');
            return;
        }
        rl.question(c('yellow', '? ') + question + ` ${hint} `, answer => {
            const a = answer.trim().toLowerCase();
            if (a === '') resolve(defaultValue);
            else resolve(a === 'y' || a === 'yes' || a === '예');
        });
    });
}

function printMenu(title, options) {
    console.log(c('cyan', `\n${title}`));
    options.forEach((opt, i) => {
        console.log(`  ${c('bright', i + 1)}. ${opt}`);
    });
}

async function selectFromList(title, options, allowMultiple = false) {
    printMenu(title, options);

    if (allowMultiple) {
        const answer = await ask('번호 입력 (쉼표로 구분, 예: 1,3,5):');
        const indices = answer.split(',').map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < options.length);
        return indices.map(i => options[i]);
    } else {
        const answer = await ask('번호 입력:');
        const index = parseInt(answer) - 1;
        return options[index] || options[0];
    }
}

async function getCompanyInfo() {
    console.log(c('bright', '\n[ 1단계: 기본 정보 입력 ]'));
    console.log(c('dim', '────────────────────────────────────────────────────────────'));

    const companyData = {
        applicantType: 'company'
    };

    // 총 직원 수
    companyData.totalEmployees = await askNumber('총 직원 수 (명):', 10);

    // 지역 선택
    const regions = [
        '서울', '인천', '경기',
        '부산', '대구', '광주', '대전', '울산', '세종',
        '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
    ];
    companyData.region = await selectFromList('지역 선택:', regions);

    // 수도권/비수도권 자동 판별
    const metropolitan = ['서울', '인천', '경기'];
    if (metropolitan.includes(companyData.region)) {
        companyData.regionType = '수도권';
    } else {
        // 비수도권 세부 유형
        const regionTypes = ['일반비수도권', '우대지원지역 (44개 지역)', '특별지원지역 (인구감소 40개 지역)'];
        const selectedType = await selectFromList('비수도권 세부 유형:', regionTypes);
        if (selectedType.includes('특별')) {
            companyData.regionType = '특별지원지역';
            companyData.isSpecialRegion = true;
        } else if (selectedType.includes('우대')) {
            companyData.regionType = '우대지원지역';
            companyData.isPriorityRegion = true;
        } else {
            companyData.regionType = '일반비수도권';
        }
    }

    // 업종 선택
    companyData.industry = await selectFromList('업종 선택:', INDUSTRY_TYPES);

    console.log(c('bright', '\n[ 2단계: 직원 구성 입력 ]'));
    console.log(c('dim', '────────────────────────────────────────────────────────────'));

    // 청년 직원
    companyData.youthEmployees = await askNumber('청년 직원 수 (15~34세):', 0);

    // 고령자 직원
    companyData.seniorEmployees = await askNumber('고령자 직원 수 (60세 이상):', 0);

    // 중장년 직원
    companyData.middleAgedEmployees = await askNumber('중장년 직원 수 (50~59세):', 0);

    // 장애인 직원
    companyData.disabledEmployees = await askNumber('장애인 직원 수:', 0);

    if (companyData.disabledEmployees > 0) {
        companyData.severeDisabledEmployees = await askNumber('  └ 그 중 중증장애인 수:', 0);
        if (companyData.severeDisabledEmployees > 0) {
            companyData.hasSevereDisabled = true;
        }
        if (companyData.totalEmployees >= 50) {
            companyData.exceedsDisabilityQuota = await askYesNo('장애인 의무고용률(3.1%)을 초과하고 있습니까?', false);
        }
    }

    // 비정규직 직원
    companyData.nonRegularEmployees = await askNumber('비정규직 직원 수 (6개월 이상 근무, 전환 예정):', 0);
    if (companyData.nonRegularEmployees > 0) {
        companyData.wageIncrease = await askNumber('전환 시 예상 임금 인상액 (원/월):', 0);
    }

    // 육아기 근로자
    companyData.childcareWorkers = await askNumber('육아기 근로자 수 (12세 이하 자녀):', 0);

    console.log(c('bright', '\n[ 3단계: 추가 조건 확인 ]'));
    console.log(c('dim', '────────────────────────────────────────────────────────────'));

    // 정년 규정
    companyData.hasRetirementAge = await askYesNo('취업규칙에 정년(60세 이상) 규정이 있습니까?', false);

    return companyData;
}

function printCompanySummary(companyData) {
    console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(c('bright', '                    입력된 회사 정보'));
    console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    console.log(`  ${c('dim', '지역:')} ${companyData.region} (${companyData.regionType})`);
    console.log(`  ${c('dim', '업종:')} ${companyData.industry}`);
    console.log(`  ${c('dim', '총 직원:')} ${companyData.totalEmployees}명`);
    console.log();
    console.log(`  ${c('dim', '청년(15~34세):')} ${companyData.youthEmployees || 0}명`);
    console.log(`  ${c('dim', '중장년(50~59세):')} ${companyData.middleAgedEmployees || 0}명`);
    console.log(`  ${c('dim', '고령자(60세+):')} ${companyData.seniorEmployees || 0}명`);
    console.log(`  ${c('dim', '장애인:')} ${companyData.disabledEmployees || 0}명 (중증: ${companyData.severeDisabledEmployees || 0}명)`);
    console.log(`  ${c('dim', '비정규직(전환예정):')} ${companyData.nonRegularEmployees || 0}명`);
    console.log(`  ${c('dim', '육아기 근로자:')} ${companyData.childcareWorkers || 0}명`);
    console.log();
    console.log(`  ${c('dim', '정년 규정:')} ${companyData.hasRetirementAge ? '있음' : '없음'}`);
}

function printEligibilityResult(result) {
    console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(c('bright', '                    자격 요건 검사 결과'));
    console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    console.log(c('green', `\n✅ 수급 가능 지원금: ${result.eligible.length}개`));
    if (result.eligible.length > 0) {
        result.eligible.forEach(s => {
            console.log(`   ${c('bright', '•')} ${s.name}`);
            console.log(`     ${c('dim', s.description)}`);
        });
    } else {
        console.log(c('dim', '   수급 가능한 지원금이 없습니다.'));
    }

    console.log(c('red', `\n❌ 수급 불가 지원금: ${result.notEligible.length}개`));
    result.notEligible.forEach(item => {
        console.log(`   ${c('dim', '•')} ${item.subsidy.name}`);
        item.reasons.forEach(r => console.log(`     ${c('red', '└')} ${r}`));
    });
}

function printOptimalResult(optimal, companyData) {
    console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(c('bright', '                    최적 조합 추천 결과'));
    console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    if (!optimal) {
        console.log(c('yellow', '\n수급 가능한 지원금이 없습니다.'));
        return;
    }

    console.log(c('green', `\n🏆 추천 조합: ${optimal.count}개 지원금 동시 수급`));
    console.log(c('bright', `   총 예상 수급액: ${optimal.totalAmount.toLocaleString()}원`));

    // 연간/월간 환산
    const yearly = Math.round(optimal.totalAmount / 3);
    const monthly = Math.round(yearly / 12);
    console.log(c('dim', `   연간 환산: 약 ${yearly.toLocaleString()}원/년`));
    console.log(c('dim', `   월간 환산: 약 ${monthly.toLocaleString()}원/월`));

    console.log(c('bright', '\n📋 상세 내역:'));
    console.log(c('dim', '────────────────────────────────────────────────────────────'));

    optimal.subsidies.forEach((s, i) => {
        console.log(`\n  ${c('cyan', (i + 1) + '.')} ${c('bright', s.subsidy.name)}`);
        console.log(`     ${c('green', '금액:')} ${s.totalAmount.toLocaleString()}원`);
        console.log(`     ${c('dim', '산출:')} ${s.details}`);

        // 신청 정보
        if (s.subsidy.documentGuide) {
            console.log(`     ${c('yellow', '신청:')} ${s.subsidy.documentGuide.applicationMethod || '고용센터'}`);
        }
    });

    // 주의사항
    console.log(c('yellow', '\n⚠️  주의사항:'));
    console.log(c('dim', '   • 지원금은 예산 소진 시 조기 마감될 수 있습니다.'));
    console.log(c('dim', '   • 정확한 금액은 고용센터 상담 후 확정됩니다.'));
    console.log(c('dim', '   • 본 결과는 참고용이며, 실제 수급 여부는 심사를 통해 결정됩니다.'));
}

function printIndividualComparison(eligible, companyData) {
    console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(c('bright', '                    개별 지원금 비교'));
    console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    const allCalcs = generateAllCalculations(eligible, companyData);
    const compared = compareSubsidies(allCalcs);

    console.log();
    compared.forEach(c_item => {
        const bar = '█'.repeat(Math.round(c_item.percentageOfBest / 5));
        const percentage = c_item.percentageOfBest.toFixed(0) + '%';
        console.log(`  ${c('bright', c_item.rank + '.')} ${c_item.subsidy.name}`);
        console.log(`     ${c('green', c_item.totalAmount.toLocaleString().padStart(15))}원  ${c('cyan', bar)} ${percentage}`);
    });
}

async function main() {
    printHeader();

    console.log(c('dim', '이 프로그램은 2026년 고용지원금 수급 자격을 검사하고'));
    console.log(c('dim', '최적의 지원금 조합을 추천합니다.'));
    console.log();

    try {
        // 회사 정보 입력
        const companyData = await getCompanyInfo();

        // 입력 정보 요약
        printCompanySummary(companyData);

        const proceed = await askYesNo('\n위 정보로 분석을 진행하시겠습니까?', true);
        if (!proceed) {
            console.log(c('yellow', '\n프로그램을 종료합니다.'));
            rl.close();
            return;
        }

        // 자격 요건 검사
        const eligibilityResult = getAllEligibleSubsidies(SUBSIDIES, companyData);
        printEligibilityResult(eligibilityResult);

        if (eligibilityResult.eligible.length === 0) {
            console.log(c('yellow', '\n수급 가능한 지원금이 없어 분석을 종료합니다.'));
            rl.close();
            return;
        }

        // 개별 비교
        printIndividualComparison(eligibilityResult.eligible, companyData);

        // 최적 조합 추천
        const optimal = findOptimalSubsidy(eligibilityResult.eligible, companyData);
        printOptimalResult(optimal, companyData);

        // 내보내기 옵션
        console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(c('bright', '                    결과 내보내기'));
        console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

        const exportChoice = await selectFromList('결과를 파일로 저장하시겠습니까?', [
            'Excel 파일로 저장 (.xlsx)',
            'PDF 파일로 저장 (.pdf)',
            '둘 다 저장',
            '저장하지 않음'
        ]);

        const outputDir = process.cwd();

        if (exportChoice.includes('Excel') || exportChoice.includes('둘 다')) {
            const excelPath = path.join(outputDir, generateFileName('고용지원금_분석결과', 'xlsx'));
            exportToExcel(companyData, eligibilityResult, optimal, excelPath);
            console.log(c('green', `\n✅ Excel 파일 저장 완료: ${excelPath}`));
        }

        if (exportChoice.includes('PDF') || exportChoice.includes('둘 다')) {
            const pdfPath = path.join(outputDir, generateFileName('고용지원금_분석결과', 'pdf'));
            await exportToPDF(companyData, eligibilityResult, optimal, pdfPath);
            console.log(c('green', `✅ PDF 파일 저장 완료: ${pdfPath}`));
        }

        console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(c('bright', '\n감사합니다. 프로그램을 종료합니다.\n'));

    } catch (error) {
        console.error(c('red', '\n오류가 발생했습니다:'), error.message);
    }

    rl.close();
}

// 비대화형 모드 (--json 옵션)
async function runNonInteractive(jsonPath, exportFormat = null) {
    const fs = require('fs');

    try {
        const data = fs.readFileSync(jsonPath, 'utf-8');
        const companyData = JSON.parse(data);

        // 기본값 설정
        companyData.applicantType = companyData.applicantType || 'company';

        console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(c('bright', '           2026년 고용지원금 최적화 시스템'));
        console.log(c('dim', '              (비대화형 모드)'));
        console.log(c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

        printCompanySummary(companyData);

        const eligibilityResult = getAllEligibleSubsidies(SUBSIDIES, companyData);
        printEligibilityResult(eligibilityResult);

        let optimal = null;
        if (eligibilityResult.eligible.length > 0) {
            printIndividualComparison(eligibilityResult.eligible, companyData);
            optimal = findOptimalSubsidy(eligibilityResult.eligible, companyData);
            printOptimalResult(optimal, companyData);
        }

        // 내보내기 처리
        if (exportFormat) {
            const outputDir = process.cwd();

            if (exportFormat === 'excel' || exportFormat === 'both') {
                const excelPath = path.join(outputDir, generateFileName('고용지원금_분석결과', 'xlsx'));
                exportToExcel(companyData, eligibilityResult, optimal, excelPath);
                console.log(c('green', `\n✅ Excel 파일 저장 완료: ${excelPath}`));
            }

            if (exportFormat === 'pdf' || exportFormat === 'both') {
                const pdfPath = path.join(outputDir, generateFileName('고용지원금_분석결과', 'pdf'));
                await exportToPDF(companyData, eligibilityResult, optimal, pdfPath);
                console.log(c('green', `✅ PDF 파일 저장 완료: ${pdfPath}`));
            }
        }

        console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    } catch (error) {
        console.error(c('red', '오류:'), error.message);
        process.exit(1);
    }
}

// 도움말
function printHelp() {
    console.log(`
${c('bright', '2026년 고용지원금 최적화 시스템')}

${c('cyan', '사용법:')}
  node cli.js                              대화형 모드로 실행
  node cli.js --json <파일>                JSON 파일로 입력
  node cli.js --json <파일> --export excel Excel로 내보내기
  node cli.js --json <파일> --export pdf   PDF로 내보내기
  node cli.js --json <파일> --export both  둘 다 내보내기
  node cli.js --example                    예제 JSON 출력
  node cli.js --help                       도움말 표시

${c('cyan', '예제 JSON 형식:')}
{
  "totalEmployees": 45,
  "region": "충북",
  "regionType": "일반비수도권",
  "industry": "제조업",
  "youthEmployees": 5,
  "seniorEmployees": 3,
  "middleAgedEmployees": 2,
  "disabledEmployees": 1,
  "severeDisabledEmployees": 0,
  "childcareWorkers": 2,
  "nonRegularEmployees": 0,
  "hasRetirementAge": true
}
`);
}

function printExample() {
    const example = {
        totalEmployees: 45,
        region: "충북",
        regionType: "일반비수도권",
        industry: "제조업",
        youthEmployees: 5,
        seniorEmployees: 3,
        middleAgedEmployees: 2,
        disabledEmployees: 1,
        severeDisabledEmployees: 0,
        hasSevereDisabled: false,
        childcareWorkers: 2,
        nonRegularEmployees: 0,
        wageIncrease: 0,
        hasRetirementAge: true
    };
    console.log(JSON.stringify(example, null, 2));
}

// 명령줄 인수 처리
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    printHelp();
} else if (args.includes('--example')) {
    printExample();
} else if (args.includes('--json')) {
    const jsonIndex = args.indexOf('--json');
    const jsonPath = args[jsonIndex + 1];
    if (!jsonPath) {
        console.error(c('red', '오류: JSON 파일 경로를 지정해주세요.'));
        process.exit(1);
    }

    // --export 옵션 처리
    let exportFormat = null;
    if (args.includes('--export')) {
        const exportIndex = args.indexOf('--export');
        exportFormat = args[exportIndex + 1] || 'both';
        if (!['excel', 'pdf', 'both'].includes(exportFormat)) {
            console.error(c('red', '오류: --export 옵션은 excel, pdf, both 중 하나를 지정해주세요.'));
            process.exit(1);
        }
    }

    runNonInteractive(jsonPath, exportFormat);
} else {
    // 대화형 모드
    if (!isTTY) {
        // 파이프 입력: 모든 입력을 먼저 읽음
        const lines = [];
        rl.on('line', (line) => {
            lines.push(line);
        });
        rl.on('close', () => {
            inputLines = lines;
            lineIndex = 0;
            runWithPipedInput();
        });
    } else {
        main();
    }
}

async function runWithPipedInput() {
    const rl2 = readline.createInterface({
        input: require('fs').createReadStream('/dev/null'),
        output: process.stdout
    });

    // 파이프 입력용 main 실행
    printHeader();
    console.log(c('dim', '이 프로그램은 2026년 고용지원금 수급 자격을 검사하고'));
    console.log(c('dim', '최적의 지원금 조합을 추천합니다.'));

    const companyData = await getCompanyInfo();

    const eligibilityResult = getAllEligibleSubsidies(SUBSIDIES, companyData);
    printEligibilityResult(eligibilityResult);

    if (eligibilityResult.eligible.length > 0) {
        printIndividualComparison(eligibilityResult.eligible, companyData);
        const optimal = findOptimalSubsidy(eligibilityResult.eligible, companyData);
        printOptimalResult(optimal, companyData);
    }

    console.log(c('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(c('bright', '\n감사합니다. 프로그램을 종료합니다.\n'));

    rl2.close();
    process.exit(0);
}
