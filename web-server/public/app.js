// API Base URL
const API_BASE = '';

// State
let currentResults = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadOptions();
    setupEventListeners();
    setupRegionAutoDetect();
});

// Load region and industry options
async function loadOptions() {
    try {
        const response = await fetch(`${API_BASE}/api/options`);
        const data = await response.json();

        const regionSelect = document.getElementById('region');
        data.regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });

        const industrySelect = document.getElementById('industry');
        data.industries.forEach(industry => {
            const option = document.createElement('option');
            option.value = industry;
            option.textContent = industry;
            industrySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load options:', error);
    }
}

// Auto-detect region type based on region selection
function setupRegionAutoDetect() {
    const regionSelect = document.getElementById('region');
    const regionTypeSelect = document.getElementById('regionType');

    const metropolitanRegions = ['서울', '인천', '경기'];

    regionSelect.addEventListener('change', (e) => {
        const region = e.target.value;
        if (metropolitanRegions.includes(region)) {
            regionTypeSelect.value = '수도권';
        } else if (region) {
            regionTypeSelect.value = '일반비수도권';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('companyForm');
    form.addEventListener('submit', handleSubmit);
    form.addEventListener('reset', handleReset);

    document.getElementById('exportExcel').addEventListener('click', () => exportFile('excel'));
    document.getElementById('exportPdf').addEventListener('click', () => exportFile('pdf'));
}

// Handle form reset
function handleReset(e) {
    // 결과 섹션 숨기기
    const resultsSection = document.getElementById('results');
    resultsSection.classList.add('hidden');
    resultsSection.innerHTML = '';

    // 상태 초기화
    currentResults = null;

    // 지역 유형 기본값으로 복원
    document.getElementById('regionType').value = '수도권';
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();

    const companyData = {
        totalEmployees: parseInt(document.getElementById('totalEmployees').value) || 0,
        region: document.getElementById('region').value,
        regionType: document.getElementById('regionType').value,
        industry: document.getElementById('industry').value,
        youthEmployees: parseInt(document.getElementById('youthEmployees').value) || 0,
        middleAgedEmployees: parseInt(document.getElementById('middleAgedEmployees').value) || 0,
        seniorEmployees: parseInt(document.getElementById('seniorEmployees').value) || 0,
        disabledEmployees: parseInt(document.getElementById('disabledEmployees').value) || 0,
        severeDisabledEmployees: parseInt(document.getElementById('severeDisabledEmployees').value) || 0,
        childcareWorkers: parseInt(document.getElementById('childcareWorkers').value) || 0,
        nonRegularEmployees: parseInt(document.getElementById('nonRegularEmployees').value) || 0,
        wageIncrease: parseInt(document.getElementById('wageIncrease').value) || 0,
        hasRetirementAge: document.getElementById('hasRetirementAge').checked,
        exceedsDisabledQuota: document.getElementById('exceedsDisabledQuota').checked,
        hasSevereDisabled: document.getElementById('hasSevereDisabled').checked
    };

    // Show loading
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('hidden');
    resultsSection.innerHTML = '<div class="loading"></div>';

    try {
        const response = await fetch(`${API_BASE}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData)
        });

        const data = await response.json();

        if (data.success) {
            currentResults = data;
            renderResults(data);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        resultsSection.innerHTML = `
            <div style="text-align: center; color: #dc2626; padding: 40px;">
                <p>오류가 발생했습니다: ${error.message}</p>
            </div>
        `;
    }

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Render results
function renderResults(data) {
    const resultsSection = document.getElementById('results');

    resultsSection.innerHTML = `
        <div class="results-header">
            <h2>📊 분석 결과</h2>
            <div class="export-buttons">
                <button id="exportExcel" class="btn btn-export">📥 Excel 다운로드</button>
                <button id="exportPdf" class="btn btn-export">📄 PDF 다운로드</button>
            </div>
        </div>

        <div id="summary" class="summary-card"></div>

        <div class="results-grid">
            <div id="eligibleList" class="result-card">
                <h3>✅ 수급 가능 지원금 (${data.eligibility.eligible.length}개)</h3>
                <div class="card-content"></div>
            </div>
            <div id="notEligibleList" class="result-card">
                <h3>❌ 수급 불가 지원금 (${data.eligibility.notEligible.length}개)</h3>
                <div class="card-content"></div>
            </div>
        </div>

        <div id="comparison" class="comparison-section">
            <h3>📈 지원금 비교</h3>
            <div class="chart-container"></div>
        </div>

        <div id="optimal" class="optimal-section">
            <h3>🏆 최적 조합 추천</h3>
            <div class="optimal-content"></div>
        </div>
    `;

    // Re-attach event listeners
    document.getElementById('exportExcel').addEventListener('click', () => exportFile('excel'));
    document.getElementById('exportPdf').addEventListener('click', () => exportFile('pdf'));

    renderSummary(data);
    renderEligibleList(data);
    renderNotEligibleList(data);
    renderComparison(data);
    renderOptimal(data);
}

// Render summary
function renderSummary(data) {
    const summary = document.getElementById('summary');
    const total = data.optimal?.totalAmount || 0;
    const yearly = Math.round(total / 3);
    const monthly = Math.round(yearly / 12);

    summary.innerHTML = `
        <div class="summary-title">총 예상 수급액</div>
        <div class="total-amount">${formatCurrency(total)}원</div>
        <div class="breakdown">
            <div class="breakdown-item">
                <div class="value">${formatCurrency(yearly)}원</div>
                <div class="label">연간 환산</div>
            </div>
            <div class="breakdown-item">
                <div class="value">${formatCurrency(monthly)}원</div>
                <div class="label">월간 환산</div>
            </div>
            <div class="breakdown-item">
                <div class="value">${data.eligibility.eligible.length}개</div>
                <div class="label">수급 가능 지원금</div>
            </div>
        </div>
    `;
}

// Render eligible list
function renderEligibleList(data) {
    const container = document.querySelector('#eligibleList .card-content');

    if (data.calculations.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center;">수급 가능한 지원금이 없습니다.</p>';
        return;
    }

    container.innerHTML = data.calculations.map(calc => `
        <div class="subsidy-item">
            <div class="name">${calc.subsidy.name}</div>
            <div class="description">${calc.subsidy.description}</div>
            <div class="amount">${formatCurrency(calc.totalAmount)}원</div>
            <div class="details" style="font-size: 0.8rem; color: #6b7280; margin-top: 5px;">
                ${calc.details}
            </div>
        </div>
    `).join('');
}

// Render not eligible list
function renderNotEligibleList(data) {
    const container = document.querySelector('#notEligibleList .card-content');

    if (data.eligibility.notEligible.length === 0) {
        container.innerHTML = '<p style="color: #16a34a; text-align: center;">모든 지원금 수급 가능!</p>';
        return;
    }

    container.innerHTML = data.eligibility.notEligible.map(item => `
        <div class="subsidy-item not-eligible">
            <div class="name">${item.subsidy.name}</div>
            <div class="reasons">
                <ul>
                    ${item.reasons.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

// Render comparison chart
function renderComparison(data) {
    const container = document.querySelector('#comparison .chart-container');

    if (data.comparison.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center;">비교할 지원금이 없습니다.</p>';
        return;
    }

    const maxAmount = Math.max(...data.comparison.map(c => c.totalAmount));

    container.innerHTML = data.comparison.map(item => {
        const percentage = (item.totalAmount / maxAmount) * 100;
        return `
            <div class="chart-bar">
                <div class="label">${item.subsidy.name}</div>
                <div class="bar-wrapper">
                    <div class="bar" style="width: ${percentage}%">
                        ${percentage > 20 ? Math.round(percentage) + '%' : ''}
                    </div>
                </div>
                <div class="amount">${formatCurrency(item.totalAmount)}원</div>
            </div>
        `;
    }).join('');
}

// Render optimal combination
function renderOptimal(data) {
    const container = document.querySelector('#optimal .optimal-content');

    if (!data.optimal || data.optimal.combination.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center;">추천할 조합이 없습니다.</p>';
        return;
    }

    container.innerHTML = data.optimal.combination.map(item => `
        <div class="optimal-item">
            <div class="info">
                <div class="name">${item.subsidy.name}</div>
                <div class="details">${item.details}</div>
            </div>
            <div class="amount">${formatCurrency(item.totalAmount)}원</div>
            <div class="application">
                📝 신청: ${item.subsidy.documentGuide?.applicationMethod || '고용센터 문의'}
            </div>
        </div>
    `).join('');
}

// Export file
async function exportFile(type) {
    if (!currentResults) {
        alert('먼저 분석을 실행해주세요.');
        return;
    }

    const btn = document.getElementById(type === 'excel' ? 'exportExcel' : 'exportPdf');
    const originalText = btn.textContent;
    btn.textContent = '⏳ 생성 중...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/export/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyData: currentResults.companyData,
                eligibilityResult: {
                    eligible: currentResults.eligibility.eligible,
                    notEligible: currentResults.eligibility.notEligible
                },
                optimal: currentResults.optimal
            })
        });

        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `고용지원금_분석결과.${type === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        alert('파일 생성에 실패했습니다: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount);
}
