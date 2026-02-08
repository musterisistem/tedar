
/**
 * Formats a phone number string into (05XX) XXX XX XX format.
 * Enforces strictly 11 characters (starting with 0).
 */
export const formatPhoneNumber = (value: string): string => {
    if (!value) return '';

    // Remove all non-digit characters
    const phoneNumber = value.replace(/[^\d]/g, '');

    // Ensure it doesn't exceed 11 digits
    const phoneNumberLength = phoneNumber.length;

    // Build the formatted string
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 4)}) ${phoneNumber.slice(4)}`;
    }
    if (phoneNumberLength < 9) {
        return `(${phoneNumber.slice(0, 4)}) ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
    }
    return `(${phoneNumber.slice(0, 4)}) ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7, 9)} ${phoneNumber.slice(9, 11)}`;
};

/**
 * Strips formatting to return just digits.
 * Useful for sending to API.
 */
export const unformatPhoneNumber = (value: string): string => {
    return value.replace(/[^\d]/g, '');
};
