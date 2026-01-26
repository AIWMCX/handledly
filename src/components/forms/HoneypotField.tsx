/**
 * Honeypot Field Component
 * 
 * A hidden field that bots will fill but humans won't see.
 * Part of the AI Cost Protection Framework.
 */

import { useEffect, useRef } from "react";

interface HoneypotFieldProps {
  onHoneypotChange: (value: string) => void;
  /**
   * Field name - should look legitimate to bots
   */
  fieldName?: string;
}

/**
 * Hidden honeypot field for bot detection
 * 
 * Uses multiple concealment techniques:
 * 1. CSS visibility/display hidden
 * 2. Positioned off-screen
 * 3. Zero dimensions
 * 4. Tab index -1 (not focusable)
 * 5. Autocomplete off
 */
export function HoneypotField({ 
  onHoneypotChange, 
  fieldName = "website_url" 
}: HoneypotFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleChange = () => {
      onHoneypotChange(input.value);
    };

    input.addEventListener("change", handleChange);
    input.addEventListener("input", handleChange);

    return () => {
      input.removeEventListener("change", handleChange);
      input.removeEventListener("input", handleChange);
    };
  }, [onHoneypotChange]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <label htmlFor={fieldName} style={{ display: "none" }}>
        Leave this field empty
      </label>
      <input
        ref={inputRef}
        type="text"
        id={fieldName}
        name={fieldName}
        tabIndex={-1}
        autoComplete="off"
        placeholder="Do not fill this field"
      />
    </div>
  );
}

export default HoneypotField;
