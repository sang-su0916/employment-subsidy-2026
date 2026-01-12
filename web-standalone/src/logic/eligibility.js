function checkEligibility(subsidy, companyData) {
    const { eligibility } = subsidy;
    const reasons = [];
    let isEligible = true;

    if (eligibility.minEmployees !== null && companyData.totalEmployees < eligibility.minEmployees) {
        isEligible = false;
        reasons.push(`최소 근로자 수 ${eligibility.minEmployees}명 미만`);
    }

    if (eligibility.maxEmployees !== null && companyData.totalEmployees > eligibility.maxEmployees) {
        isEligible = false;
        reasons.push(`최대 근로자 수 ${eligibility.maxEmployees}명 초과`);
    }

    if (eligibility.requiredEmployeeTypes && eligibility.requiredEmployeeTypes.length > 0) {
        for (const type of eligibility.requiredEmployeeTypes) {
            if (type === '청년' && (!companyData.youthEmployees || companyData.youthEmployees === 0)) {
                isEligible = false;
                reasons.push('청년 근로자(15-34세) 고용 필요');
            }
            if (type === '고령자' && (!companyData.seniorEmployees || companyData.seniorEmployees === 0)) {
                isEligible = false;
                reasons.push('고령자(60세 이상) 고용 필요');
            }
            if (type === '장애인' && (!companyData.disabledEmployees || companyData.disabledEmployees === 0)) {
                isEligible = false;
                reasons.push('장애인 근로자 고용 필요');
            }
        }
    }

    if (eligibility.maxWage && companyData.avgWage > eligibility.maxWage) {
        isEligible = false;
        reasons.push(`평균 월급여 ${eligibility.maxWage.toLocaleString()}원 이하 필요`);
    }

    if (eligibility.requiresBusinessDifficulty && !companyData.hasBusinessDifficulty) {
        isEligible = false;
        reasons.push('경영상 어려움 증빙 필요');
    }

    if (eligibility.requiresUnemployed && !companyData.hiringUnemployed) {
        isEligible = false;
        reasons.push('미취업 청년 채용 필요');
    }

    if (eligibility.forJobSeekers) {
        isEligible = false;
        reasons.push('구직자 대상 프로그램 (기업 지원금 아님)');
    }

    if (eligibility.industryExclusions && eligibility.industryExclusions.includes(companyData.industry)) {
        isEligible = false;
        reasons.push(`제외 업종: ${companyData.industry}`);
    }

    return {
        isEligible,
        reasons: isEligible ? ['모든 요건 충족'] : reasons,
        subsidy
    };
}

function checkMutualExclusivity(eligibleSubsidies) {
    const conflicts = new Map();

    eligibleSubsidies.forEach(subsidy => {
        if (subsidy.mutuallyExclusive && subsidy.mutuallyExclusive.length > 0) {
            const conflictingIds = subsidy.mutuallyExclusive.filter(id => 
                eligibleSubsidies.some(s => s.id === id)
            );
            
            if (conflictingIds.length > 0) {
                conflicts.set(subsidy.id, conflictingIds);
            }
        }
    });

    return conflicts;
}

function generateCompatibleCombinations(eligibleSubsidies) {
    const combinations = [];
    const n = eligibleSubsidies.length;

    for (let i = 0; i < (1 << n); i++) {
        const combination = [];
        
        for (let j = 0; j < n; j++) {
            if (i & (1 << j)) {
                combination.push(eligibleSubsidies[j]);
            }
        }

        if (combination.length === 0) continue;

        const isCompatible = isCompatibleCombination(combination);
        
        if (isCompatible) {
            combinations.push(combination);
        }
    }

    return combinations;
}

function isCompatibleCombination(subsidies) {
    for (let i = 0; i < subsidies.length; i++) {
        const subsidy = subsidies[i];
        
        if (!subsidy.mutuallyExclusive || subsidy.mutuallyExclusive.length === 0) {
            continue;
        }

        for (let j = 0; j < subsidies.length; j++) {
            if (i === j) continue;
            
            const otherSubsidy = subsidies[j];
            
            if (subsidy.mutuallyExclusive.includes(otherSubsidy.id)) {
                return false;
            }
        }
    }
    
    return true;
}

function getAllEligibleSubsidies(subsidies, companyData) {
    const results = subsidies.map(subsidy => checkEligibility(subsidy, companyData));
    
    const eligible = results.filter(result => result.isEligible).map(result => result.subsidy);
    const notEligible = results.filter(result => !result.isEligible);

    return {
        eligible,
        notEligible: notEligible.map(result => ({
            subsidy: result.subsidy,
            reasons: result.reasons
        }))
    };
}
