// �ð��� ����
export const parseDate = (date) => {
    
    if (date.startsWith("BC ")) {
        const parts = date.replace("BC ", "").split(/[- :]/); // "BC 0001-01-01 00:00:00" �� ["0001", "01", "01", "00", "00", "00"]
        const bcYear = -parseInt(parts[0], 10) + 1; // BC 1���� 0���� ����ϱ� ���� +1
        const month = parseInt(parts[1], 10) - 1; // ���� 0���� ����
        const day = parseInt(parts[2], 10);
        const hours = parseInt(parts[3], 10);
        const minutes = parseInt(parts[4], 10);
        const seconds = parseInt(parts[5], 10);

        // BC ��¥�� ���� ��� (����, ��, ���� ������ ó��)
        //const bcDate = new Date(0); // ����: ���н� ����ũ (1970-01-01)
        const bcDate = new Date(Date.UTC(0, 0, 1, 0, 0, 0)); // ������: 0�� 1�� 1��
        bcDate.setUTCFullYear(bcYear); // ���� ������ ���� ����
        bcDate.setUTCMonth(month); // �� ����
        bcDate.setUTCDate(day); // �� ����
        bcDate.setUTCHours(hours, minutes, seconds, 0); // �ð� ����

        return bcDate.getTime(); // ���н� Ÿ�ӽ����� ��ȯ
    }
    // AC (�����) ��¥ ó��
    const parts = date.split(/[- :]/); // "0100-01-01 00:00:00" �� ["0100", "01", "01", "00", "00", "00"]
    const year = parseInt(parts[0], 10); // ������ ������ ��ȯ
    const month = parseInt(parts[1], 10) - 1; // ���� 0���� ����
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
    //return new Date(date).getTime(); // �Ϲ� ��¥ ó��
};