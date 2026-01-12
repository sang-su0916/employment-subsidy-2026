function renderRecommendation(optimal, allCalculations, notEligible) {
    const resultsDiv = document.getElementById('results');
    
    if (!optimal || optimal.subsidies.length === 0) {
        resultsDiv.innerHTML = `
            <div class="recommendation" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <h2>❌ 신청 가능한 지원금이 없습니다</h2>
                <p>현재 입력하신 정보로는 신청 가능한 고용지원금이 없습니다.</p>
                <p>아래에서 각 지원금의 미충족 요건을 확인하세요.</p>
            </div>
            ${renderNotEligibleList(notEligible)}
        `;
        return;
    }

    const recommendationHtml = `
        <div class="recommendation">
            <h2>🎉 최적 지원금 조합 추천</h2>
            <p>귀사에 가장 유리한 조합입니다</p>
            <div class="amount">총 ${optimal.totalAmount.toLocaleString()}원</div>
            <p>${optimal.count}개 프로그램 조합</p>
            
            <div class="details-section">
                <h3>📋 추천 조합 상세</h3>
                ${optimal.subsidies.map(calc => `
                    <div class="detail-item">
                        <strong>${calc.subsidy.name}</strong><br>
                        <span style="color: #11998e; font-size: 1.2em; font-weight: 600;">
                            ${calc.totalAmount.toLocaleString()}원
                        </span><br>
                        <small style="color: #666;">${calc.details}</small>
                    </div>
                `).join('')}
            </div>

            <div class="details-section">
                <h3>📄 필요 서류</h3>
                ${getUniqueDocuments(optimal.subsidies).map(doc => `
                    <div class="detail-item">✓ ${doc}</div>
                `).join('')}
            </div>
        </div>
    `;

    const comparisonHtml = renderComparisonTable(allCalculations);
    const notEligibleHtml = renderNotEligibleList(notEligible);

    resultsDiv.innerHTML = recommendationHtml + comparisonHtml + notEligibleHtml + `
        <button class="btn print-btn" onclick="window.print()">🖨️ 결과 인쇄</button>
    `;
}

function renderComparisonTable(calculations) {
    if (!calculations || calculations.length === 0) {
        return '';
    }

    const compared = compareSubsidies(calculations);

    return `
        <div class="comparison-table">
            <h3 style="padding: 20px; color: #2a5298; font-size: 1.5em;">💰 전체 지원금 비교</h3>
            <table>
                <thead>
                    <tr>
                        <th>순위</th>
                        <th>지원금명</th>
                        <th>카테고리</th>
                        <th>예상 지원액</th>
                        <th>월평균</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    ${compared.map(calc => `
                        <tr>
                            <td><strong>${calc.rank}</strong></td>
                            <td>${calc.subsidy.name}</td>
                            <td>${calc.subsidy.category}</td>
                            <td><strong>${calc.totalAmount.toLocaleString()}원</strong></td>
                            <td>${calc.monthlyAverage.toLocaleString()}원/월</td>
                            <td>
                                <span class="status-badge ${calc.rank === 1 ? 'status-recommended' : 'status-eligible'}">
                                    ${calc.rank === 1 ? '최고 추천' : '신청 가능'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderNotEligibleList(notEligible) {
    if (!notEligible || notEligible.length === 0) {
        return '';
    }

    return `
        <div class="details-section" style="background: #fff3cd; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404;">⚠️ 신청 불가 지원금 (${notEligible.length}개)</h3>
            ${notEligible.map(item => `
                <div class="detail-item">
                    <strong>${item.subsidy.name}</strong>
                    <span class="status-badge status-not-eligible" style="margin-left: 10px;">신청 불가</span>
                    <br>
                    <small style="color: #856404;">
                        미충족 요건: ${item.reasons.join(', ')}
                    </small>
                </div>
            `).join('')}
        </div>
    `;
}

function getUniqueDocuments(calculations) {
    const allDocs = new Set();
    calculations.forEach(calc => {
        if (calc.subsidy.requiredDocuments) {
            calc.subsidy.requiredDocuments.forEach(doc => allDocs.add(doc));
        }
    });
    return Array.from(allDocs);
}

function showLoading() {
    document.getElementById('loading').classList.add('show');
    document.getElementById('results').classList.remove('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('results').classList.add('show');
}
