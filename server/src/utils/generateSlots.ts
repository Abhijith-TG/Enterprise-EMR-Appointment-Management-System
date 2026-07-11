export const generateSlots = (
    start: string,
    end: string,
    duration: number
): string[] => {

    const slots: string[] = [];

    let [hour, minute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    while (
        hour < endHour ||
        (hour === endHour && minute < endMinute)
    ) {

        slots.push(
            `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
        );

        minute += duration;

        while (minute >= 60) {
            hour++;
            minute -= 60;
        }
    }

    return slots;
};