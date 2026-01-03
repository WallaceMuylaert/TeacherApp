export const formatPhone = (value: string) => {
    if (!value) return "";
    const numericValue = value.replace(/\D/g, "");
    const truncatedValue = numericValue.slice(0, 11);

    if (truncatedValue.length <= 2) {
        return truncatedValue.replace(/^(\d{0,2})/, "($1");
    }
    if (truncatedValue.length <= 7) {
        return truncatedValue.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    }
    return truncatedValue.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
};

export const unmaskPhone = (value: string | undefined) => {
    if (!value) return "";
    return value.replace(/\D/g, "");
};

export const formatCurrency = (value: string | number) => {
    if (!value) return "R$ 0,00";

    // If it's a number, convert to string with fixed decimals first if needed, 
    // but usually we receive the raw input string here or a number from DB.

    let numericValue = typeof value === 'string' ? value.replace(/\D/g, "") : value.toFixed(2).replace(/\D/g, "");

    const floatValue = parseFloat(numericValue) / 100;

    return floatValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};

export const parseCurrency = (value: string) => {
    if (!value) return 0;
    const numericValue = value.replace(/\D/g, "");
    const floatValue = parseFloat(numericValue);
    return isNaN(floatValue) ? 0 : floatValue / 100;
};
