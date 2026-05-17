import type { NextFunction, Request, Response } from "express";
import { type AnyZodObject, type ZodEffects, ZodError } from "zod";

// ===========================================
// Zod Validation Middleware
// ===========================================
//
// Generic middleware factory that validates req.body, req.query,
// or req.params against a Zod schema before reaching the controller.
//
// Usage:
//   router.post('/products', validate(createProductSchema), controller);
//
// This is a pattern UPGRADE from DevJobs Pro where we validated
// inside controllers. Validation middleware keeps controllers clean.
// ===========================================

type ValidationTarget = "body" | "query" | "params";

interface ValidateOptions {
  /** Which part of the request to validate. Defaults to "body" */
  target?: ValidationTarget;
}

export const validate = (
  schema: AnyZodObject | ZodEffects<AnyZodObject>,
  options: ValidateOptions = {},
) => {
  const { target = "body" } = options;

  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await schema.parseAsync(req[target]);

      // Replace the request data with the parsed (and potentially
      // transformed/stripped) data from Zod
      req[target] = data;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error); // Handled by our global error handler
      } else {
        next(error);
      }
    }
  };
};

// Convenience wrappers
export const validateBody = (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  validate(schema, { target: "body" });

export const validateQuery = (
  schema: AnyZodObject | ZodEffects<AnyZodObject>,
) => validate(schema, { target: "query" });

export const validateParams = (
  schema: AnyZodObject | ZodEffects<AnyZodObject>,
) => validate(schema, { target: "params" });
