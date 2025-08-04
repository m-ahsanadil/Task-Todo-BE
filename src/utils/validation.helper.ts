export class ValidationHelper {
  static isValidEmail(email: string): string {
    return email.trim().toLocaleLowerCase();
  }

  static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>-])[A-Za-z\d!@#$%^&*(),.?":{}|<>-]{8,}$/

    return passwordRegex.test(password);
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, "");
  }
}
