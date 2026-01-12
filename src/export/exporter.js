const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * 결과를 엑셀 파일로 내보내기
 */
function exportToExcel(companyData, eligibilityResult, optimalResult, outputPath) {
    const workbook = XLSX.utils.book_new();

    // 1. 회사 정보 시트
    const companySheet = [
        ['2026년 고용지원금 최적화 결과'],
        [''],
        ['기본 정보'],
        ['항목', '값'],
        ['지역', companyData.region || '미입력'],
        ['업종', companyData.industry || '미입력'],
        ['총 직원 수', companyData.totalEmployees || 0],
        [''],
        ['직원 구성'],
        ['청년 (15~34세)', companyData.youthEmployees || 0],
        ['중장년 (50~59세)', companyData.middleAgedEmployees || 0],
        ['고령자 (60세+)', companyData.seniorEmployees || 0],
        ['장애인', companyData.disabledEmployees || 0],
        ['중증장애인', companyData.severeDisabledEmployees || 0],
        ['비정규직 (전환예정)', companyData.nonRegularEmployees || 0],
        ['육아기 근로자', companyData.childcareWorkers || 0],
        [''],
        ['추가 조건'],
        ['정년 규정', companyData.hasRetirementAge ? '있음' : '없음'],
        ['장애인 의무고용률 초과', companyData.exceedsDisabledQuota ? '예' : '아니오']
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(companySheet);
    ws1['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, ws1, '회사정보');

    // 2. 수급 가능 지원금 시트
    const eligibleData = [
        ['수급 가능 지원금 목록'],
        [''],
        ['지원금명', '설명', '예상 금액', '신청 방법']
    ];

    if (optimalResult && optimalResult.subsidies) {
        optimalResult.subsidies.forEach(item => {
            eligibleData.push([
                item.subsidy.name,
                item.subsidy.description,
                item.totalAmount,
                item.subsidy.documentGuide?.applicationMethod || '고용센터 문의'
            ]);
        });

        eligibleData.push(['']);
        eligibleData.push(['총 예상 수급액', '', optimalResult.totalAmount, '']);
        eligibleData.push(['연간 환산', '', Math.round(optimalResult.totalAmount / 3), '']);
    }

    const ws2 = XLSX.utils.aoa_to_sheet(eligibleData);
    ws2['!cols'] = [{ wch: 30 }, { wch: 50 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, ws2, '수급가능지원금');

    // 3. 수급 불가 지원금 시트
    const ineligibleData = [
        ['수급 불가 지원금 및 사유'],
        [''],
        ['지원금명', '미충족 사유']
    ];

    if (eligibilityResult && eligibilityResult.notEligible) {
        eligibilityResult.notEligible.forEach(item => {
            const reasons = item.reasons.join(', ');
            ineligibleData.push([item.subsidy.name, reasons]);
        });
    }

    const ws3 = XLSX.utils.aoa_to_sheet(ineligibleData);
    ws3['!cols'] = [{ wch: 30 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(workbook, ws3, '수급불가사유');

    // 4. 상세 계산 시트
    const detailData = [
        ['지원금별 상세 계산'],
        [''],
        ['지원금명', '계산 내역', '금액']
    ];

    if (optimalResult && optimalResult.subsidies) {
        optimalResult.subsidies.forEach(item => {
            detailData.push([
                item.subsidy.name,
                item.details || '상세 내역 없음',
                item.totalAmount
            ]);
        });
    }

    const ws4 = XLSX.utils.aoa_to_sheet(detailData);
    ws4['!cols'] = [{ wch: 30 }, { wch: 60 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, ws4, '상세계산');

    // 파일 저장
    XLSX.writeFile(workbook, outputPath);
    return outputPath;
}

/**
 * 결과를 PDF 파일로 내보내기
 */
function exportToPDF(companyData, eligibilityResult, optimalResult, outputPath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: '2026년 고용지원금 최적화 결과',
                Author: '고용지원금 최적화 시스템'
            }
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // 한글 폰트 설정 (시스템 폰트 사용)
        const fontPath = '/System/Library/Fonts/Supplemental/AppleGothic.ttf';
        if (fs.existsSync(fontPath)) {
            doc.registerFont('Korean', fontPath);
            doc.font('Korean');
        }

        // 헤더
        doc.fontSize(24).text('2026년 고용지원금 최적화 결과', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).fillColor('#666666').text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, { align: 'center' });
        doc.moveDown(2);

        // 회사 정보
        doc.fontSize(16).fillColor('#000000').text('1. 회사 정보', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(11);
        const companyInfo = [
            ['지역', companyData.region || '미입력'],
            ['업종', companyData.industry || '미입력'],
            ['총 직원 수', `${companyData.totalEmployees || 0}명`],
            ['청년 (15~34세)', `${companyData.youthEmployees || 0}명`],
            ['고령자 (60세+)', `${companyData.seniorEmployees || 0}명`],
            ['중장년 (50~59세)', `${companyData.middleAgedEmployees || 0}명`],
            ['장애인', `${companyData.disabledEmployees || 0}명`],
            ['육아기 근로자', `${companyData.childcareWorkers || 0}명`]
        ];

        companyInfo.forEach(([label, value]) => {
            doc.text(`  ${label}: ${value}`);
        });
        doc.moveDown(1.5);

        // 수급 가능 지원금
        doc.fontSize(16).text('2. 수급 가능 지원금', { underline: true });
        doc.moveDown(0.5);

        if (optimalResult && optimalResult.subsidies && optimalResult.subsidies.length > 0) {
            doc.fontSize(12).fillColor('#006400');
            doc.text(`총 ${optimalResult.subsidies.length}개 지원금 수급 가능`);
            doc.moveDown(0.5);

            doc.fontSize(11).fillColor('#000000');
            optimalResult.subsidies.forEach((item, index) => {
                doc.text(`${index + 1}. ${item.subsidy.name}`, { continued: false });
                doc.fontSize(10).fillColor('#333333');
                doc.text(`   예상 금액: ${item.totalAmount.toLocaleString()}원`);
                doc.text(`   산출 내역: ${item.details || '상세 내역 없음'}`);
                doc.text(`   신청 방법: ${item.subsidy.documentGuide?.applicationMethod || '고용센터 문의'}`);
                doc.moveDown(0.5);
                doc.fontSize(11).fillColor('#000000');
            });

            doc.moveDown(0.5);
            doc.fontSize(14).fillColor('#0000AA');
            doc.text(`총 예상 수급액: ${optimalResult.totalAmount.toLocaleString()}원`, { align: 'center' });
            doc.fontSize(11).fillColor('#666666');
            doc.text(`연간 환산: 약 ${Math.round(optimalResult.totalAmount / 3).toLocaleString()}원/년`, { align: 'center' });
        } else {
            doc.fontSize(11).fillColor('#AA0000');
            doc.text('수급 가능한 지원금이 없습니다.');
        }
        doc.moveDown(1.5);

        // 수급 불가 지원금
        doc.fillColor('#000000');
        doc.fontSize(16).text('3. 수급 불가 지원금 및 사유', { underline: true });
        doc.moveDown(0.5);

        if (eligibilityResult && eligibilityResult.notEligible && eligibilityResult.notEligible.length > 0) {
            doc.fontSize(11);
            eligibilityResult.notEligible.forEach((item, index) => {
                doc.fillColor('#AA0000').text(`${index + 1}. ${item.subsidy.name}`);
                doc.fillColor('#666666').fontSize(10);
                item.reasons.forEach(reason => {
                    doc.text(`   - ${reason}`);
                });
                doc.moveDown(0.3);
                doc.fontSize(11);
            });
        } else {
            doc.fontSize(11).text('모든 지원금 수급 가능');
        }

        // 푸터
        doc.moveDown(2);
        doc.fontSize(9).fillColor('#999999');
        doc.text('※ 본 결과는 참고용이며, 실제 수급 여부는 고용센터 심사를 통해 결정됩니다.', { align: 'center' });
        doc.text('※ 지원금은 예산 소진 시 조기 마감될 수 있습니다.', { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

/**
 * 파일명 생성 (날짜 포함)
 */
function generateFileName(prefix, extension) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    return `${prefix}_${dateStr}_${timeStr}.${extension}`;
}

module.exports = {
    exportToExcel,
    exportToPDF,
    generateFileName
};
