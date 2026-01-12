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

    // 정년 규정 여부 확인 (고령자계속고용장려금)
    if (eligibility.requiresRetirementAge) {
        if (!companyData.hasRetirementAge) {
            isEligible = false;
            reasons.push('정년 규정이 있는 사업장만 해당 (취업규칙에 60세 이상 정년 규정 필요)');
        }
    }

    // 중증장애인 고용 여부 확인 (중증장애인고용개선장려금)
    if (eligibility.requiresSevereDisabled) {
        if (!companyData.hasSevereDisabled && (!companyData.severeDisabledEmployees || companyData.severeDisabledEmployees === 0)) {
            isEligible = false;
            reasons.push('중증장애인 근로자 고용 필요 (장애등급 1~3급 또는 중증기준 해당자)');
        }
    }

    // 장애인 의무고용률 충족 여부 (50인 이상 사업장)
    if (eligibility.quotaRequirement) {
        const quotaType = eligibility.quotaRequirement.type;
        if (quotaType === 'exceed' && !companyData.exceedsDisabilityQuota) {
            isEligible = false;
            reasons.push(`장애인 의무고용률(${(eligibility.quotaRequirement.baseRate * 100).toFixed(1)}%) 초과 고용 필요`);
        } else if (quotaType === 'meet' && !companyData.meetsDisabilityQuota) {
            isEligible = false;
            reasons.push(`장애인 의무고용률 충족 필요`);
        }
    }

    // 일손부족 업종 확인 (일손부족일자리 동행인센티브)
    if (eligibility.targetIndustries && eligibility.targetIndustries.length > 0) {
        const matchesIndustry = eligibility.targetIndustries.some(industry =>
            companyData.industry && companyData.industry.includes(industry.replace(/\s*\(.*\)\s*/g, ''))
        );
        if (!matchesIndustry) {
            isEligible = false;
            reasons.push(`일손부족 지정 업종만 해당 (${eligibility.targetIndustries.join(', ')})`);
        }
    }

    // 직업훈련 수료 여부 확인
    if (eligibility.prerequisite && companyData.hasTrainingCertificate === false) {
        isEligible = false;
        reasons.push('해당 근로자 직업훈련 수료 필요');
    }

    // 소득 요건 확인 (개인 대상 지원금)
    if (eligibility.incomeRequirement && !companyData.meetsIncomeRequirement) {
        isEligible = false;
        reasons.push('소득 요건 미충족 (기준중위소득 확인 필요)');
    }

    // 대상 근로자 보유 여부
    if (eligibility.targetWorkers && !companyData.hasTargetWorkers) {
        isEligible = false;
        reasons.push('지원 대상 근로자 고용 필요');
    }

    // 개인 대상 지원금 확인 (기업 신청 불가)
    if (eligibility.individualOnly && companyData.applicantType === 'company') {
        isEligible = false;
        reasons.push('개인 대상 지원금 (기업 신청 불가, 근로자 직접 신청 필요)');
    }

    // 비정규직 전환 여부 확인 (정규직 전환 지원금)
    if (eligibility.requiresNonRegularConversion) {
        if (!companyData.nonRegularEmployees || companyData.nonRegularEmployees === 0) {
            isEligible = false;
            reasons.push('전환 대상 비정규직(기간제/파견/사내하도급) 근로자 필요 (6개월 이상 근무)');
        }
    }

    // 중장년 채용 확인 (일손부족일자리 동행인센티브)
    if (eligibility.requiresMiddleAgedHiring) {
        if (!companyData.middleAgedEmployees || companyData.middleAgedEmployees === 0) {
            isEligible = false;
            reasons.push('중장년(50세 이상) 신규 채용 필요');
        }
    }

    // 육아기 근로자 확인 (육아기 10시 출근제)
    if (eligibility.requiresChildcareWorkers) {
        if (!companyData.childcareWorkers || companyData.childcareWorkers === 0) {
            isEligible = false;
            reasons.push('육아기 근로자(8세 이하 또는 초등 2학년 이하 자녀) 고용 필요');
        }
    }

    // 회사 규모 조건 확인 (2026년 데이터 구조)
    if (eligibility.companySize) {
        if (eligibility.companySize.min !== null && companyData.totalEmployees < eligibility.companySize.min) {
            isEligible = false;
            reasons.push(`최소 근로자 수 ${eligibility.companySize.min}명 이상 필요`);
        }
        if (eligibility.companySize.max !== null && companyData.totalEmployees > eligibility.companySize.max) {
            isEligible = false;
            reasons.push(`최대 근로자 수 ${eligibility.companySize.max}명 이하 필요`);
        }
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

module.exports = {
    checkEligibility,
    checkMutualExclusivity,
    generateCompatibleCombinations,
    isCompatibleCombination,
    getAllEligibleSubsidies
};
