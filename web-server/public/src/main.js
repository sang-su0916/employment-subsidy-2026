document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('subsidyForm');
    const businessNumberInput = document.getElementById('businessNumber');

    businessNumberInput.addEventListener('input', function(e) {
        e.target.value = formatBusinessNumber(e.target.value);
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        showLoading();

        setTimeout(() => {
            processSubsidyApplication();
        }, 500);
    });
});

function processSubsidyApplication() {
    const formData = collectFormData();

    const validationErrors = validateFormData(formData);
    
    if (validationErrors.length > 0) {
        hideLoading();
        alert('입력 오류:\n\n' + validationErrors.join('\n'));
        return;
    }

    const companyData = prepareCompanyData(formData);

    const subsidies = getSubsidies();
    if (!subsidies || subsidies.length === 0) {
        hideLoading();
        alert('지원금 데이터를 로드할 수 없습니다. 페이지를 새로고침해주세요.');
        return;
    }

    const { eligible, notEligible } = getAllEligibleSubsidies(subsidies, companyData);

    const allCalculations = generateAllCalculations(eligible, companyData);

    const optimal = findOptimalSubsidy(eligible, companyData);

    hideLoading();
    renderRecommendation(optimal, allCalculations, notEligible);

    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function collectFormData() {
    return {
        businessNumber: sanitizeInput(document.getElementById('businessNumber').value),
        companyName: sanitizeInput(document.getElementById('companyName').value),
        industry: sanitizeInput(document.getElementById('industry').value),
        companySize: sanitizeInput(document.getElementById('companySize').value),
        totalEmployees: parseInt(document.getElementById('totalEmployees').value) || 0,
        insuredEmployees: parseInt(document.getElementById('insuredEmployees').value) || 0,
        youthEmployees: parseInt(document.getElementById('youthEmployees').value) || 0,
        seniorEmployees: parseInt(document.getElementById('seniorEmployees').value) || 0,
        disabledEmployees: parseInt(document.getElementById('disabledEmployees').value) || 0,
        avgWage: parseInt(document.getElementById('avgWage').value) || 0,
        newHires: parseInt(document.getElementById('newHires').value) || 0,
        employmentPeriod: parseInt(document.getElementById('employmentPeriod').value) || 0
    };
}

function prepareCompanyData(formData) {
    return {
        businessNumber: formData.businessNumber,
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        totalEmployees: formData.totalEmployees,
        insuredEmployees: formData.insuredEmployees,
        youthEmployees: formData.youthEmployees,
        seniorEmployees: formData.seniorEmployees,
        disabledEmployees: formData.disabledEmployees,
        avgWage: formData.avgWage,
        newHires: formData.newHires,
        employmentPeriod: formData.employmentPeriod,
        hasBusinessDifficulty: false,
        hiringUnemployed: false
    };
}
