import Joi from "joi";

export const emailRules = Joi.string()
  .email({ tlds: { allow: false } })
  .required()
  .trim()
  .messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  });

export const passwordRules = Joi.string()
  .min(8)
  .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])"))
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters long",
    "string.pattern.base":
      "Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character",
    "any.required": "Password is required",
  });

export const nameRules = Joi.string()
  .min(3)
  .max(30)
  .pattern(new RegExp("^[a-zA-Z ]+$"))
  .required()
  .trim()
  .messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be less than 30 characters long",
    "string.pattern.base": "Name can only contain letters and spaces",
    "any.required": "Name is required",
  });

export const tagRules = Joi.string()
  .min(3)
  .max(30)
  .pattern(new RegExp("^[a-zA-Z0-9._]+$"))
  .required()
  .messages({
    "string.min": "Tag must be at least 3 characters long",
    "string.max": "Tag must be less than 30 characters long",
    "string.pattern.base": "Tag can only contain letters, numbers, and underscores",
    "any.required": "Tag is required",
  });
export const verifyCodeRules = Joi.string().length(6).pattern(/^\d+$/).required().messages({
  "string.length": "Verification code must be 6 characters long",
  "string.pattern.base": "Verification code must contain only digits",
  "any.required": "Verification code is required",
  "string.empty": "Verification code cannot be empty",
});

export const phoneRules = Joi.string().min(10).max(15).optional();

export const pfpUrlSchema = Joi.string().uri().optional();

export const emailTemplateRule = Joi.string()
  .required()
  .regex(/^@[^\s@]+(\.[^\s@]+)*$/)
  .messages({
    "string.empty": "Email template cannot be empty",
    "any.required": "Email template is required",
    "string.pattern.base": "Invalid email template format",
  });

export const emailTemplatesRule = Joi.array().items(emailTemplateRule);
