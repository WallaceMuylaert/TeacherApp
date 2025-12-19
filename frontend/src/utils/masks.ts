export const formatPhone = (value: string) => {
    if (!value) return "";
    const numericValue = value.replace(/\D/g, "");
    const truncatedValue = numericValue.slice(0, 11);

    if (truncatedValue.length <= 2) {
        return truncatedValue.replace(/^(\d{0,2})/, "($1");
    }
    if (truncatedValue.length <= 6) {
        return truncatedValue.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
    }
    if (truncatedValue.length <= 10) {
        return truncatedValue.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return truncatedValue.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
};
