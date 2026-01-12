const express = require('express');
const cors = require('cors');
const path = require('path');
const { SUBSIDIES, REGION_TYPES, INDUSTRY_TYPES } = require('./src/data/subsidies.js');
const { getAllEligibleSubsidies } = require('./src/logic/eligibility.js');
const { findOptimalSubsidy, generateAllCalculations, compareSubsidies } = require('./src/logic/optimizer.js');
const { exportToExcel, exportToPDF, generateFileName } = require('./src/export/exporter.js');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: 지역/업종 목록
app.get('/api/options', (req, res) => {
    res.json({
        regions: REGION_TYPES,
        industries: INDUSTRY_TYPES,
        regionTypes: ['수도권', '일반비수도권', '우대지원지역', '특별지원지역']
    });
});

// API: 지원금 분석
app.post('/api/analyze', (req, res) => {
    try {
        const companyData = req.body;

        // 기본값 설정
        companyData.applicantType = companyData.applicantType || 'company';

        const eligibilityResult = getAllEligibleSubsidies(SUBSIDIES, companyData);

        let optimal = null;
        let calculations = [];
        let comparison = [];

        if (eligibilityResult.eligible.length > 0) {
            calculations = generateAllCalculations(eligibilityResult.eligible, companyData);
            comparison = compareSubsidies(eligibilityResult.eligible, companyData);
            optimal = findOptimalSubsidy(eligibilityResult.eligible, companyData);
        }

        res.json({
            success: true,
            companyData,
            eligibility: {
                eligible: eligibilityResult.eligible.map(s => ({
                    id: s.id,
                    name: s.name,
                    description: s.description,
                    documentGuide: s.documentGuide
                })),
                notEligible: eligibilityResult.notEligible
            },
            calculations,
            comparison,
            optimal
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Excel 내보내기
app.post('/api/export/excel', async (req, res) => {
    try {
        const { companyData, eligibilityResult, optimal } = req.body;

        const fileName = generateFileName('고용지원금_분석결과', 'xlsx');
        const filePath = path.join(__dirname, 'exports', fileName);

        // exports 폴더 생성
        if (!fs.existsSync(path.join(__dirname, 'exports'))) {
            fs.mkdirSync(path.join(__dirname, 'exports'));
        }

        exportToExcel(companyData, eligibilityResult, optimal, filePath);

        res.download(filePath, fileName, (err) => {
            if (err) console.error('Download error:', err);
            // 다운로드 후 파일 삭제
            setTimeout(() => {
                fs.unlink(filePath, () => {});
            }, 5000);
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: PDF 내보내기
app.post('/api/export/pdf', async (req, res) => {
    try {
        const { companyData, eligibilityResult, optimal } = req.body;

        const fileName = generateFileName('고용지원금_분석결과', 'pdf');
        const filePath = path.join(__dirname, 'exports', fileName);

        // exports 폴더 생성
        if (!fs.existsSync(path.join(__dirname, 'exports'))) {
            fs.mkdirSync(path.join(__dirname, 'exports'));
        }

        await exportToPDF(companyData, eligibilityResult, optimal, filePath);

        res.download(filePath, fileName, (err) => {
            if (err) console.error('Download error:', err);
            // 다운로드 후 파일 삭제
            setTimeout(() => {
                fs.unlink(filePath, () => {});
            }, 5000);
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 고용지원금 최적화 시스템 서버 시작`);
    console.log(`   http://localhost:${PORT}\n`);
});
