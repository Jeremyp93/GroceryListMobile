export const displayDateAsHuman = (dateInput: Date): string => {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    return date.toLocaleDateString();
}