import { useMemo, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { categoryKey, suggestCategories } from "./expense-model";

type Props = {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  recent?: string[];
  placeholder: string;
  createLabel: string;
  onCreate: (name: string) => void;
  canCreate: boolean;
  disabled?: boolean;
  optional?: boolean;
};

export function ExpenseChoiceField({
  id, label, hint, value, onChange, options, recent = [], placeholder,
  createLabel, onCreate, canCreate, disabled = false, optional = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => suggestCategories(options, value, recent).slice(0, 7), [options, value, recent]);
  const popular = useMemo(() => suggestCategories(options, "", recent).slice(0, 4), [options, recent]);
  const exact = options.some((item) => categoryKey(item) === categoryKey(value));

  return (
    <div className="expense-choice-field">
      <div className="expense-category-heading">
        <label className="expense-label" htmlFor={id}>{label}{optional && <span className="expense-optional"> · TÙY CHỌN</span>}</label>
        <span>{hint}</span>
      </div>
      <div className="expense-combobox" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(event) => { onChange(event.target.value); setOpen(true); }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && open && suggestions.length && !exact) {
              event.preventDefault();
              onChange(suggestions[0]);
              setOpen(false);
            }
          }}
        />
        <ChevronDown size={18} aria-hidden="true" />
        <div className="expense-combobox-options" id={`${id}-options`} role="listbox" hidden={!open}>
          {suggestions.map((name) => (
            <button type="button" role="option" aria-selected={categoryKey(value) === categoryKey(name)} key={name}
              onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(name); setOpen(false); }}>
              {name}{categoryKey(value) === categoryKey(name) && <Check size={15} />}
            </button>
          ))}
          {value.trim() && !exact && <button type="button" role="option" aria-selected={false} disabled={!canCreate}
            className="expense-create-category" onMouseDown={(event) => event.preventDefault()}
            onClick={() => onCreate(value.trim())}><Plus size={16} /> {createLabel} “{value.trim()}”</button>}
          {!suggestions.length && !value.trim() && <p>Chưa có gợi ý.</p>}
        </div>
      </div>
      {popular.length > 0 && <div className="expense-quick-categories">{popular.map((name) => (
        <button key={name} type="button" className={categoryKey(value) === categoryKey(name) ? "selected" : ""}
          onClick={() => { onChange(name); setOpen(false); }}>{name}</button>
      ))}</div>}
    </div>
  );
}
