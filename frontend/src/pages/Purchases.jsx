import { useEffect, useState } from "react";
import api from "../services/api";

export default function Purchases() {
    const [baseId, setBaseId] = useState("");
    const [equipmentTypeId, setEquipmentTypeId] = useState("");
    const [quantity, setQuantity] = useState("");

    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    const [purchases, setPurchases] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const loadData = async () => {
        try {
            setLoadingData(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login first.");
                return;
            }

            const basesResponse = await api.get("/assets/bases");
            const basesData = basesResponse.data;

            setBases(
                basesData.bases ||
                basesData.data ||
                []
            );

            const equipmentResponse =
                await api.get("/assets/equipment-types");

            const equipmentData =
                equipmentResponse.data;

            setEquipmentTypes(
                equipmentData.equipmentTypes ||
                equipmentData.data ||
                []
            );

        } catch (err) {
            console.error(
                "Failed to load purchase data:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load purchase data"
            );

        } finally {
            setLoadingData(false);
        }
    };

    const loadPurchaseHistory = async () => {
        try {
            const token = getToken();

            if (!token) {
                return;
            }

            const response = await api.get("/purchases");
            const data = response.data;

            setPurchases(
                data.purchases ||
                data.data ||
                []
            );

        } catch (err) {
            console.error(
                "History error:",
                err
            );
        }
    };

    useEffect(() => {
        loadData();
        loadPurchaseHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            !baseId ||
            !equipmentTypeId ||
            !quantity
        ) {
            setError(
                "Please select a base, equipment type and quantity."
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
                "/purchases",
                {
                    baseId: Number(baseId),
                    equipmentTypeId:
                        Number(equipmentTypeId),
                    quantity:
                        Number(quantity),
                }
            );

            setMessage(
                "Purchase recorded successfully."
            );

            setBaseId("");
            setEquipmentTypeId("");
            setQuantity("");

            await loadPurchaseHistory();

        } catch (err) {
            console.error(
                "Purchase error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to create purchase"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div>

            <div className="mb-7">

                <h1 className="text-3xl font-bold mb-2">
                    Purchases
                </h1>

                <p className="text-slate-500">
                    Log incoming assets and review
                    purchase history.
                </p>

            </div>

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
                    Record New Purchase
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-3
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
                            Base
                        </label>

                        <select
                            value={baseId}
                            onChange={(e) =>
                                setBaseId(
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
                                {loadingData
                                    ? "Loading bases..."
                                    : "Select Base"}
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
                                {loadingData
                                    ? "Loading equipment..."
                                    : "Select Equipment"}
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

                    <div className="md:col-span-3">

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
                                ? "Saving..."
                                : "Record Purchase"}
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
                    Purchase History
                </h2>

                {purchases.length === 0 ? (

                    <p className="text-slate-500">
                        No purchases recorded yet.
                    </p>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="
                            w-full
                            text-sm
                        ">

                            <thead>

                                <tr className="
                                    border-b
                                    text-left
                                ">

                                    <th className="py-3 px-2">
                                        ID
                                    </th>

                                    <th className="py-3 px-2">
                                        Base
                                    </th>

                                    <th className="py-3 px-2">
                                        Equipment
                                    </th>

                                    <th className="py-3 px-2">
                                        Category
                                    </th>

                                    <th className="py-3 px-2">
                                        Quantity
                                    </th>

                                    <th className="py-3 px-2">
                                        Date
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {purchases.map(
                                    (purchase) => (

                                        <tr
                                            key={
                                                purchase.id
                                            }
                                            className="border-b"
                                        >

                                            <td className="py-3 px-2">
                                                {purchase.id}
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    purchase.base_name ||
                                                    purchase.base_id ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    purchase.equipment_name ||
                                                    purchase.equipment_type_id ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    purchase.category ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="
                                                py-3
                                                px-2
                                                font-semibold
                                            ">
                                                {
                                                    purchase.quantity
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    purchase.purchase_date ||
                                                    purchase.created_at ||
                                                    "-"
                                                }
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