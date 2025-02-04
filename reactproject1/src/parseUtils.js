// 시간순 정렬
export const parseDate = (date) => {
    
    if (date.startsWith("BC ")) {
        const parts = date.replace("BC ", "").split(/[- :]/); // "BC 0001-01-01 00:00:00" → ["0001", "01", "01", "00", "00", "00"]
        const bcYear = -parseInt(parts[0], 10) + 1; // BC 1년을 0으로 취급하기 위해 +1
        const month = parseInt(parts[1], 10) - 1; // 월은 0부터 시작
        const day = parseInt(parts[2], 10);
        const hours = parseInt(parts[3], 10);
        const minutes = parseInt(parts[4], 10);
        const seconds = parseInt(parts[5], 10);

        // BC 날짜를 직접 계산 (연도, 월, 일을 음수로 처리)
        //const bcDate = new Date(0); // 기준: 유닉스 에포크 (1970-01-01)
        const bcDate = new Date(Date.UTC(0, 0, 1, 0, 0, 0)); // 기준점: 0년 1월 1일
        bcDate.setUTCFullYear(bcYear); // 음수 연도를 수동 설정
        bcDate.setUTCMonth(month); // 월 설정
        bcDate.setUTCDate(day); // 일 설정
        bcDate.setUTCHours(hours, minutes, seconds, 0); // 시간 설정

        return bcDate.getTime(); // 유닉스 타임스탬프 반환
    }
    // AC (기원후) 날짜 처리
    const parts = date.split(/[- :]/); // "0100-01-01 00:00:00" → ["0100", "01", "01", "00", "00", "00"]
    const year = parseInt(parts[0], 10); // 연도를 정수로 변환
    const month = parseInt(parts[1], 10) - 1; // 월은 0부터 시작
    const day = parseInt(parts[2], 10);
    const hours = parseInt(parts[3], 10);
    const minutes = parseInt(parts[4], 10);
    const seconds = parseInt(parts[5], 10);

    const acDate = new Date(0);
    acDate.setUTCFullYear(year);
    acDate.setUTCMonth(month);
    acDate.setUTCDate(day);
    acDate.setUTCHours(hours, minutes, seconds, 0);

    return acDate.getTime();
};

export const convertDateToStr = (date) => {
    if (date.startsWith("BC ")) {
        const parts = date.replace("BC ", "").split(/[- :]/);
        const bcYear = -parseInt(parts[0], 10) + 1; // BC 1년을 0으로 취급하기 위해 +1
        console.log(parts, bcYear);

        const res = "기원전 " + -bcYear + "년";
        console.log(res);
        return res;
    }

    return date;
};