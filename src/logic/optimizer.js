const { generateCompatibleCombinations } = require('./eligibility.js');

function calculateSubsidyAmount(subsidy, companyData) {
    const { calculation } = subsidy;
    let totalAmount = 0;
    let details = [];

    // calculation이 없는 경우 amount 구조에서 계산
    if (!calculation) {
        if (subsidy.amount && subsidy.amount.perPerson) {
            const amount = subsidy.amount.perPerson;
            totalAmount = amount.total || (amount.monthly * amount.duration) || 0;
            details.push(`월 ${(amount.monthly || 0).toLocaleString()}원 × ${amount.duration || 12}개월`);
        }
        return {
            totalAmount: Math.round(totalAmount),
            monthlyAverage: 0,
            details: details.join(', '),
            subsidy
        };
    }

    // 2026 new type: regional-differentiated-2026 (청년일자리도약장려금)
    if (calculation.type === 'regional-differentiated-2026') {
        const youthCount = companyData.youthEmployees || 0;
        const region = companyData.region || '수도권';

        // Company support (same for all regions)
        const companyAmount = calculation.company.totalAmount || 7200000;

        // Youth direct support (varies by region)
        let youthAmount = 0;
        let regionKey = '수도권';

        // 지역 매핑
        if (region === '수도권' || ['서울', '인천', '경기'].some(r => region.includes(r))) {
            regionKey = '수도권';
        } else if (companyData.regionType === '특별지원지역' || companyData.isSpecialRegion) {
            regionKey = '특별지원지역';
        } else if (companyData.regionType === '우대지원지역' || companyData.isPriorityRegion) {
            regionKey = '우대지원지역';
        } else {
            regionKey = '일반비수도권';
        }

        if (calculation.youth && calculation.youth[regionKey]) {
            youthAmount = calculation.youth[regionKey].totalAmount || 0;
        }

        const companyTotal = companyAmount * youthCount;
        const youthTotal = youthAmount * youthCount;
        totalAmount = companyTotal + youthTotal;

        details.push(`기업 지원: ${companyTotal.toLocaleString()}원 (월 60만원 × ${youthCount}명 × 12개월)`);
        if (youthAmount > 0) {
            details.push(`청년 직접지원: ${youthTotal.toLocaleString()}원 (${regionKey}, 인당 ${youthAmount.toLocaleString()}원)`);
        } else {
            details.push(`청년 직접지원: 수도권은 해당 없음`);
        }

    // 2026 new type: regional-differentiated-quarterly (고령자계속고용장려금)
    } else if (calculation.type === 'regional-differentiated-quarterly') {
        const seniorCount = companyData.seniorEmployees || 0;
        const region = companyData.region || '수도권';

        // 지역 키 결정
        let regionKey = '수도권';
        if (region !== '수도권' && !['서울', '인천', '경기'].some(r => region.includes(r))) {
            regionKey = '비수도권';
        }

        if (calculation[regionKey]) {
            totalAmount = calculation[regionKey].totalAmount * seniorCount;
            details.push(`월 ${calculation[regionKey].monthlyAmount.toLocaleString()}원 × ${seniorCount}명 × 36개월 (${regionKey})`);
        } else if (calculation['수도권']) {
            totalAmount = calculation['수도권'].totalAmount * seniorCount;
            details.push(`월 ${calculation['수도권'].monthlyAmount.toLocaleString()}원 × ${seniorCount}명 × 36개월 (수도권)`);
        }

    // 2026 new type: per-employee-monthly-by-gender (중증장애인고용개선장려금)
    } else if (calculation.type === 'per-employee-monthly-by-gender') {
        const disabledCount = companyData.disabledEmployees || 0;
        // For simplicity, assume mixed gender, average the amounts
        const maleAmount = calculation['중증남성'] ? calculation['중증남성'].totalAmount : 0;
        const femaleAmount = calculation['중증여성'] ? calculation['중증여성'].totalAmount : 0;
        const avgAmount = (maleAmount + femaleAmount) / 2;
        
        totalAmount = avgAmount * disabledCount;
        details.push(`중증장애인 ${disabledCount}명 × 연 ${Math.round(avgAmount).toLocaleString()}원 (남성: ${maleAmount.toLocaleString()}, 여성: ${femaleAmount.toLocaleString()})`);

    // 2026 new type: monthly-based-on-wage-increase (정규직 전환 지원금)
    } else if (calculation.type === 'monthly-based-on-wage-increase') {
        const conversionCount = companyData.regularConversions || companyData.nonRegularEmployees || 1;
        const wageIncrease = companyData.wageIncrease || 0;

        let monthlyAmount;
        let wageCategory;
        if (wageIncrease >= 200000 && calculation['임금20만원이상인상']) {
            monthlyAmount = calculation['임금20만원이상인상'].monthlyAmount;
            wageCategory = '임금 20만원 이상 인상';
        } else if (calculation['그외']) {
            monthlyAmount = calculation['그외'].monthlyAmount;
            wageCategory = '기본 지원';
        } else {
            monthlyAmount = 400000;
            wageCategory = '기본 지원';
        }

        const maxMonths = 12;
        totalAmount = monthlyAmount * conversionCount * maxMonths;
        details.push(`월 ${monthlyAmount.toLocaleString()}원 × ${conversionCount}명 × ${maxMonths}개월 (${wageCategory})`);

    // 2026 new type: milestone-based (일손부족일자리 동행인센티브)
    } else if (calculation.type === 'milestone-based') {
        // 50세 이상 중장년 채용 인원
        const eligibleWorkers = companyData.middleAgedEmployees || companyData.seniorEmployees || 0;
        totalAmount = calculation.totalAmount * eligibleWorkers;

        if (calculation.milestones && calculation.milestones.length > 0) {
            const milestoneDetails = calculation.milestones.map(m =>
                `${m.months}개월: ${m.amount.toLocaleString()}원`
            ).join(', ');
            details.push(`${eligibleWorkers}명 × (${milestoneDetails}) = ${totalAmount.toLocaleString()}원`);
        } else {
            details.push(`${calculation.totalAmount.toLocaleString()}원 × ${eligibleWorkers}명`);
        }

    // 2026 new type: monthly-jobseeker-support (구직자 대상)
    } else if (calculation.type === 'monthly-jobseeker-support') {
        totalAmount = 0;
        details.push('구직자 대상 (기업 지원 아님)');

    // Legacy type: per-employee-monthly
    } else if (calculation.type === 'per-employee-monthly') {
        let monthlyAmount = calculation.monthlyAmount || calculation.baseAmount || 300000;
        let applicableEmployees = 1;

        if (calculation.conditions && calculation.conditions.length > 0) {
            for (const condition of calculation.conditions) {
                if (condition.companySize === companyData.companySize) {
                    monthlyAmount = condition.monthlyAmount;
                    break;
                }
            }
        }

        if (subsidy.eligibility.requiredEmployeeTypes && subsidy.eligibility.requiredEmployeeTypes.includes('청년')) {
            applicableEmployees = companyData.youthEmployees || 1;
        } else if (subsidy.eligibility.requiredEmployeeTypes && subsidy.eligibility.requiredEmployeeTypes.includes('고령자')) {
            applicableEmployees = companyData.seniorEmployees || 1;
        } else if (subsidy.eligibility.requiredEmployeeTypes && subsidy.eligibility.requiredEmployeeTypes.includes('장애인')) {
            applicableEmployees = companyData.disabledEmployees || 1;
        } else if (subsidy.eligibility.requiredEmployeeTypes && subsidy.eligibility.requiredEmployeeTypes.includes('50세 이상 중장년')) {
            applicableEmployees = companyData.seniorEmployees || 1;
        }

        const months = calculation.maxMonths || 12;
        totalAmount = monthlyAmount * applicableEmployees * months;

        details.push(`월 ${monthlyAmount.toLocaleString()}원 × ${applicableEmployees}명 × ${months}개월`);

    // Legacy type: per-employee-quarterly
    } else if (calculation.type === 'per-employee-quarterly') {
        let applicableEmployees = 1;

        if (subsidy.eligibility.requiredEmployeeTypes && subsidy.eligibility.requiredEmployeeTypes.includes('고령자')) {
            applicableEmployees = companyData.seniorEmployees || 1;
        }

        const quarters = calculation.maxQuarters || 4;
        totalAmount = calculation.quarterlyAmount * applicableEmployees * quarters;

        details.push(`분기당 ${calculation.quarterlyAmount.toLocaleString()}원 × ${applicableEmployees}명 × ${quarters}분기`);

    // Legacy type: wage-compensation
    } else if (calculation.type === 'wage-compensation') {
        const applicableEmployees = companyData.totalEmployees;
        let compensationRate = 0.67;
        let maxDailyAmount = 66000;

        if (calculation.conditions && calculation.conditions.length > 0) {
            for (const condition of calculation.conditions) {
                if (condition.companySize === companyData.companySize || 
                    (condition.companySize === '우선지원대상기업' && companyData.totalEmployees < 500)) {
                    compensationRate = condition.compensationRate;
                    maxDailyAmount = condition.maxDailyAmount;
                    break;
                }
            }
        }

        const days = calculation.maxDays || 90;
        const dailyWage = companyData.avgWage / 30;
        const compensatedAmount = Math.min(dailyWage * compensationRate, maxDailyAmount);
        
        totalAmount = compensatedAmount * applicableEmployees * days;

        details.push(`일일 ${Math.round(compensatedAmount).toLocaleString()}원 × ${applicableEmployees}명 × ${days}일`);

    // Legacy type: job-seeker-support
    } else if (calculation.type === 'job-seeker-support') {
        totalAmount = 0;
        details.push('구직자 대상 (기업 지원 아님)');
    
    // Unknown type
    } else {
        totalAmount = 0;
        details.push(`알 수 없는 계산 유형: ${calculation.type}`);
    }

    return {
        totalAmount: Math.round(totalAmount),
        monthlyAverage: calculation.maxMonths ? Math.round(totalAmount / calculation.maxMonths) : 0,
        details: details.join(', '),
        subsidy
    };
}

function findOptimalSubsidy(eligibleSubsidies, companyData) {
    if (!eligibleSubsidies || eligibleSubsidies.length === 0) {
        return null;
    }

    const compatibleCombinations = generateCompatibleCombinations(eligibleSubsidies);

    let bestCombination = null;
    let maxTotalAmount = 0;

    for (const combination of compatibleCombinations) {
        let combinationTotal = 0;
        const calculatedSubsidies = [];

        for (const subsidy of combination) {
            const calculated = calculateSubsidyAmount(subsidy, companyData);
            calculatedSubsidies.push(calculated);
            combinationTotal += calculated.totalAmount;
        }

        if (combinationTotal > maxTotalAmount) {
            maxTotalAmount = combinationTotal;
            bestCombination = {
                subsidies: calculatedSubsidies,
                totalAmount: combinationTotal,
                count: combination.length
            };
        }
    }

    return bestCombination;
}

function generateAllCalculations(eligibleSubsidies, companyData) {
    return eligibleSubsidies.map(subsidy => calculateSubsidyAmount(subsidy, companyData));
}

function compareSubsidies(calculations) {
    const sorted = [...calculations].sort((a, b) => b.totalAmount - a.totalAmount);

    return sorted.map((calc, index) => ({
        ...calc,
        rank: index + 1,
        percentageOfBest: sorted.length > 0 ? (calc.totalAmount / sorted[0].totalAmount) * 100 : 0
    }));
}

module.exports = {
    calculateSubsidyAmount,
    findOptimalSubsidy,
    generateAllCalculations,
    compareSubsidies
};
