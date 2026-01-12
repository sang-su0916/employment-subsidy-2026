const SUBSIDIES_2026 = [
    {
        id: 'youth-job-leap',
        name: '청년일자리도약장려금',
        category: '청년고용',
        description: '청년(15-34세) 정규직 신규 채용 시 기업과 청년 모두 지원 (2026년 비수도권 우대)',
        eligibility: {
            minEmployees: 5,
            maxEmployees: null,
            industryExclusions: [],
            requiredEmployeeTypes: ['청년'],
            minEmploymentPeriod: 6,
            employeeAgeRange: { min: 15, max: 34 }
        },
        calculation: {
            type: 'youth-dual-support',
            // 기업 지원
            companySupport: {
                maxAmount: 7200000, // 1년간 최대 720만원
                maxMonths: 12,
                conditions: [
                    {
                        region: '수도권',
                        requiresJobDifficulty: true, // 취업애로청년만
                        monthlyAmount: 600000
                    },
                    {
                        region: '비수도권',
                        monthlyAmount: 600000
                    }
                ]
            },
            // 청년 직접 지원 (2026년 신규)
            youthSupport: {
                maxMonths: 24,
                conditions: [
                    {
                        region: '비수도권일반',
                        totalAmount: 4800000, // 2년 최대 480만원
                        payment: [
                            { month: 6, amount: 1200000 },
                            { month: 12, amount: 1200000 },
                            { month: 18, amount: 1200000 },
                            { month: 24, amount: 1200000 }
                        ]
                    },
                    {
                        region: '우대지원지역',
                        totalAmount: 6000000, // 2년 최대 600만원
                        payment: [
                            { month: 6, amount: 1500000 },
                            { month: 12, amount: 1500000 },
                            { month: 18, amount: 1500000 },
                            { month: 24, amount: 1500000 }
                        ]
                    },
                    {
                        region: '특별지원지역',
                        totalAmount: 7200000, // 2년 최대 720만원
                        payment: [
                            { month: 6, amount: 1800000 },
                            { month: 12, amount: 1800000 },
                            { month: 18, amount: 1800000 },
                            { month: 24, amount: 1800000 }
                        ]
                    }
                ]
            }
        },
        mutuallyExclusive: ['youth-intern', 'employment-stability-fund'],
        requiredDocuments: [
            '고용보험 피보험자격 취득신고서',
            '임금대장',
            '근로계약서',
            '청년 주민등록등본'
        ],
        notes: '6개월 이상 계속 근무 시 지원 개시. 2026년부터 비수도권 기업과 청년 모두 지원. 신청기간: 2026.1.26~'
    },
    {
        id: 'senior-employment',
        name: '고령자고용지원금',
        category: '고령자고용',
        description: '60세 이상 고령자 고용 시 인건비 지원',
        eligibility: {
            minEmployees: 1,
            maxEmployees: null,
            industryExclusions: [],
            requiredEmployeeTypes: ['고령자'],
            minEmploymentPeriod: 6,
            employeeAgeRange: { min: 60, max: null }
        },
        calculation: {
            type: 'per-employee-quarterly',
            baseAmount: 2700000,
            maxQuarters: 8,
            maxEmployees: null,
            quarterlyAmount: 2700000
        },
        mutuallyExclusive: [],
        requiredDocuments: [
            '고용보험 피보험자격 취득신고서',
            '주민등록등본',
            '임금대장',
            '근로계약서'
        ],
        notes: '분기별 270만원, 최대 2년 지원'
    },
    {
        id: 'senior-continued-employment',
        name: '고령자계속고용장려금',
        category: '고령자고용',
        description: '정년 이후에도 근로자 계속 고용 시 지원 (2026년 비수도권 우대)',
        eligibility: {
            minEmployees: 1,
            maxEmployees: null,
            industryExclusions: [],
            requiredEmployeeTypes: ['고령자'],
            minEmploymentPeriod: 1,
            employeeAgeRange: { min: 60, max: null },
            requiresRetirementAge: true
        },
        calculation: {
            type: 'per-employee-monthly',
            baseAmount: 300000,
            maxMonths: 36,
            maxEmployees: null,
            conditions: [
                {
                    region: '수도권',
                    monthlyAmount: 300000
                },
                {
                    region: '비수도권',
                    monthlyAmount: 400000
                }
            ]
        },
        mutuallyExclusive: [],
        requiredDocuments: [
            '고용보험 피보험자격 취득신고서',
            '주민등록등본',
            '임금대장',
            '근로계약서',
            '정년 이후 고용 증빙'
        ],
        notes: '2026년부터 비수도권 기업 우대 (월 40만원). 정년 이후 계속 고용 시 최대 3년 지원'
    },
    {
        id: 'disabled-employment',
        name: '장애인고용장려금',
        category: '장애인고용',
        description: '장애인 근로자 고용 시 월별 지원금 지급',
        eligibility: {
            minEmployees: 1,
            maxEmployees: null,
            industryExclusions: [],
            requiredEmployeeTypes: ['장애인'],
            minEmploymentPeriod: 1,
            employeeAgeRange: null
        },
        calculation: {
            type: 'per-employee-monthly',
            baseAmount: 600000,
            maxMonths: null,
            maxEmployees: null,
            conditions: [
                {
                    disabilityLevel: '중증',
                    monthlyAmount: 600000
                },
                {
                    disabilityLevel: '경증',
                    monthlyAmount: 400000
                }
            ]
        },
        mutuallyExclusive: [],
        requiredDocuments: [
            '장애인등록증',
            '고용보험 피보험자격 취득신고서',
            '임금대장',
            '근로계약서'
        ],
        notes: '기간 제한 없음, 계속 고용 시 지속 지원'
    },
    {
        id: 'severe-disabled-improvement',
        name: '중증장애인고용개선장려금',
        category: '장애인고용',
        description: '50~100인 미만 사업장의 중증장애인 고용 증가 시 지원 (2026년 신설)',
        eligibility: {
            minEmployees: 50,
            maxEmployees: 99,
            industryExclusions: [],
            requiredEmployeeTypes: ['장애인'],
            minEmploymentPeriod: 1,
            employeeAgeRange: null,
            requiresSevereDisabled: true,
            requiresQuotaNotMet: true
        },
        calculation: {
            type: 'per-employee-monthly',
            baseAmount: 400000,
            maxMonths: 12,
            maxEmployees: null,
            conditions: [
                {
                    gender: '남성',
                    monthlyAmount: 350000
                },
                {
                    gender: '여성',
                    monthlyAmount: 450000
                }
            ]
        },
        mutuallyExclusive: [],
        requiredDocuments: [
            '장애인등록증 (중증)',
            '고용보험 피보험자격 취득신고서',
            '임금대장',
            '근로계약서',
            '중증장애인 의무고용률 미달성 증빙'
        ],
        notes: '2026년 신설. 중증장애인 의무고용률(3.1%) 미달 사업장이 중증장애인 고용 증가 시 최장 1년 지원'
    },
    {
        id: 'employment-stability-fund',
        name: '일자리안정자금',
        category: '임금보조',
        description: '30인 미만 소상공인·영세중소기업 지원',
        eligibility: {
            minEmployees: 1,
            maxEmployees: 29,
            industryExclusions: [],
            requiredEmployeeTypes: [],
            minEmploymentPeriod: 1,
            employeeAgeRange: null,
            maxWage: 2400000
        },
        calculation: {
            type: 'per-employee-monthly',
            baseAmount: 120000,
            maxMonths: 12,
            maxEmployees: null,
            monthlyAmount: 120000
        },
        mutuallyExclusive: ['youth-job-leap'],
        requiredDocuments: [
            '고용보험 피보험자 명부',
            '임금대장',
            '사업자등록증'
        ],
        notes: '월 240만원 이하 근로자 대상'
    },
    {
        id: 'employment-maintenance',
        name: '고용유지지원금',
        category: '고용유지',
        description: '경영악화 시 휴업·휴직을 통한 고용유지 지원',
        eligibility: {
            minEmployees: 1,
            maxEmployees: null,
            industryExclusions: [],
            requiredEmployeeTypes: [],
            minEmploymentPeriod: 1,
            employeeAgeRange: null,
            requiresBusinessDifficulty: true
        },
        calculation: {
            type: 'wage-compensation',
            baseAmount: null,
            conditions: [
                {
                    companySize: '우선지원대상기업',
                    compensationRate: 0.90,
                    maxDailyAmount: 66000
                },
                {
                    companySize: '대규모기업',
                    compensationRate: 0.67,
                    maxDailyAmount: 66000
                }
            ],
            maxDays: 180
        },
        mutuallyExclusive: [],
        requiredDocuments: [
            '경영상 어려움 증빙서류',
            '휴업·휴직 계획서',
            '고용보험 피보험자 명부',
            '임금대장'
        ],
        notes: '매출액 감소 등 경영악화 입증 필요'
    },
    {
        id: 'youth-intern',
        name: '중소기업 청년인턴제',
        category: '청년고용',
        description: '미취업 청년의 중소기업 인턴 채용 지원',
        eligibility: {
            minEmployees: 5,
            maxEmployees: null,
            industryExclusions: [],
            requiredEmployeeTypes: ['청년'],
            minEmploymentPeriod: 3,
            employeeAgeRange: { min: 15, max: 34 },
            requiresUnemployed: true
        },
        calculation: {
            type: 'per-employee-monthly',
            baseAmount: 1200000,
            maxMonths: 3,
            maxEmployees: null,
            monthlyAmount: 1200000
        },
        mutuallyExclusive: ['youth-job-leap'],
        requiredDocuments: [
            '청년 미취업 확인서',
            '고용보험 피보험자격 취득신고서',
            '인턴 근로계약서',
            '임금대장'
        ],
        notes: '인턴 기간 3개월, 정규직 전환 시 추가 지원 가능'
    },
    {
        id: 'national-employment-support',
        name: '국민취업지원제도',
        category: '취업지원',
        description: '저소득 구직자 대상 취업지원 서비스 및 생계지원',
        eligibility: {
            minEmployees: null,
            maxEmployees: null,
            industryExclusions: [],
            requiredEmployeeTypes: [],
            minEmploymentPeriod: null,
            employeeAgeRange: null,
            incomeRequirement: true,
            forJobSeekers: true
        },
        calculation: {
            type: 'job-seeker-support',
            baseAmount: 500000,
            maxMonths: 6,
            monthlyAmount: 500000
        },
        mutuallyExclusive: [],
        requiredDocuments: [
            '소득·재산 신고서',
            '구직활동 계획서',
            '취업지원 신청서'
        ],
        notes: '구직자 대상 프로그램, 기업 지원금과 별개'
    }
];

const COMPANY_SIZE_CATEGORIES = {
    '5인미만': { min: 0, max: 4 },
    '5인이상30인미만': { min: 5, max: 29 },
    '30인이상': { min: 30, max: Infinity }
};

const INDUSTRY_TYPES = [
    '제조업',
    '건설업',
    '도소매업',
    '숙박음식업',
    '정보통신업',
    '전문과학기술업',
    '사업서비스업',
    '기타'
];
