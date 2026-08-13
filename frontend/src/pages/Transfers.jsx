import { useEffect, useState } from "react";
import api from "../services/api";

export default function Transfers() {
  const [sourceBaseId, setSourceBaseId] = useState("");
  const [destinationBaseId, setDestinationBaseId] = useState("");
  const [equipmentTypeId, setEquipmentTypeId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const token = getToken();

        if (!token) {
          setError("Please login first.");
          return;
        }

        const [basesResponse, equipmentResponse] =
          await Promise.all([
            api.get("/assets/bases"),
            api.get("/assets/equipment-types"),
          ]);

        const basesData = basesResponse.data;
        const equipmentData = equipmentResponse.data;

        setBases(
          basesData.bases ||
          basesData.data ||
          []
        );

        setEquipmentTypes(
          equipmentData.equipmentTypes ||
          equipmentData.data ||
          []
        );
      } catch (err) {
        console.error(
          "Transfer data loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load transfer data"
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const loadTransferHistory = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await api.get("/transfers");

      const data = response.data;

      setTransfers(
        data.transfers ||
        data.data ||
        []
      );
    } catch (err) {
      console.error(
        "Transfer history error:",
        err
      );

      setTransfers([]);
    }
  };

  useEffect(() => {
    loadTransferHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !sourceBaseId ||
      !destinationBaseId ||
      !equipmentTypeId ||
      !quantity
    ) {
      setError(
        "Please select source base, destination base, equipment type and quantity."
      );

      return;
    }

    if (
      Number(sourceBaseId) ===
      Number(destinationBaseId)
    ) {
      setError(
        "Source base and destination base must be different."
      );

      return;
    }

    if (Number(quantity) <= 0) {
      setError(
        "Quantity must be greater than zero."
      );

      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login first."
        );
      }

      await api.post(
        "/transfers",
        {
          sourceBaseId:
            Number(sourceBaseId),

          destinationBaseId:
            Number(destinationBaseId),

          equipmentTypeId:
            Number(equipmentTypeId),

          quantity:
            Number(quantity),
        }
      );

      setMessage(
        "Transfer created successfully."
      );

      setSourceBaseId("");
      setDestinationBaseId("");
      setEquipmentTypeId("");
      setQuantity("");

      await loadTransferHistory();
    } catch (err) {
      console.error(
        "Create transfer error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create transfer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-bold mb-2">
          Transfers
        </h1>

        <p className="text-slate-500">
          Manage cross-base asset transfers.
        </p>
      </div>

      {loadingData && (
        <div className="
          bg-blue-50
          border
          border-blue-200
          text-blue-700
          rounded-lg
          p-4
          mb-5
        ">
          Loading bases and equipment...
        </div>
      )}

      {message && (
        <div className="
          bg-green-50
          border
          border-green-200
          text-green-700
          rounded-lg
          p-4
          mb-5
        ">
          {message}
        </div>
      )}

      {error && (
        <div className="
          bg-red-50
          border
          border-red-200
          text-red-700
          rounded-lg
          p-4
          mb-5
        ">
          {error}
        </div>
      )}

      <div className="
        bg-white
        rounded-xl
        border
        border-slate-200
        p-6
        mb-6
      ">
        <h2 className="
          text-xl
          font-semibold
          mb-5
        ">
          Create New Transfer
        </h2>

        <form
          onSubmit={handleSubmit}
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-5
          "
        >
          <div>
            <label className="
              block
              text-sm
              font-medium
              mb-2
            ">
              Source Base
            </label>

            <select
              value={sourceBaseId}
              onChange={(e) =>
                setSourceBaseId(
                  e.target.value
                )
              }
              disabled={loadingData}
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2
                bg-white
              "
            >
              <option value="">
                Select Source Base
              </option>

              {bases.map((base) => (
                <option
                  key={base.id}
                  value={base.id}
                >
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="
              block
              text-sm
              font-medium
              mb-2
            ">
              Destination Base
            </label>

            <select
              value={destinationBaseId}
              onChange={(e) =>
                setDestinationBaseId(
                  e.target.value
                )
              }
              disabled={loadingData}
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2
                bg-white
              "
            >
              <option value="">
                Select Destination Base
              </option>

              {bases.map((base) => (
                <option
                  key={base.id}
                  value={base.id}
                >
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="
              block
              text-sm
              font-medium
              mb-2
            ">
              Equipment Type
            </label>

            <select
              value={equipmentTypeId}
              onChange={(e) =>
                setEquipmentTypeId(
                  e.target.value
                )
              }
              disabled={loadingData}
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2
                bg-white
              "
            >
              <option value="">
                Select Equipment
              </option>

              {equipmentTypes.map(
                (equipment) => (
                  <option
                    key={equipment.id}
                    value={equipment.id}
                  >
                    {equipment.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="
              block
              text-sm
              font-medium
              mb-2
            ">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="Enter quantity"
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2
              "
            />
          </div>

          <div className="
            md:col-span-2
            xl:col-span-4
          ">
            <button
              type="submit"
              disabled={
                loading ||
                loadingData
              }
              className="
                bg-slate-900
                text-white
                px-6
                py-2.5
                rounded-lg
                hover:bg-slate-800
                disabled:opacity-50
              "
            >
              {loading
                ? "Creating..."
                : "Create Transfer"}
            </button>
          </div>
        </form>
      </div>

      <div className="
        bg-white
        rounded-xl
        border
        border-slate-200
        p-6
      ">
        <h2 className="
          text-xl
          font-semibold
          mb-5
        ">
          Transfer History
        </h2>

        {transfers.length === 0 ? (
          <p className="text-slate-500">
            No transfers recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="
                  border-b
                  text-left
                ">
                  <th className="py-3 px-2">
                    ID
                  </th>

                  <th className="py-3 px-2">
                    Source
                  </th>

                  <th className="py-3 px-2">
                    Destination
                  </th>

                  <th className="py-3 px-2">
                    Equipment
                  </th>

                  <th className="py-3 px-2">
                    Quantity
                  </th>

                  <th className="py-3 px-2">
                    Status
                  </th>

                  <th className="py-3 px-2">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {transfers.map(
                  (transfer) => (
                    <tr
                      key={transfer.id}
                      className="border-b"
                    >
                      <td className="py-3 px-2">
                        {transfer.id}
                      </td>

                      <td className="py-3 px-2">
                        {transfer.source_base_name ||
                          transfer.source_base_id ||
                          "-"}
                      </td>

                      <td className="py-3 px-2">
                        {transfer.destination_base_name ||
                          transfer.destination_base_id ||
                          "-"}
                      </td>

                      <td className="py-3 px-2">
                        {transfer.equipment_name ||
                          transfer.equipment_type_id ||
                          "-"}
                      </td>

                      <td className="
                        py-3
                        px-2
                        font-semibold
                      ">
                        {transfer.quantity}
                      </td>

                      <td className="py-3 px-2">
                        {transfer.status || "-"}
                      </td>

                      <td className="py-3 px-2">
                        {transfer.created_at ||
                          transfer.transfer_date ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}