export const PASSWORD_RULES = [
  {
    key: "length",
    label: "At least 8 characters",
    labelKey: "pwRuleLength",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    labelKey: "pwRuleUppercase",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    key: "lowercase",
    label: "One lowercase letter",
    labelKey: "pwRuleLowercase",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    key: "number",
    label: "One number",
    labelKey: "pwRuleNumber",
    test: (p: string) => /[0-9]/.test(p),
  },
  {
    key: "special",
    label: "One special character (!@#$...)",
    labelKey: "pwRuleSpecial",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
] as const;

export function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: "", labelKey: "", color: "" };
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1)
    return {
      score: 1,
      label: "Weak",
      labelKey: "pwStrengthWeak",
      color: "bg-red-500",
    };
  if (passed <= 2)
    return {
      score: 2,
      label: "Fair",
      labelKey: "pwStrengthFair",
      color: "bg-orange-500",
    };
  if (passed <= 3)
    return {
      score: 3,
      label: "Good",
      labelKey: "pwStrengthGood",
      color: "bg-yellow-500",
    };
  if (passed === 4)
    return {
      score: 4,
      label: "Strong",
      labelKey: "pwStrengthStrong",
      color: "bg-primary",
    };
  return {
    score: 5,
    label: "Very Strong",
    labelKey: "pwStrengthVeryStrong",
    color: "bg-primary",
  };
}

export function validatePassword(password: string): string | true {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return rule.label + " is required";
  }
  return true;
}

/**
 * Server-side password validation.
 * Returns null if valid, or an error message string if invalid.
 */
export function validatePasswordServer(password: string): string | null {
  const failed = PASSWORD_RULES.filter((r) => !r.test(password));
  if (failed.length === 0) return null;
  return `Password must contain: ${failed.map((r) => r.label.toLowerCase()).join(", ")}`;
}
