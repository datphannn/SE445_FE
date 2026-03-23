'use client';
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export type FilterState = {
  shareholder: 'all' | 'yes' | 'no';
  gender: 'all' | 'Male' | 'Female' | 'Other';
  ethnicity: 'all' | 'Asian' | 'White' | 'Black' | 'Hispanic' | 'Other';
  employment: 'all' | 'fulltime' | 'parttime';
  year: 2025 | 2024;
};

export const defaultFilter: FilterState = {
  shareholder: 'all',
  gender: 'all',
  ethnicity: 'all',
  employment: 'all',
  year: 2025,
};

interface Props {
  filter: FilterState;
  onChange: (f: FilterState) => void;
}

type SelectProps<K extends keyof FilterState> = {
  label: string;
  filterKey: K;
  options: { value: FilterState[K]; label: string }[];
  filter: FilterState;
  onChange: (f: FilterState) => void;
};

function FilterSelect<K extends keyof FilterState>({ label, filterKey, options, filter, onChange }: SelectProps<K>) {
  const isActive = filter[filterKey] !== 'all' && filter[filterKey] !== undefined;
  return (
    <div className={`filter-select ${isActive ? 'active' : ''}`}>
      <label>{label}</label>
      <select
        value={String(filter[filterKey])}
        onChange={e => onChange({ ...filter, [filterKey]: e.target.value as FilterState[K] })}
      >
        {options.map(o => (
          <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
        ))}
      </select>
      <style jsx>{`
        .filter-select { display: flex; flex-direction: column; gap: 3px; }
        label { font-size: 9px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
        select {
          font-size: 12px; padding: 6px 10px; border-radius: 6px;
          border: 1px solid var(--border); background: var(--card-bg);
          color: var(--text-secondary); cursor: pointer; outline: none;
          font-family: var(--font-body); transition: border-color 0.14s;
          appearance: none; min-width: 110px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239d9b96' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 8px center; padding-right: 28px;
        }
        select:focus { border-color: var(--accent); }
        .active select { border-color: var(--accent); color: var(--accent); background-color: var(--accent-subtle); }
      `}</style>
    </div>
  );
}

export default function FilterBar({ filter, onChange }: Props) {
  const [open, setOpen] = useState(true);
  const hasActiveFilters = JSON.stringify(filter) !== JSON.stringify(defaultFilter);

  return (
    <div className="filterbar-wrap">
      <div className="filterbar-header" onClick={() => setOpen(v => !v)}>
        <div className="fb-left">
          <SlidersHorizontal size={13} />
          <span>Filters</span>
          {hasActiveFilters && <span className="active-dot" />}
        </div>
        {hasActiveFilters && (
          <button className="reset-btn" onClick={e => { e.stopPropagation(); onChange(defaultFilter); }}>
            <X size={11} /> Reset
          </button>
        )}
      </div>

      {open && (
        <div className="filterbar-body">
          <FilterSelect
            label="Shareholder"
            filterKey="shareholder"
            options={[
              { value: 'all', label: 'All' },
              { value: 'yes', label: 'Shareholder' },
              { value: 'no', label: 'Non-Shareholder' },
            ]}
            filter={filter} onChange={onChange}
          />
          <FilterSelect
            label="Gender"
            filterKey="gender"
            options={[
              { value: 'all', label: 'All' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
            filter={filter} onChange={onChange}
          />
          <FilterSelect
            label="Ethnicity"
            filterKey="ethnicity"
            options={[
              { value: 'all', label: 'All' },
              { value: 'Asian', label: 'Asian' },
              { value: 'White', label: 'White' },
              { value: 'Black', label: 'Black' },
              { value: 'Hispanic', label: 'Hispanic' },
              { value: 'Other', label: 'Other' },
            ]}
            filter={filter} onChange={onChange}
          />
          <FilterSelect
            label="Employment"
            filterKey="employment"
            options={[
              { value: 'all', label: 'All' },
              { value: 'fulltime', label: 'Full-Time' },
              { value: 'parttime', label: 'Part-Time' },
            ]}
            filter={filter} onChange={onChange}
          />
          <FilterSelect
            label="Year"
            filterKey="year"
            options={[
              { value: 2025, label: '2025' },
              { value: 2024, label: '2024' },
            ]}
            filter={filter} onChange={onChange}
          />
        </div>
      )}

      <style jsx>{`
        .filterbar-wrap {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; overflow: hidden;
        }
        .filterbar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; cursor: pointer;
          font-size: 12px; font-weight: 600; color: var(--text-secondary);
          transition: background 0.12s; user-select: none;
        }
        .filterbar-header:hover { background: var(--hover-bg); }
        .fb-left { display: flex; align-items: center; gap: 7px; }
        .active-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
        }
        .reset-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: var(--danger); background: none; border: none;
          cursor: pointer; font-family: var(--font-body); font-weight: 500;
          padding: 3px 7px; border-radius: 5px; transition: background 0.12s;
        }
        .reset-btn:hover { background: var(--danger-subtle); }
        .filterbar-body {
          display: flex; gap: 16px; flex-wrap: wrap;
          padding: 12px 16px 14px; border-top: 1px solid var(--border);
          background: #fafaf9;
        }
      `}</style>
    </div>
  );
}
