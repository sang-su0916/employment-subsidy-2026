const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const XLSX = require('xlsx');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 지역 및 업종 옵션
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const INDUSTRIES = ['제조업', '건설업', '도소매업', '숙박음식업', '정보통신업', '전문과학기술업', '사업서비스업', '농업/임업/어업', '광업', '전기/가스/수도', '운수/창고업', '금융/보험업', '부동산업', '교육서비스업', '보건/사회복지', '예술/스포츠', '기타'];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 옵션 API
app.get('/api/options', (req, res) => {
    res.json({
        regions: REGIONS,
        industries: INDUSTRIES
    });
});

// 분석 API
app.post('/api/analyze', async (req, res) => {
    try {
        const companyData = req.body;
        const dataPath = path.join(__dirname, 'public', 'data', 'subsidies-2026.json');
        const data = await fs.readFile(dataPath, 'utf-8');
        const subsidyData = JSON.parse(data);

        const result = analyzeEligibility(companyData, subsidyData.subsidies);

        res.json({
            success: true,
            companyData,
            eligibility: result.eligibility,
            calculations: result.calculations,
            comparison: result.comparison,
            optimal: result.optimal
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 적격성 분석 함수
function analyzeEligibility(company, subsidies) {
    const eligible = [];
    const notEligible = [];
    const calculations = [];

    for (const subsidy of subsidies) {
        const check = checkEligibility(company, subsidy);
        if (check.isEligible) {
            eligible.push({ subsidy, reasons: [] });
            const calc = calculateAmount(company, subsidy);
            calculations.push(calc);
        } else {
            notEligible.push({ subsidy, reasons: check.reasons });
        }
    }

    // 지원금액 기준 정렬
    calculations.sort((a, b) => b.totalAmount - a.totalAmount);
    const comparison = [...calculations];

    // 최적 조합 계산 (중복 불가 지원금 고려)
    const optimal = findOptimalCombination(calculations);

    return {
        eligibility: { eligible, notEligible },
        calculations,
        comparison,
        optimal
    };
}

// 적격성 체크
function checkEligibility(company, subsidy) {
    const reasons = [];
    const elig = subsidy.eligibility;

    // 최소 직원 수 체크
    if (elig.minEmployees && company.totalEmployees < elig.minEmployees) {
        reasons.push(`최소 ${elig.minEmployees}인 이상 필요 (현재 ${company.totalEmployees}인)`);
    }

    // 최대 직원 수 체크
    if (elig.maxEmployees && company.totalEmployees > elig.maxEmployees) {
        reasons.push(`${elig.maxEmployees}인 이하 기업만 가능 (현재 ${company.totalEmployees}인)`);
    }

    // 필수 직원 유형 체크
    if (elig.requiredEmployeeTypes && elig.requiredEmployeeTypes.length > 0) {
        for (const type of elig.requiredEmployeeTypes) {
            if (type === '청년' && (!company.youthEmployees || company.youthEmployees === 0)) {
                reasons.push('청년 근로자(15~34세)가 필요합니다');
            }
            if (type === '고령자' && (!company.seniorEmployees || company.seniorEmployees === 0)) {
                reasons.push('고령자 근로자(60세+)가 필요합니다');
            }
            if (type === '장애인' && (!company.disabledEmployees || company.disabledEmployees === 0) && (!company.severeDisabledEmployees || company.severeDisabledEmployees === 0)) {
                reasons.push('장애인 근로자가 필요합니다');
            }
            if (type === '50세 이상 중장년' && (!company.middleAgedEmployees || company.middleAgedEmployees === 0) && (!company.seniorEmployees || company.seniorEmployees === 0)) {
                reasons.push('50세 이상 중장년 근로자가 필요합니다');
            }
        }
    }

    // 정년 규정 체크
    if (elig.requiresRetirementAge && !company.hasRetirementAge) {
        reasons.push('정년 규정이 있어야 합니다');
    }

    // 중증장애인 체크
    if (elig.requiresSevereDisabled && (!company.severeDisabledEmployees || company.severeDisabledEmployees === 0)) {
        reasons.push('중증장애인 근로자가 필요합니다');
    }

    // 업종 체크
    if (elig.targetIndustries && elig.targetIndustries.length > 0) {
        const normalizedIndustry = company.industry.replace('/', '');
        const isMatch = elig.targetIndustries.some(ind =>
            company.industry.includes(ind) || ind.includes(company.industry) || normalizedIndustry.includes(ind.replace('/', ''))
        );
        if (!isMatch) {
            reasons.push(`대상 업종: ${elig.targetIndustries.join(', ')}`);
        }
    }

    // 구직자 대상 지원금은 기업 대상이 아님
    if (elig.forJobSeekers) {
        reasons.push('구직자 대상 지원금 (기업 대상 아님)');
    }

    return {
        isEligible: reasons.length === 0,
        reasons
    };
}

// 지원금 계산
function calculateAmount(company, subsidy) {
    let totalAmount = 0;
    let details = '';
    const calc = subsidy.calculation;

    switch (calc.type) {
        case 'regional-differentiated-2026':
            // 청년일자리도약장려금
            const companyAmount = calc.company.amount * (company.youthEmployees || 1);
            let youthAmount = 0;
            const regionType = company.regionType || '수도권';

            if (calc.youth[regionType]) {
                youthAmount = calc.youth[regionType].totalAmount * (company.youthEmployees || 1);
            }

            totalAmount = companyAmount + youthAmount;
            details = `기업지원 ${(calc.company.amount / 10000).toLocaleString()}만원 × ${company.youthEmployees || 1}명`;
            if (youthAmount > 0) {
                details += ` + 청년직접지원 ${(calc.youth[regionType].totalAmount / 10000).toLocaleString()}만원 × ${company.youthEmployees || 1}명`;
            }
            break;

        case 'regional-differentiated-quarterly':
            // 고령자계속고용장려금
            const isMetro = ['서울', '경기', '인천'].includes(company.region);
            const regionCalc = isMetro ? calc['수도권'] : calc['비수도권'];
            totalAmount = regionCalc.totalAmount * (company.seniorEmployees || 1);
            details = `${isMetro ? '수도권' : '비수도권'} 월 ${(regionCalc.monthlyAmount / 10000)}만원 × ${regionCalc.maxYears}년 × ${company.seniorEmployees || 1}명`;
            break;

        case 'per-employee-monthly-by-gender':
            // 중증장애인고용개선장려금
            const severeCount = company.severeDisabledEmployees || 0;
            totalAmount = calc['중증남성'].totalAmount * severeCount;
            details = `중증장애인 ${severeCount}명 × 월 ${(calc['중증남성'].monthlyAmount / 10000)}만원 × 12개월`;
            break;

        case 'monthly-based-on-wage-increase':
            // 정규직 전환 지원금
            const nonRegular = company.nonRegularEmployees || 0;
            const wageIncrease = company.wageIncrease || 0;
            const calcType = wageIncrease >= 200000 ? '임금20만원이상인상' : '그외';
            totalAmount = calc[calcType].totalAmount * nonRegular;
            details = `${calcType === '임금20만원이상인상' ? '임금 20만원↑ 인상' : '일반 전환'} ${nonRegular}명 × ${(calc[calcType].totalAmount / 10000).toLocaleString()}만원`;
            break;

        case 'milestone-based':
            // 일손부족일자리 동행인센티브
            const middleAged = (company.middleAgedEmployees || 0) + (company.seniorEmployees || 0);
            totalAmount = calc.totalAmount * middleAged;
            details = `50세+ 중장년 ${middleAged}명 × ${(calc.totalAmount / 10000).toLocaleString()}만원`;
            break;

        case 'per-employee-monthly':
            // 육아기 10시 출근제
            const childcareWorkers = company.childcareWorkers || 0;
            totalAmount = calc.monthlyAmount * 12 * childcareWorkers;
            details = `육아기 근로자 ${childcareWorkers}명 × 월 ${(calc.monthlyAmount / 10000)}만원 × 12개월`;
            break;

        default:
            if (calc.totalAmount) {
                totalAmount = calc.totalAmount;
                details = calc.description || '';
            }
    }

    return {
        subsidy,
        totalAmount,
        details
    };
}

// 최적 조합 찾기
function findOptimalCombination(calculations) {
    if (calculations.length === 0) {
        return { combination: [], totalAmount: 0 };
    }

    // 중복 불가 체크 후 최대 금액 조합 반환
    const combination = [];
    let totalAmount = 0;
    const usedExclusions = new Set();

    for (const calc of calculations) {
        const exclusions = calc.subsidy.mutuallyExclusive || [];
        const canAdd = !exclusions.some(ex => usedExclusions.has(ex));

        if (canAdd) {
            combination.push(calc);
            totalAmount += calc.totalAmount;
            usedExclusions.add(calc.subsidy.id);
            exclusions.forEach(ex => usedExclusions.add(ex));
        }
    }

    return { combination, totalAmount };
}

app.get('/api/version', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'public', 'data', 'subsidies-2026.json');
        const data = await fs.readFile(dataPath, 'utf-8');
        const jsonData = JSON.parse(data);
        
        res.json({
            version: jsonData.version,
            lastUpdated: jsonData.lastUpdated,
            description: jsonData.description
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read version data' });
    }
});

app.get('/api/subsidies', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'public', 'data', 'subsidies-2026.json');
        const data = await fs.readFile(dataPath, 'utf-8');
        const jsonData = JSON.parse(data);
        
        res.json(jsonData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read subsidy data' });
    }
});

app.post('/api/update-data', async (req, res) => {
    try {
        const newData = req.body;
        
        if (!newData.subsidies || !Array.isArray(newData.subsidies)) {
            return res.status(400).json({ 
                error: 'Invalid data format: subsidies array required' 
            });
        }
        
        const dataPath = path.join(__dirname, 'public', 'data', 'subsidies-2026.json');
        
        const backupPath = path.join(__dirname, 'public', 'data', `subsidies-backup-${Date.now()}.json`);
        const currentData = await fs.readFile(dataPath, 'utf-8');
        await fs.writeFile(backupPath, currentData);
        
        await fs.writeFile(dataPath, JSON.stringify(newData, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Data updated successfully',
            version: newData.version,
            lastUpdated: newData.lastUpdated
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to update data',
            details: error.message 
        });
    }
});

// Excel 내보내기 API
app.post('/api/export/excel', (req, res) => {
    try {
        const { companyData, eligibilityResult, optimal } = req.body;

        // 워크북 생성
        const wb = XLSX.utils.book_new();

        // 1. 기업 정보 시트
        const companySheet = [
            ['2026년 고용지원금 분석 결과'],
            [],
            ['기업 정보'],
            ['지역', companyData.region || ''],
            ['지역유형', companyData.regionType || ''],
            ['업종', companyData.industry || ''],
            ['총 직원수', companyData.totalEmployees || 0],
            ['청년(15~34세)', companyData.youthEmployees || 0],
            ['중장년(50~59세)', companyData.middleAgedEmployees || 0],
            ['고령자(60세+)', companyData.seniorEmployees || 0],
            ['장애인', companyData.disabledEmployees || 0],
            ['중증장애인', companyData.severeDisabledEmployees || 0],
            ['육아기 근로자', companyData.childcareWorkers || 0],
            ['비정규직(전환예정)', companyData.nonRegularEmployees || 0],
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(companySheet);
        ws1['!cols'] = [{ wch: 20 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws1, '기업정보');

        // 2. 수급 가능 지원금 시트
        const eligibleData = [
            ['수급 가능 지원금'],
            [],
            ['지원금명', '설명', '예상 금액', '산출 내역']
        ];

        if (optimal && optimal.combination) {
            optimal.combination.forEach(item => {
                eligibleData.push([
                    item.subsidy?.name || '',
                    item.subsidy?.description || '',
                    item.totalAmount || 0,
                    item.details || ''
                ]);
            });
        }

        eligibleData.push([]);
        eligibleData.push(['총 예상 수급액', '', optimal?.totalAmount || 0, '']);

        const ws2 = XLSX.utils.aoa_to_sheet(eligibleData);
        ws2['!cols'] = [{ wch: 25 }, { wch: 50 }, { wch: 15 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, ws2, '수급가능지원금');

        // 3. 수급 불가 지원금 시트
        const notEligibleData = [
            ['수급 불가 지원금'],
            [],
            ['지원금명', '미충족 사유']
        ];

        if (eligibilityResult && eligibilityResult.notEligible) {
            eligibilityResult.notEligible.forEach(item => {
                notEligibleData.push([
                    item.subsidy?.name || '',
                    (item.reasons || []).join(', ')
                ]);
            });
        }

        const ws3 = XLSX.utils.aoa_to_sheet(notEligibleData);
        ws3['!cols'] = [{ wch: 25 }, { wch: 60 }];
        XLSX.utils.book_append_sheet(wb, ws3, '수급불가지원금');

        // 버퍼로 변환
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=employment_subsidy_report.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error('Excel export error:', error);
        res.status(500).json({ error: 'Excel 생성 실패: ' + error.message });
    }
});

// PDF 내보내기 API (puppeteer 기반)
app.post('/api/export/pdf', async (req, res) => {
    let browser = null;
    try {
        const { companyData, eligibilityResult, optimal } = req.body;

        // HTML 템플릿 생성
        const html = generatePdfHtml(companyData, eligibilityResult, optimal);

        // Puppeteer로 PDF 생성
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
            printBackground: true
        });

        await browser.close();
        browser = null;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=employment_subsidy_report.pdf');
        res.end(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('PDF export error:', error);
        if (browser) await browser.close();
        res.status(500).json({ error: 'PDF 생성 실패: ' + error.message });
    }
});

// PDF용 HTML 생성 함수
function generatePdfHtml(companyData, eligibilityResult, optimal) {
    const eligibleHtml = optimal?.combination?.length > 0
        ? optimal.combination.map((item, idx) => `
            <div class="subsidy-item eligible">
                <div class="subsidy-name">${idx + 1}. ${item.subsidy?.name || ''}</div>
                <div class="subsidy-amount">금액: ${(item.totalAmount || 0).toLocaleString()}원</div>
                <div class="subsidy-detail">산출: ${item.details || ''}</div>
            </div>
        `).join('')
        : '<p class="no-data">수급 가능한 지원금이 없습니다.</p>';

    const notEligibleHtml = eligibilityResult?.notEligible?.length > 0
        ? eligibilityResult.notEligible.map((item, idx) => `
            <div class="subsidy-item not-eligible">
                <div class="subsidy-name">${idx + 1}. ${item.subsidy?.name || ''}</div>
                <div class="subsidy-reason">미충족 사유: ${(item.reasons || []).join(', ')}</div>
            </div>
        `).join('')
        : '<p class="no-data">모든 지원금 수급 가능!</p>';

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            padding: 10mm;
        }
        h1 {
            text-align: center;
            color: #1a73e8;
            font-size: 22px;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #1a73e8;
        }
        h2 {
            font-size: 14px;
            color: #333;
            margin: 20px 0 10px;
            padding: 8px 12px;
            background: #f5f5f5;
            border-left: 4px solid #1a73e8;
        }
        .company-info {
            background: #fafafa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .company-info p { margin: 5px 0; }
        .total-amount {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #1a73e8;
            padding: 20px;
            background: linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%);
            border-radius: 12px;
            margin: 20px 0;
        }
        .subsidy-item {
            padding: 12px;
            margin: 8px 0;
            border-radius: 8px;
        }
        .subsidy-item.eligible {
            background: #e6f4ea;
            border-left: 4px solid #34a853;
        }
        .subsidy-item.not-eligible {
            background: #fce8e6;
            border-left: 4px solid #ea4335;
        }
        .subsidy-name { font-weight: bold; margin-bottom: 5px; }
        .subsidy-amount { color: #1a73e8; }
        .subsidy-detail { color: #666; font-size: 11px; }
        .subsidy-reason { color: #c62828; font-size: 11px; }
        .no-data { color: #666; font-style: italic; padding: 10px; }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: right;
            color: #888;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <h1>2026년 고용지원금 분석 결과</h1>

    <h2>기업 정보</h2>
    <div class="company-info">
        <p><strong>지역:</strong> ${companyData.region || '-'} (${companyData.regionType || '-'})</p>
        <p><strong>업종:</strong> ${companyData.industry || '-'}</p>
        <p><strong>총 직원수:</strong> ${companyData.totalEmployees || 0}명</p>
        <p><strong>청년(15~34세):</strong> ${companyData.youthEmployees || 0}명</p>
        <p><strong>중장년(50~59세):</strong> ${companyData.middleAgedEmployees || 0}명</p>
        <p><strong>고령자(60세+):</strong> ${companyData.seniorEmployees || 0}명</p>
        <p><strong>장애인:</strong> ${companyData.disabledEmployees || 0}명</p>
        <p><strong>중증장애인:</strong> ${companyData.severeDisabledEmployees || 0}명</p>
        <p><strong>육아기 근로자:</strong> ${companyData.childcareWorkers || 0}명</p>
    </div>

    <h2>총 예상 수급액</h2>
    <div class="total-amount">${(optimal?.totalAmount || 0).toLocaleString()}원</div>

    <h2>수급 가능 지원금</h2>
    ${eligibleHtml}

    <h2>수급 불가 지원금</h2>
    ${notEligibleHtml}

    <div class="footer">생성일: ${new Date().toLocaleDateString('ko-KR')}</div>
</body>
</html>`;
}

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  2026 고용지원금 최적화 시스템 - 웹 서버                 ║
╠════════════════════════════════════════════════════════════╣
║  🌐 서버 주소: http://localhost:${PORT}                    ║
║  📊 데이터 API: http://localhost:${PORT}/api/subsidies     ║
║  🔄 버전 확인: http://localhost:${PORT}/api/version        ║
╚════════════════════════════════════════════════════════════╝
    `);
});
