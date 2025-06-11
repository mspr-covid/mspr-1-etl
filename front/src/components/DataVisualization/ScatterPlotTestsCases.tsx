import React, { useRef, useState, useEffect } from "react";
import { Scatter } from "react-chartjs-2";
import { useTranslation } from "react-i18next"; 

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	Title,
	Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend);


interface CovidData {
  country: string;
  total_tests: number;
  total_cases: number;
}

interface ScatterPlotTestsCasesProps {
  data: CovidData[];
}

const ScatterPlotTestsCases: React.FC<ScatterPlotTestsCasesProps> = ({ data }) => {
  const { t } = useTranslation();
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["USA"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const prepareScatterData = () => {
    const filtered = data.filter(
      (c) => selectedCountries.includes(c.country) && c.total_tests > 0 && c.total_cases > 0
    );
    return {
      datasets: [
        {
          label: "Tests vs Cases",
          data: filtered.map((c) => ({
            x: c.total_tests,
            y: c.total_cases,
            label: c.country,
          })),
          backgroundColor: "rgba(16, 185, 129, 0.8)",
        },
      ],
    };
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: t("data_visualization.description_scatter"),
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const { label, x, y } = ctx.raw;
            return `${label}: ${x.toLocaleString()} tests, ${y.toLocaleString()} cas`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: t("data_visualization.label_scatter_test") },
        ticks: { callback: (v: any) => v.toLocaleString() },
      },
      y: {
        title: { display: true, text: t("data_visualization.label_scatter_cases") },
        ticks: { callback: (v: any) => v.toLocaleString() },
      },
    },
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((s) =>
      s.includes(country) ? s.filter((c) => c !== country) : [...s, country]
    );
  };
  const clearSelection = () => setSelectedCountries([]);

  return (
    <>
      <div className="mb-3 position-relative" ref={dropdownRef}>
        <button
          className="btn btn-outline-primary"
          onClick={() => setDropdownOpen((o) => !o)}
        >
          {t("buttons.select_countries")} ({selectedCountries.length})
        </button>
        {dropdownOpen && (
          <div
            className="border bg-white position-absolute p-2"
            style={{ maxHeight: 300, overflowY: "auto", zIndex: 100, minWidth: 250 }}
          >
            <button className="btn btn-sm btn-outline-secondary w-100" onClick={clearSelection}>
              Clear All
            </button>
            {data.map((c) => (
              <div key={c.country} className="form-check">
                <input
                  type="checkbox"
                  id={`chk-${c.country}`}
                  checked={selectedCountries.includes(c.country)}
                  onChange={() => toggleCountry(c.country)}
                  className="form-check-input"
                />
                <label htmlFor={`chk-${c.country}`} className="form-check-label">
                  {c.country}
                </label>
              </div>
            ))}
            <hr />
          </div>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5>{t("data_visualization.title_scatter")}</h5>
          {selectedCountries.length > 0 ? (
            <div style={{ height: 300 }}>
              <Scatter data={prepareScatterData()} options={scatterOptions} />
            </div>
          ) : (
            <p className="text-muted">{t("data_visualization.select_countries_hint")}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ScatterPlotTestsCases;
