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
      // Dropdown for enum fields
      return (
        <select
          value={formData[key] || ""}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full border border-gray-700 bg-[#1f1f1f] text-white p-2 rounded-lg"
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
            className="w-full border border-gray-700 bg-[#1f1f1f] text-white p-2 rounded-lg"
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
      case "object":
        return (
          <div className="border border-gray-700 p-3 rounded-lg bg-[#2b2b2b]">
            {Object.entries(prop.properties || {}).map(([childKey, childProp]) => (
              <div key={childKey} className="mb-2">
                <label className="block text-gray-300 mb-1 text-sm">
                  {key}.{childKey}
                </label>
                {renderInput(`${key}.${childKey}`, childProp)}
              </div>
            ))}
          </div>
        );
      default:
        return (
          <input
            type={prop.format === "date-time" ? "datetime-local" : "text"}
            value={formData[key] || ""}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full border border-gray-700 bg-[#1f1f1f] text-white p-2 rounded-lg"
            placeholder={prop.description || key}
          />
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl bg-[#1a1a1a] text-white p-6 rounded-2xl shadow-xl"
    >
      <h2 className="text-2xl font-semibold mb-6">{schema.title || "Schema Form"}</h2>

      {Object.entries(schema.properties || {}).map(([key, prop]) => (
        <div key={key} className="mb-5">
          <label className="block text-gray-300 mb-1 capitalize">{key}</label>
          {renderInput(key, prop)}
          {errors[key] && (
            <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg mt-4"
      >
        Submit
      </button>
    </form>
  );
}
