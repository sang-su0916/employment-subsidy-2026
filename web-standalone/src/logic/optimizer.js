function calculateSubsidyAmount(subsidy, companyData) {
    const { calculation } = subsidy;
    let totalAmount = 0;
    let details = [];

    if (calculation.type === 'per-employee-monthly') {
        let monthlyAmount = calculation.baseAmount;
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
        }

        const months = calculation.maxMonths || 12;
        totalAmount = monthlyAmount * applicableEmployees * months;

        details.push(`월 ${monthlyAmount.toLocaleString()}원 × ${applicableEmployees}명 × ${months}개월`);

    } else if (calculation.type === 'per-employee-quarterly') {
        let applicableEmployees = 1;

        if (subsidy.eligibility.requiredEmployeeTypes && subsidy.eligibility.requiredEmployeeTypes.includes('고령자')) {
            applicableEmployees = companyData.seniorEmployees || 1;
        }

        const quarters = calculation.maxQuarters || 4;
        totalAmount = calculation.quarterlyAmount * applicableEmployees * quarters;

        details.push(`분기당 ${calculation.quarterlyAmount.toLocaleString()}원 × ${applicableEmployees}명 × ${quarters}분기`);

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

    } else if (calculation.type === 'job-seeker-support') {
        totalAmount = 0;
        details.push('구직자 대상 (기업 지원 아님)');
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
