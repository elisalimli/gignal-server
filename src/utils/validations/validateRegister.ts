import { RegisterInput } from "../../types/Input/RegisterInput";

export const validateRegister = (options: RegisterInput) => {
  const errors: any[] = [];
  if (options.username.length <= 2) {
    errors.push({
      field: "username",
      message: "Must be greater than 2 characters.",
    });
  }
  if (options.email.length <= 2) {
    errors.push({
      field: "email",
      message: "Must be greater than 2 characters.",
    });
  }
  if (options.username.includes("@")) {
    errors.push({
      field: "username",
      message: "Cannot include @",
    });
  }
  if (!options.email.includes("@")) {
    errors.push({
      field: "email",
      message: "Email must include @",
    });
  }
  if (options.password.length <= 2) {
    errors.push({
      field: "password",
      message: "Must be greater than 2 characters.",
    });
  }
  if (errors.length > 0) {
    return errors;
  }
  return null;
};
