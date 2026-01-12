/**
 * 2026년 고용지원금 데이터 (내장 폴백용)
 *
 * 이 파일은 외부 JSON 로드 실패 시 사용되는 폴백 데이터입니다.
 * data/subsidies-2026.json과 동일한 구조를 유지해야 합니다.
 *
 * 출처: 고용노동부 2026년 고용지원금 정책
 * 버전: 2.0.0 (2026-01-11)
 */

const SUBSIDY_DATA = {
    version: "2.0.0",
    lastUpdated: "2026-01-11",
    source: {
        name: "고용노동부",
        documents: [
            "2026년 청년일자리도약장려금 사업운영 지침 ('26.1월)",
            "2026년 고령자계속고용장려금 운영지침",
            "2026년 고용정책 주요 변경사항 (고용노동부 보도자료)"
        ]
    },
    subsidies: [
        {
            id: "youth-job-leap-2026",
            name: "청년일자리도약장려금",
            category: "채용지원",
            description: "취업애로청년을 정규직으로 채용하고 6개월 이상 고용 유지 시 지원",
            targetType: "employer",
            amount: {
                perPerson: {
                    monthly: 600000,
                    duration: 12,
                    total: 7200000
                },
                youthDirect: {
                    enabled: true,
                    condition: "비수도권 청년 직접지원 (2026년 신설)",
                    // 6·12·18·24개월 차에 각각 지급
                    regions: {
                        일반비수도권: { perMilestone: 1200000, milestones: 4, total: 4800000, note: "83개 지역" },
                        우대지원지역: { perMilestone: 1500000, milestones: 4, total: 6000000, note: "44개 지역" },
                        특별지원지역: { perMilestone: 1800000, milestones: 4, total: 7200000, note: "40개 지역 (인구감소지역)" }
                    }
                },
                regional: {
                    metropolitan: { multiplier: 1.0, note: "수도권 (청년 직접지원 없음)" },
                    nonMetropolitan: { multiplier: 1.0, note: "일반 비수도권", youthDirectAmount: 4800000 },
                    priority: { multiplier: 1.0, note: "우대지원지역", youthDirectAmount: 6000000 },
                    special: { multiplier: 1.0, note: "특별지원지역 (인구감소)", youthDirectAmount: 7200000 }
                }
            },
            calculation: {
                type: "regional-differentiated-2026",
                company: { monthlyAmount: 600000, maxMonths: 12, totalAmount: 7200000 },
                youth: {
                    수도권: { totalAmount: 0, note: "청년 직접지원 없음" },
                    일반비수도권: { totalAmount: 4800000, note: "6·12·18·24개월 차 각 120만원" },
                    우대지원지역: { totalAmount: 6000000, note: "6·12·18·24개월 차 각 150만원" },
                    특별지원지역: { totalAmount: 7200000, note: "6·12·18·24개월 차 각 180만원" }
                }
            },
            conditions: {
                employeeAge: { min: 15, max: 34 },
                employmentType: "정규직",
                minEmploymentMonths: 6,
                insuranceRequired: ["고용보험"],
                excludedIndustries: ["유흥업", "도박업"],
                excludedRelations: ["사업주 배우자", "4촌 이내 혈족/인척"],
                additionalRequirements: [
                    "취업애로청년 대상 (6개월 이상 실업, 자영업 폐업, 고졸 이하, 북한이탈주민, 보호종료아동 등)",
                    "최저임금 이상 지급",
                    "주 15시간 이상 근무"
                ]
            },
            eligibility: {
                companySize: { min: 5, max: null, note: "5인 이상 우선지원대상기업" },
                industryType: "전 업종 (제외업종 제외)",
                otherConditions: [
                    "고용보험 가입 사업장",
                    "최근 3개월 이내 감원이 없을 것"
                ]
            },
            documentGuide: {
                required: [
                    "사업자등록증",
                    "고용보험 피보험자격 취득 신고서",
                    "근로계약서",
                    "급여이체 증빙 (통장 사본, 급여명세서)",
                    "취업애로청년 확인서류"
                ],
                applicationMethod: "고용24 온라인 신청",
                deadline: "채용 후 6개월 이내 신청, 이후 3개월마다 고용유지 확인"
            },
            notes: [
                "2026년 변경: 비수도권 청년에게 직접 지원금 지급 (최대 720만원)",
                "타 채용지원금과 중복 수급 불가",
                "부정수급 시 지원금 환수 및 제재"
            ],
            mutuallyExclusive: ["regular-conversion-2026"]
        },
        {
            id: "elderly-continued-employment-2026",
            name: "고령자계속고용장려금",
            category: "채용지원",
            description: "정년 도달 근로자를 계속 고용하거나 정년을 폐지/연장한 사업주 지원",
            targetType: "employer",
            amount: {
                perPerson: {
                    monthly: 300000,
                    duration: 36,
                    total: 10800000
                },
                regional: {
                    metropolitan: { monthly: 300000, total: 10800000, note: "수도권 (3년)" },
                    nonMetropolitan: { monthly: 400000, total: 14400000, note: "비수도권 (2026년 인상, 3년)" },
                    priority: { monthly: 400000, total: 14400000, note: "고용위기 지역" },
                    special: { monthly: 400000, total: 14400000, note: "인구감소지역" }
                },
                cap: {
                    perCompany: null,
                    note: "상한 없음"
                }
            },
            conditions: {
                employeeAge: { min: 60, max: null, note: "정년 도달자" },
                employmentType: "정규직 (정년 전 1년 이상 근속)",
                minEmploymentMonths: 12,
                insuranceRequired: ["고용보험"],
                additionalRequirements: [
                    "정년 도달 후 계속고용 또는",
                    "취업규칙에 정년 연장/폐지 명시",
                    "최저임금 이상 지급"
                ]
            },
            eligibility: {
                companySize: { min: null, max: null, note: "전 규모" },
                industryType: "전 업종",
                requiresRetirementAge: true,
                otherConditions: [
                    "취업규칙에 60세 이상 정년 규정이 있을 것",
                    "정년 도달 전 1년 이상 고용보험 가입"
                ]
            },
            documentGuide: {
                required: [
                    "사업자등록증",
                    "취업규칙 또는 단체협약 (정년 규정 포함)",
                    "계속고용 근로계약서",
                    "고용보험 피보험자격 유지 확인"
                ],
                applicationMethod: "고용센터 방문 또는 고용24 온라인",
                deadline: "정년 도달 후 3개월 이내 신청"
            },
            calculation: {
                type: "regional-differentiated-quarterly",
                수도권: { monthlyAmount: 300000, maxMonths: 36, quarterlyAmount: 900000, maxQuarters: 12, totalAmount: 10800000 },
                비수도권: { monthlyAmount: 400000, maxMonths: 36, quarterlyAmount: 1200000, maxQuarters: 12, totalAmount: 14400000 },
                우대지원지역: { monthlyAmount: 400000, maxMonths: 36, quarterlyAmount: 1200000, maxQuarters: 12, totalAmount: 14400000 },
                특별지원지역: { monthlyAmount: 400000, maxMonths: 36, quarterlyAmount: 1200000, maxQuarters: 12, totalAmount: 14400000 }
            },
            notes: [
                "2026년 변경: 비수도권 월 40만원으로 인상 (고령자통합장려금)",
                "청년일자리도약장려금과 중복 수급 가능 (대상자가 다름)",
                "정년 연장 시 1년마다 재신청 필요",
                "지원 기간: 최대 3년 (36개월)"
            ],
            mutuallyExclusive: []
        },
        {
            id: "severe-disabled-improvement-2026",
            name: "중증장애인고용개선장려금",
            category: "채용지원",
            description: "50~100인 미만 사업장에서 의무고용률 미달성 시 중증장애인 고용하면 지원 (2026년 신설)",
            targetType: "employer",
            amount: {
                perPerson: {
                    male: { monthly: 350000, duration: 12, total: 4200000, note: "중증 남성 장애인" },
                    female: { monthly: 450000, duration: 12, total: 5400000, note: "중증 여성 장애인" }
                },
                note: "성별에 따라 지원금액 차등"
            },
            conditions: {
                employeeType: "중증장애인",
                employmentType: "정규직 또는 무기계약직",
                minEmploymentMonths: 6,
                insuranceRequired: ["고용보험", "산재보험"],
                quotaRequirement: {
                    type: "not_met",
                    baseRate: 0.031,
                    note: "의무고용률(3.1%) 미달성 사업장이 중증장애인 고용 시"
                },
                additionalRequirements: [
                    "중증장애인 기준: 장애등급 1~3급 또는 중증기준 해당자",
                    "주 15시간 이상 근무"
                ]
            },
            eligibility: {
                companySize: { min: 50, max: 99, note: "50~100인 미만" },
                industryType: "전 업종",
                requiresSevereDisabled: true,
                otherConditions: [
                    "장애인 의무고용 적용 사업장",
                    "장애인고용공단 등록"
                ]
            },
            documentGuide: {
                required: [
                    "사업자등록증",
                    "장애인 등록증 (중증 확인)",
                    "근로계약서",
                    "고용보험 및 산재보험 가입 확인서"
                ],
                applicationMethod: "한국장애인고용공단 신청",
                deadline: "분기별 신청"
            },
            calculation: {
                type: "per-employee-monthly-by-gender",
                중증남성: { monthlyAmount: 350000, maxMonths: 12, totalAmount: 4200000 },
                중증여성: { monthlyAmount: 450000, maxMonths: 12, totalAmount: 5400000 }
            },
            notes: [
                "2026년 4월부터 신청 가능 (신설 제도)",
                "중증 남성: 월 35만원, 중증 여성: 월 45만원",
                "50~100인 미만 사업장은 부담금 납부 의무 없음 (장려금으로 유도)",
                "한국장애인고용공단 방문/우편/e-신고시스템으로 신청"
            ],
            mutuallyExclusive: []
        },
        {
            id: "regular-conversion-2026",
            name: "정규직 전환 지원금",
            category: "고용안정",
            description: "비정규직 근로자를 정규직으로 전환한 사업주 지원 (2026년 재개)",
            targetType: "employer",
            amount: {
                perPerson: {
                    monthly: { min: 400000, max: 600000 },
                    duration: 12,
                    total: { min: 4800000, max: 7200000 }
                },
                breakdown: {
                    임금20만원이상인상: { monthly: 600000, duration: 12, total: 7200000 },
                    그외: { monthly: 400000, duration: 12, total: 4800000 }
                }
            },
            calculation: {
                type: "monthly-based-on-wage-increase",
                임금20만원이상인상: { monthlyAmount: 600000, maxMonths: 12, totalAmount: 7200000 },
                그외: { monthlyAmount: 400000, maxMonths: 12, totalAmount: 4800000 }
            },
            conditions: {
                priorEmployment: {
                    type: ["기간제", "파견", "사내하도급"],
                    minMonths: 6,
                    note: "6개월 이상 근무한 비정규직"
                },
                employmentType: "정규직 전환",
                minEmploymentMonths: 6,
                insuranceRequired: ["고용보험", "4대보험"],
                additionalRequirements: [
                    "전환 후 처우 개선 (임금 인상, 복리후생 등)",
                    "최저임금 이상 지급",
                    "무기계약직 포함"
                ]
            },
            eligibility: {
                companySize: { min: 5, max: 29, note: "5인 이상 30인 미만 기업" },
                industryType: "전 업종",
                requiresNonRegularConversion: true,
                otherConditions: [
                    "전환 전 6개월간 해당 근로자 고용보험 가입",
                    "사업 승인 후 6개월 이내 정규직 전환"
                ]
            },
            documentGuide: {
                required: [
                    "사업자등록증",
                    "전환 전/후 근로계약서",
                    "임금대장 (처우개선 확인)",
                    "취업규칙 또는 인사규정 (정규직 기준 명시)"
                ],
                applicationMethod: "고용24 온라인 신청",
                deadline: "전환 후 6개월 이내 신청"
            },
            notes: [
                "2026년 재개 (2023년부터 3년간 중단되었던 제도)",
                "임금 20만원 이상 인상 시 월 60만원, 그 외 월 40만원",
                "5인 이상 30인 미만 기업 대상",
                "청년일자리도약장려금과 중복 불가"
            ],
            mutuallyExclusive: ["youth-job-leap-2026"]
        },
        {
            id: "labor-shortage-2026",
            name: "일손부족일자리 동행인센티브",
            category: "채용지원",
            description: "일손부족 업종에서 50세 이상 중장년을 채용한 사업주 지원 (2026년 신설)",
            targetType: "employer",
            amount: {
                perPerson: {
                    monthly: 500000,
                    duration: 12,
                    total: 6000000
                },
                regional: {
                    metropolitan: { multiplier: 1.0 },
                    nonMetropolitan: { multiplier: 1.2, note: "비수도권 20% 가산" }
                }
            },
            conditions: {
                employeeAge: { min: 50, max: null },
                employmentType: "정규직 또는 1년 이상 계약직",
                minEmploymentMonths: 6,
                insuranceRequired: ["고용보험"],
                targetIndustries: [
                    "제조업 (뿌리산업 등)",
                    "농림어업",
                    "요양/돌봄 서비스",
                    "물류/배송"
                ],
                additionalRequirements: [
                    "고용센터 지정 일손부족 업종",
                    "최저임금 이상 지급"
                ]
            },
            eligibility: {
                companySize: { min: null, max: null, note: "전 규모" },
                industryType: "일손부족 지정 업종",
                requiresMiddleAgedHiring: true,
                targetIndustries: [
                    "제조업 (뿌리산업 등)",
                    "농림어업",
                    "요양/돌봄 서비스",
                    "물류/배송"
                ],
                otherConditions: [
                    "채용 전 3개월간 해당 직무 구인 노력 증빙",
                    "고용센터 일손부족 확인서 발급"
                ]
            },
            documentGuide: {
                required: [
                    "사업자등록증",
                    "일손부족 확인서 (고용센터 발급)",
                    "근로계약서",
                    "구인활동 증빙 (워크넷 구인등록 등)"
                ],
                applicationMethod: "고용센터 방문 신청",
                deadline: "채용 후 3개월 이내"
            },
            calculation: {
                type: "milestone-based",
                milestones: [
                    { months: 6, amount: 3000000, note: "6개월 고용 유지" },
                    { months: 12, amount: 3000000, note: "12개월 고용 유지" }
                ],
                totalAmount: 6000000,
                maxMonths: 12
            },
            notes: [
                "2026년 신설 제도 (시범 도입)",
                "예산: 18억원, 대상: 1,000명",
                "중장년(50세+) 채용 활성화 목적",
                "청년일자리도약장려금과 중복 수급 가능 (대상자가 다름)"
            ],
            mutuallyExclusive: []
        },
        {
            id: "disabled-success-package-2026",
            name: "장애인취업성공패키지",
            category: "직접지원",
            description: "저소득 장애인 구직자에게 취업지원서비스와 수당 지급",
            targetType: "individual",
            amount: {
                perPerson: {
                    monthly: 600000,
                    duration: 6,
                    total: 3600000
                },
                breakdown: {
                    participationAllowance: { monthly: 300000, duration: 6 },
                    trainingAllowance: { monthly: 300000, duration: 6, note: "직업훈련 참여 시" }
                }
            },
            conditions: {
                disability: {
                    required: true,
                    types: ["중증", "경증"],
                    note: "장애인 등록 필수"
                },
                income: {
                    type: "기준중위소득",
                    maxPercent: 60,
                    note: "기준중위소득 60% 이하"
                },
                age: { min: 18, max: null },
                additionalRequirements: [
                    "구직등록 및 적극적 구직활동",
                    "월 2회 이상 취업상담 참여"
                ]
            },
            eligibility: {
                individualOnly: true,
                incomeLimit: "기준중위소득 60%",
                otherConditions: [
                    "고용센터 또는 장애인고용공단 등록",
                    "실업 상태일 것"
                ]
            },
            documentGuide: {
                required: [
                    "장애인 등록증",
                    "소득증빙 (건강보험료 납부확인서 등)",
                    "주민등록등본",
                    "구직등록확인서"
                ],
                applicationMethod: "장애인고용공단 또는 고용센터",
                deadline: "수시 신청"
            },
            calculation: {
                type: "monthly-jobseeker-support",
                monthlyAmount: 600000,
                maxMonths: 6,
                totalAmount: 3600000
            },
            notes: [
                "2026년 변경: 월 60만원으로 인상 (기존 50만원)",
                "국민취업지원제도와 중복 불가",
                "취업 성공 시 취업성공수당 추가 지급"
            ],
            mutuallyExclusive: ["national-employment-support-2026"]
        },
        {
            id: "national-employment-support-2026",
            name: "국민취업지원제도",
            category: "직접지원",
            description: "저소득 구직자에게 구직촉진수당과 취업지원서비스 제공",
            targetType: "individual",
            amount: {
                perPerson: {
                    monthly: 600000,
                    duration: 6,
                    total: 3600000
                },
                types: {
                    type1: {
                        name: "I유형",
                        allowance: { monthly: 600000, duration: 6 },
                        condition: "저소득층, 특정계층"
                    },
                    type2: {
                        name: "II유형",
                        allowance: { monthly: 348000, duration: 6 },
                        condition: "중위소득 100% 이하 청년 등"
                    }
                }
            },
            conditions: {
                income: {
                    type1: { maxPercent: 60, note: "기준중위소득 60% 이하" },
                    type2: { maxPercent: 100, note: "기준중위소득 100% 이하" }
                },
                age: { min: 15, max: 69 },
                employment: "실업 또는 비경활",
                additionalRequirements: [
                    "구직촉진수당: 월 2회 이상 구직활동",
                    "취업활동계획 수립 및 이행"
                ]
            },
            eligibility: {
                individualOnly: true,
                otherConditions: [
                    "최근 2년 내 100일 이상 취업경험 (I유형)",
                    "또는 특정계층 해당 (청년, 경력단절여성 등)"
                ]
            },
            documentGuide: {
                required: [
                    "신분증",
                    "소득증빙 (건강보험료 납부확인서)",
                    "가족관계증명서",
                    "취업경험 증빙 (고용보험 이력 등)"
                ],
                applicationMethod: "고용센터 방문 또는 온라인 (고용24)",
                deadline: "수시 신청"
            },
            calculation: {
                type: "monthly-jobseeker-support",
                types: {
                    I유형: { monthlyAmount: 600000, maxMonths: 6, totalAmount: 3600000 },
                    II유형: { monthlyAmount: 348000, maxMonths: 6, totalAmount: 2088000 }
                }
            },
            notes: [
                "2026년 변경: I유형 구직촉진수당 월 60만원으로 인상",
                "장애인취업성공패키지와 중복 불가",
                "청년 특례: 구직경험 요건 완화"
            ],
            mutuallyExclusive: ["disabled-success-package-2026"]
        },
        {
            id: "parental-10am-2026",
            name: "육아기 10시 출근제",
            category: "일생활균형",
            description: "12세 이하 자녀를 둔 근로자의 10시 출근을 허용한 사업주 지원 (2026년 신설)",
            targetType: "employer",
            amount: {
                perPerson: {
                    monthly: 300000,
                    duration: 12,
                    total: 3600000
                },
                conditions: {
                    minFlexHours: 1,
                    note: "출근시간 1시간 이상 유연화"
                }
            },
            conditions: {
                employeeRequirements: {
                    childAge: { max: 12, note: "초등학교 6학년 이하" },
                    employment: "정규직 또는 무기계약직"
                },
                workArrangement: {
                    type: "유연근무제",
                    options: ["시차출퇴근", "선택근무제", "재택근무 병행"],
                    note: "10시 출근 허용 필수"
                },
                minEmploymentMonths: 3,
                insuranceRequired: ["고용보험"],
                additionalRequirements: [
                    "기존 근로시간 유지 (단축 아님)",
                    "육아기 근로자 신청 시 허용"
                ]
            },
            eligibility: {
                companySize: { min: null, max: null, note: "전 규모 (중소·중견기업 우선)" },
                industryType: "전 업종",
                requiresChildcareWorkers: true,
                otherConditions: [
                    "유연근무제 규정 마련",
                    "해당 근로자 고용보험 가입"
                ]
            },
            documentGuide: {
                required: [
                    "사업자등록증",
                    "유연근무제 시행 계획서",
                    "해당 근로자 가족관계증명서 (자녀 나이 확인)",
                    "유연근무 실시 확인서 (출퇴근 기록 등)"
                ],
                applicationMethod: "고용24 온라인 신청",
                deadline: "분기별 신청 (실적 기반)"
            },
            calculation: {
                type: "per-employee-monthly",
                monthlyAmount: 300000,
                maxMonths: 12,
                totalAmount: 3600000
            },
            notes: [
                "2026년 신설 제도",
                "예산: 31억원, 대상: 1,700명",
                "중소·중견기업 대상",
                "육아휴직 대체 또는 병행 가능",
                "맞벌이 부부 모두 신청 가능"
            ],
            mutuallyExclusive: []
        }
    ]
};

// 기존 SUBSIDIES 배열 호환성 유지 (레거시 코드 지원)
const SUBSIDIES = SUBSIDY_DATA.subsidies;

// 기존 SUBSIDIES_2026 배열 호환성 유지
const SUBSIDIES_2026 = SUBSIDY_DATA.subsidies;

// 지원금 조회 헬퍼 함수들
function getSubsidyById(id) {
    return SUBSIDIES.find(s => s.id === id);
}

function getSubsidiesByCategory(category) {
    return SUBSIDIES.filter(s => s.category === category);
}

function getSubsidiesByTargetType(targetType) {
    return SUBSIDIES.filter(s => s.targetType === targetType);
}

// 버전 정보
function getDataVersion() {
    return {
        version: SUBSIDY_DATA.version,
        lastUpdated: SUBSIDY_DATA.lastUpdated,
        source: SUBSIDY_DATA.source
    };
}

// 기업/개인 타입별 분류
const COMPANY_SIZE_CATEGORIES = {
    '5인미만': { min: 0, max: 4 },
    '5인이상30인미만': { min: 5, max: 29 },
    '30인이상50인미만': { min: 30, max: 49 },
    '50인이상100인미만': { min: 50, max: 99 },
    '100인이상': { min: 100, max: Infinity }
};

const INDUSTRY_TYPES = [
    '제조업',
    '건설업',
    '도소매업',
    '숙박음식업',
    '정보통신업',
    '전문과학기술업',
    '사업서비스업',
    '농림어업',
    '요양/돌봄 서비스',
    '물류/배송',
    '기타'
];

const REGION_TYPES = {
    metropolitan: ['서울', '인천', '경기'],
    nonMetropolitan: ['부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'],
    priority: [], // 고용위기/산업위기 지역 - 별도 지정
    special: [] // 인구감소지역 - 별도 지정
};

module.exports = {
    SUBSIDY_DATA,
    SUBSIDIES,
    SUBSIDIES_2026,
    getSubsidyById,
    getSubsidiesByCategory,
    getSubsidiesByTargetType,
    getDataVersion,
    COMPANY_SIZE_CATEGORIES,
    INDUSTRY_TYPES,
    REGION_TYPES
};
