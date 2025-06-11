import React, { useEffect, useState } from "react";
import { getCountries } from "../services/api";
import SummaryCards from "../components/DataVisualization/SummaryCards";
import BarChartTopCases from "../components/DataVisualization/BarChartTopCases";
import ScatterPlotTestsCases from "../components/DataVisualization/ScatterPlotTestsCases";

interface CovidData {
  country: string;
  total_cases: number;
  total_deaths: number;
  total_recovered: number;
  active_cases: number;
  serious_critical: number;
  total_tests: number;
  population: number;
}

const DataVisualization: React.FC = () => {
  const [data, setData] = useState<CovidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
		const res = await getCountries();
		console.log("API data format:", res.data);

      setData(res.data ?? []);
    } catch (err) {
      setError("Failed to fetch COVID-19 data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p>Loading COVID‑19 data...</p>
      </div>
    );

  if (error)
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchData}>
          Retry
        </button>
      </div>
    );

  return (
    <div className="container py-5">
      <SummaryCards data={data} />
      <BarChartTopCases data={data} />
      <ScatterPlotTestsCases data={data} />
    </div>
  );
};

export default DataVisualization;
