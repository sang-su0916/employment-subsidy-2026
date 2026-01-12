function validateBusinessNumber(number) {
    const cleaned = number.replace(/[^0-9]/g, '');
    
    return cleaned.length === 10;
}

function formatBusinessNumber(number) {
    const cleaned = number.replace(/[^0-9]/g, '');
    
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
}

function validateFormData(formData) {
    const errors = [];

    if (!formData.businessNumber || formData.businessNumber.trim() === '') {
        errors.push('사업자등록번호를 입력해주세요.');
    } else if (!validateBusinessNumber(formData.businessNumber)) {
        errors.push('유효하지 않은 사업자등록번호입니다.');
    }

    if (!formData.companyName || formData.companyName.trim() === '') {
        errors.push('기업명을 입력해주세요.');
    }

    if (!formData.industry || formData.industry === '') {
        errors.push('업종을 선택해주세요.');
    }

    if (!formData.companySize || formData.companySize === '') {
        errors.push('기업 규모를 선택해주세요.');
    }

    if (!formData.totalEmployees || formData.totalEmployees < 1) {
        errors.push('전체 근로자 수를 입력해주세요.');
    }

    if (formData.insuredEmployees < 0) {
        errors.push('고용보험 피보험자 수는 0 이상이어야 합니다.');
    }

    if (formData.insuredEmployees > formData.totalEmployees) {
        errors.push('고용보험 피보험자 수는 전체 근로자 수를 초과할 수 없습니다.');
    }

    if (!formData.avgWage || formData.avgWage < 0) {
        errors.push('평균 월급여를 입력해주세요.');
    }

    if (formData.youthEmployees < 0 || formData.seniorEmployees < 0 || 
        formData.disabledEmployees < 0 || formData.newHires < 0) {
        errors.push('모든 인원 수는 0 이상이어야 합니다.');
    }

    const totalSpecialEmployees = (formData.youthEmployees || 0) + 
                                   (formData.seniorEmployees || 0) + 
                                   (formData.disabledEmployees || 0);

    if (totalSpecialEmployees > formData.totalEmployees) {
        errors.push('청년/고령자/장애인 근로자 합계가 전체 근로자 수를 초과할 수 없습니다.');
    }

    return errors;
}

function sanitizeInput(input) {
    if (typeof input === 'string') {
        return input.replace(/[<>]/g, '');
    }
    return input;
}
