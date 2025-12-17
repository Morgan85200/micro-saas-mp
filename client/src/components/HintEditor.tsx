interface Hint {
    orderNumber: number;
    hintText: string;
    hintImage?: string | null;
    hintType?: string | null;
  }
  
  interface Props {
    hints: Hint[];
    setHints: (hints: Hint[]) => void;
  }
  
  function HintEditor({ hints, setHints }: Props) {
    const addHint = () => {
      setHints([
        ...hints,
        {
          orderNumber: hints.length + 1,
          hintText: "",
          hintType: "text",
        },
      ]);
    };
  
    const updateHint = (index: number, field: keyof Hint, value: any) => {
      const updated = [...hints];
      updated[index] = { ...updated[index], [field]: value };
      setHints(updated);
    };
  
    const removeHint = (index: number) => {
      const updated = hints.filter((_, i) => i !== index);
      updated.forEach((h, i) => (h.orderNumber = i + 1));
      setHints(updated);
    };
  
    return (
      <div>
        <h3>Hints</h3>
  
        {hints.map((hint, i) => (
          <div key={i} className="form-group">
            <p><strong>Hint #{hint.orderNumber}</strong></p>
  
            <input
              placeholder="Hint text"
              value={hint.hintText}
              onChange={(e) => updateHint(i, "hintText", e.target.value)}
              required
            />
  
            <select
              value={hint.hintType || "text"}
              onChange={(e) => updateHint(i, "hintType", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
  
            <button type="button" className="margin-bottom-10" onClick={() => removeHint(i)}>
              Remove hint
            </button>
          </div>
        ))}
  
        <button type="button"  className="margin-bottom-10" onClick={addHint}>
          + Add Hint
        </button>

      </div>
    );
  }
  
  export default HintEditor;
  