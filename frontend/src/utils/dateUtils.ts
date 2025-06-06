// frontend/src/utils/dateUtils.ts
export const formatDateToUK = (
  dateInput: string | Date | undefined | null
): string => {
  if (!dateInput) return ""; // Return empty string for null, undefined, or empty string input
  try {
    const date = new Date(dateInput);
    // Check if date is valid after parsing
    if (isNaN(date.getTime())) {
      // Handle invalid date input
      // console.warn("Invalid date input for formatDateToUK:", dateInput);
      return typeof dateInput === "string" ? dateInput : "Invalid Date"; // Return original string if it was a string
    }
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error(
      "Error formatting date in formatDateToUK:",
      error,
      "Input:",
      dateInput
    );
    return typeof dateInput === "string" ? dateInput : "Error formatting date"; // Fallback
  }
};
