import { useEffect, useState } from "react";
import StatCard from "../components/StatCard.jsx";
import NetMoveModal from "../components/NetMoveModal.jsx";

export default function Dashboard() {

  const [showModal, setShowModal] = useState(false);

  const [metrics, setMetrics] = useState({
    openingBalance: 0,
    purchases: 0,
    transfersIn: 0,
    transfersOut: 0,
    assigned: 0,
    expended: 0,
    netMovement: 0,
    closingBalance: 0
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login first.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/assets/dashboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {

          throw new Error(
            data.message || "Failed to load dashboard"
          );

        }

        setMetrics(data.metrics);

      } catch (err) {

        console.error("Dashboard error:", err);

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);


  if (loading) {

    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );

  }


  if (error) {

    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-5">
        <h2 className="font-semibold">
          Unable to load dashboard
        </h2>

        <p className="text-sm mt-1">
          {error}
        </p>
      </div>
    );

  }


  return (

    <div>

      {/* Header */}

      <div className="mb-7">

        <p className="text-sm text-slate-500">
          Military Asset Management
        </p>

        <h1 className="text-3xl font-bold text-slate-900">
          Operations Dashboard
        </h1>

      </div>


      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <StatCard
          title="Opening Balance"
          value={metrics.openingBalance}
          subtitle="Selected period"
        />


        <button
          className="text-left"
          onClick={() => setShowModal(true)}
        >

          <StatCard
            title="Net Movement"
            value={metrics.netMovement}
            subtitle="Click for breakdown"
          />

        </button>


        <StatCard
          title="Assigned"
          value={metrics.assigned}
          subtitle="Current allocations"
        />


        <StatCard
          title="Expended"
          value={metrics.expended}
          subtitle="Recorded consumption"
        />

      </div>


      {/* Closing Balance */}

      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">

        <p className="text-sm text-slate-500">
          Closing Balance
        </p>

        <p className="text-4xl font-bold mt-2">
          {metrics.closingBalance}
        </p>

        <p className="text-sm text-slate-500 mt-2">
          Opening + Net Movement - Assigned - Expended
        </p>

      </div>


      {/* Net Movement Modal */}

      {showModal && (

        <NetMoveModal
          metrics={metrics}
          onClose={() => setShowModal(false)}
        />

      )}

    </div>

  );

}