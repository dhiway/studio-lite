import React, { useState } from "react";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true, strict: false });

type Props = {
  schema: any;
  onSubmit?: (data: Record<string, any>) => void;
};

export default function DynamicSchemaForm({ schema, onSubmit }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validate = ajv.compile(schema);
    const valid = validate(formData);

    if (!valid && validate.errors) {
      const fieldErrors: Record<string, string> = {};
      for (const err of validate.errors) {
        const field = err.instancePath.replace("/", "");
        fieldErrors[field] = err.message || "Invalid value";
      }
      setErrors(fieldErrors);
    } else {
      setErrors({});
      onSubmit?.(formData);
      console.log("✅ Valid data:", formData);
    }
  };

  const renderInput = (key: string, prop: any) => {
    const type = prop.type || "string";

    if (prop.enum) {
      return (
        <select
          value={formData[key] || ""}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full bg-[#2b2b2b] border border-[#3a3a3a] text-gray-200 text-sm rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Select {key}</option>
          {prop.enum.map((val: string) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      );
    }

    switch (type) {
      case "integer":
      case "number":
        return (
          <input
            type="number"
            value={formData[key] || ""}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full bg-[#2b2b2b] border border-[#3a3a3a] text-gray-200 text-sm rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        );
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={!!formData[key]}
            onChange={(e) => handleChange(key, e.target.checked)}
            className="accent-blue-600"
          />
        );
      default:
        return (
          <input
            type={prop.format === "date-time" ? "datetime-local" : "text"}
            value={formData[key] || ""}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={prop.description || key}
            className="w-full bg-[#2b2b2b] border border-[#3a3a3a] text-gray-200 text-sm rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-[987px] bg-[#1c1c1c] text-white p-8 rounded-3xl shadow-2xl border border-[#2b2b2b]"
    >
      <h2 className="text-2xl font-semibold mb-6">{schema.title || "Schema Form"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {Object.entries(schema.properties || {}).map(([key, prop]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-medium capitalize text-gray-300 mb-2">
              {prop.title || key}
              {schema.required?.includes(key) && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            {renderInput(key, prop)}
            {errors[key] && (
              <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition-all text-white font-medium px-8 py-2 rounded-full shadow-md"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
