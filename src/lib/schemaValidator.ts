import Ajv from "ajv";
import addFormats from "ajv-formats";

export const ajv = new Ajv({
  allErrors: true,
  strict: false, // important for W3 / VC schemas
});
addFormats(ajv);

export function validateSchema(schema: any) {
  const valid = ajv.validateSchema(schema);
  return {
    valid,
    errors: ajv.errors || [],
  };
}
