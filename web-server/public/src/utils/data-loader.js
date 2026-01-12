/**
 * 데이터 로더 모듈
 * 외부 JSON 파일 또는 내장 JS 파일에서 지원금 데이터를 로드합니다.
 */

// 내장 데이터 (fallback)
let builtinSubsidies = null;
let loadedData = null;

/**
 * 외부 JSON 파일에서 데이터 로드 시도
 * @param {string} jsonPath - JSON 파일 경로
 * @returns {Promise<Object>} 로드된 데이터 객체
 */
async function loadExternalData(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 데이터 유효성 검증
        if (!data.subsidies || !Array.isArray(data.subsidies)) {
            throw new Error('Invalid data format: subsidies array not found');
        }
        
        console.log(`✅ 외부 데이터 로드 성공: ${data.version} (${data.lastUpdated})`);
        return data;
    } catch (error) {
        console.warn(`⚠️ 외부 데이터 로드 실패: ${error.message}`);
        return null;
    }
}

/**
 * 내장 데이터 로드 (src/data/subsidies.js)
 * @returns {Object} 내장 데이터 객체
 */
function loadBuiltinData() {
    if (builtinSubsidies) {
        return builtinSubsidies;
    }
    
    // SUBSIDIES_2026가 전역에 정의되어 있다고 가정
    if (typeof SUBSIDIES_2026 !== 'undefined') {
        builtinSubsidies = {
            version: '2026.1.0-builtin',
            lastUpdated: '2026-01-11',
            description: '내장 2026년 고용지원금 데이터',
            subsidies: SUBSIDIES_2026,
            companySizeCategories: COMPANY_SIZE_CATEGORIES || {},
            industryTypes: INDUSTRY_TYPES || []
        };
        console.log('✅ 내장 데이터 로드 성공');
        return builtinSubsidies;
    }
    
    console.error('❌ 내장 데이터를 찾을 수 없습니다');
    return null;
}

/**
 * 데이터 로드 (외부 우선, 실패 시 내장 데이터 사용)
 * @param {string} [externalPath='./data/subsidies-2026.json'] - 외부 JSON 경로
 * @returns {Promise<Object>} 최종 로드된 데이터
 */
async function loadSubsidyData(externalPath = './data/subsidies-2026.json') {
    // 이미 로드된 데이터가 있으면 반환
    if (loadedData) {
        return loadedData;
    }
    
    // 1. 외부 JSON 파일 시도
    const externalData = await loadExternalData(externalPath);
    if (externalData) {
        loadedData = externalData;
        return loadedData;
    }
    
    // 2. 외부 로드 실패 시 내장 데이터 사용
    console.log('📦 내장 데이터로 대체합니다...');
    const builtinData = loadBuiltinData();
    if (builtinData) {
        loadedData = builtinData;
        return loadedData;
    }
    
    // 3. 모든 방법 실패
    throw new Error('데이터를 로드할 수 없습니다. 프로그램을 재설치해주세요.');
}

/**
 * 현재 로드된 데이터 반환
 * @returns {Object|null} 로드된 데이터 또는 null
 */
function getCurrentData() {
    return loadedData;
}

/**
 * 데이터 강제 새로고침 (외부 파일 재로드)
 * @param {string} [externalPath='./data/subsidies-2026.json'] - 외부 JSON 경로
 * @returns {Promise<Object>} 새로 로드된 데이터
 */
async function refreshData(externalPath = './data/subsidies-2026.json') {
    loadedData = null;  // 캐시 초기화
    return await loadSubsidyData(externalPath);
}

/**
 * 데이터 버전 정보 반환
 * @returns {Object} 버전 정보 {version, lastUpdated, isExternal}
 */
function getDataVersion() {
    if (!loadedData) {
        return {
            version: 'unknown',
            lastUpdated: 'unknown',
            isExternal: false
        };
    }
    
    return {
        version: loadedData.version || 'unknown',
        lastUpdated: loadedData.lastUpdated || 'unknown',
        isExternal: !loadedData.version.includes('builtin'),
        description: loadedData.description || ''
    };
}

/**
 * 지원금 데이터 배열 반환
 * @returns {Array} 지원금 배열
 */
function getSubsidies() {
    if (!loadedData) {
        console.warn('⚠️ 데이터가 로드되지 않았습니다. loadSubsidyData()를 먼저 호출하세요.');
        return [];
    }
    return loadedData.subsidies || [];
}

/**
 * 기업 규모 카테고리 반환
 * @returns {Object} 기업 규모 카테고리
 */
function getCompanySizeCategories() {
    if (!loadedData) {
        return {};
    }
    return loadedData.companySizeCategories || {};
}

/**
 * 업종 유형 반환
 * @returns {Array} 업종 배열
 */
function getIndustryTypes() {
    if (!loadedData) {
        return [];
    }
    return loadedData.industryTypes || [];
}
