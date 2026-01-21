"use client";

import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { validateSchema } from "@/lib/schemaValidator";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Layout from "@/layouts/layout";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner"

export default function SchemaEditor() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const navigate = useNavigate();
  const [value, setValue] = useState("{}");
  const [errors, setErrors] = useState<any[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [isProgress, setProgress] = useState(false);

  /** Called once Monaco mounts */
  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  /** Convert AJV errors → Monaco markers */
  const setMarkers = (ajvErrors: any[]) => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const markers: monaco.editor.IMarkerData[] = ajvErrors.map((err) => {
      // Try to locate error path in JSON
      const text = model.getValue();
      const pathKey = err.instancePath?.split("/").pop();

      const index = pathKey ? text.indexOf(`"${pathKey}"`) : 0;
      const position = index >= 0 ? model.getPositionAt(index) : { lineNumber: 1, column: 1 };

      return {
        severity: monaco.MarkerSeverity.Error,
        message: err.message || "Schema error",
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column + (pathKey?.length || 1),
      };
    });

    monaco.editor.setModelMarkers(model, "schema-validation", markers);
  };

  /** Clear markers when schema becomes valid */
  const clearMarkers = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    monaco.editor.setModelMarkers(model, "schema-validation", []);
  };

  /** On editor change */
  const onChange = (val?: string) => {
    setValue(val || "");

    try {
      const parsed = JSON.parse(val || "{}");
      const result = validateSchema(parsed);

      setErrors(result.errors);
      setIsValid(result.valid);

      if (result.valid) {
        clearMarkers();
      } else {
        setMarkers(result.errors);
      }
    } catch {
      setIsValid(false);
      const jsonError = [{ message: "Invalid JSON format" }];
      setErrors(jsonError);
      setMarkers(jsonError);
    }
  };

  const createSchema = () => {
    fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/v1/registry/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schema: value, address: `${import.meta.env.VITE_APP_PROFILE_ADDRESS}`
      }),
    }).then((response) => {
      if (response.status === 200 || response.status === 201) {
        response.json().then(() => {
          setProgress(false);
          toast.success("Schema created successfully")
        });
      } else if (response.status === 504) {
        setProgress(false);
        toast.error("The server is busy, please try again in a while'")

      } else {
        response
          .json()
          .then((data) => {
            setProgress(false);
            toast.error("The server is busy, please try again in a while'")
            toast("Error", {
              description: `${data.error}`,
            })
          })
          .catch((err) => {
            toast("Error", {
              description: `${err.message}`,
            })
          });
      }
    })
      .catch(() => {
        setProgress(false);
        toast("Error", {
          description: `An error occured, please try again later!`,
        })
      });
  };
  return (
    <Layout>
      <Card className="mx-auto my-10 w-[1000px] h-[800px]">
        <CardHeader className="text-lg font-semibold">
          Schema Editor
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="h-[650px] border rounded-md overflow-hidden">
            <Editor
              language="json"
              value={value}
              onChange={onChange}
              onMount={onMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
              }}
            />
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription className="space-y-1 max-h-40 overflow-auto text-sm">
                {errors.map((err, i) => (
                  <div key={i}>
                    ❌ {err.instancePath || "schema"} {err.message}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              className="mx-4"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Cancel
            </Button>
            <Button
              disabled={!isValid || isProgress}
              className={!isValid || isProgress ? "opacity-50 cursor-not-allowed" : ""}
              onClick={() => {
                setProgress(true);
                createSchema()
              }}
            >
              {isProgress ? "Saving Schema..." : "Save Schema"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
