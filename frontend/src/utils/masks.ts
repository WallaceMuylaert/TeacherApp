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
