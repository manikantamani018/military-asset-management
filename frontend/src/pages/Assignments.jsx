import { useEffect, useState } from "react";
import api from "../services/api";

export default function Assignments() {
    const [assignmentBaseId, setAssignmentBaseId] = useState("");
    const [assignmentEquipmentTypeId, setAssignmentEquipmentTypeId] = useState("");
    const [personnelName, setPersonnelName] = useState("");
    const [assignmentQuantity, setAssignmentQuantity] = useState("");

    const [expenditureBaseId, setExpenditureBaseId] = useState("");
    const [expenditureEquipmentTypeId, setExpenditureEquipmentTypeId] = useState("");
    const [expenditureQuantity, setExpenditureQuantity] = useState("");
    const [reason, setReason] = useState("");

    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [expenditures, setExpenditures] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadMasterData = async () => {
        try {
            setLoadingData(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login first.");
                return;
            }

            const [
                basesResponse,
                equipmentResponse
            ] = await Promise.all([
                api.get("/assets/bases"),
                api.get("/assets/equipment-types")
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
                "Master data error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load master data"
            );
        } finally {
            setLoadingData(false);
        }
    };

    const loadAssignments = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response =
                await api.get("/assignments");

            const data = response.data;

            setAssignments(
                data.assignments ||
                data.data ||
                []
            );
        } catch (err) {
            console.error(
                "Assignments error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load assignments"
            );
        }
    };

    const loadExpenditures = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response =
                await api.get("/expenditures");

            const data = response.data;

            setExpenditures(
                data.expenditures ||
                data.data ||
                []
            );
        } catch (err) {
            console.error(
                "Expenditures error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load expenditures"
            );
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await loadMasterData();
            await loadAssignments();
            await loadExpenditures();
        };

        loadData();
    }, []);

    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            !assignmentBaseId ||
            !assignmentEquipmentTypeId ||
            !personnelName ||
            !assignmentQuantity
        ) {
            setError(
                "Please fill all assignment fields."
            );

            return;
        }

        if (Number(assignmentQuantity) <= 0) {
            setError(
                "Assignment quantity must be greater than zero."
            );

            return;
        }

        try {
            setLoading(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Please login first."
                );
            }

            await api.post(
                "/assignments",
                {
                    baseId:
                        Number(
                            assignmentBaseId
                        ),

                    equipmentTypeId:
                        Number(
                            assignmentEquipmentTypeId
                        ),

                    personnelName:
                        personnelName.trim(),

                    quantity:
                        Number(
                            assignmentQuantity
                        )
                }
            );

            setMessage(
                "Assignment recorded successfully."
            );

            setAssignmentBaseId("");
            setAssignmentEquipmentTypeId("");
            setPersonnelName("");
            setAssignmentQuantity("");

            await loadAssignments();
        } catch (err) {
            console.error(
                "Create assignment error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to create assignment"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleExpenditureSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            !expenditureBaseId ||
            !expenditureEquipmentTypeId ||
            !expenditureQuantity ||
            !reason
        ) {
            setError(
                "Please fill all expenditure fields."
            );

            return;
        }

        if (Number(expenditureQuantity) <= 0) {
            setError(
                "Expenditure quantity must be greater than zero."
            );

            return;
        }

        try {
            setLoading(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Please login first."
                );
            }

            await api.post(
                "/expenditures",
                {
                    baseId:
                        Number(
                            expenditureBaseId
                        ),

                    equipmentTypeId:
                        Number(
                            expenditureEquipmentTypeId
                        ),

                    quantity:
                        Number(
                            expenditureQuantity
                        ),

                    reason:
                        reason.trim()
                }
            );

            setMessage(
                "Expenditure recorded successfully."
            );

            setExpenditureBaseId("");
            setExpenditureEquipmentTypeId("");
            setExpenditureQuantity("");
            setReason("");

            await loadExpenditures();
        } catch (err) {
            console.error(
                "Create expenditure error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to create expenditure"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString();
    };

    return (
        <div>

            <div className="mb-7">

                <h1 className="text-3xl font-bold mb-2">
                    Assignments & Expenditures
                </h1>

                <p className="text-slate-500">
                    Track personnel allocations and consumed assets.
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
                    Assign Equipment
                </h2>

                <form
                    onSubmit={handleAssignmentSubmit}
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
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
                            value={assignmentBaseId}
                            onChange={(e) =>
                                setAssignmentBaseId(
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
                                Select Base
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
                            value={
                                assignmentEquipmentTypeId
                            }
                            onChange={(e) =>
                                setAssignmentEquipmentTypeId(
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
                            Personnel Name
                        </label>

                        <input
                            type="text"
                            value={personnelName}
                            onChange={(e) =>
                                setPersonnelName(
                                    e.target.value
                                )
                            }
                            placeholder="Enter personnel name"
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
                            value={assignmentQuantity}
                            onChange={(e) =>
                                setAssignmentQuantity(
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

                    <div className="md:col-span-2">

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
                                : "Assign Equipment"}
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
                mb-6
            ">

                <h2 className="
                    text-xl
                    font-semibold
                    mb-5
                ">
                    Assignment History
                </h2>

                {assignments.length === 0 ? (

                    <p className="text-slate-500">
                        No assignments recorded yet.
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
                                        Base
                                    </th>

                                    <th className="py-3 px-2">
                                        Equipment
                                    </th>

                                    <th className="py-3 px-2">
                                        Personnel
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

                                {assignments.map(
                                    (assignment) => (

                                        <tr
                                            key={
                                                assignment.id
                                            }
                                            className="border-b"
                                        >

                                            <td className="py-3 px-2">
                                                {
                                                    assignment.id
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    assignment.base_name ||
                                                    assignment.base_id ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    assignment.equipment_name ||
                                                    assignment.equipment_type_id ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    assignment.personnel_name ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="
                                                py-3
                                                px-2
                                                font-semibold
                                            ">
                                                {
                                                    assignment.quantity
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    formatDate(
                                                        assignment.assigned_date ||
                                                        assignment.created_at
                                                    )
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
                    Record Expenditure
                </h2>

                <form
                    onSubmit={handleExpenditureSubmit}
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
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
                            value={expenditureBaseId}
                            onChange={(e) =>
                                setExpenditureBaseId(
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
                                Select Base
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
                            value={
                                expenditureEquipmentTypeId
                            }
                            onChange={(e) =>
                                setExpenditureEquipmentTypeId(
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
                            value={expenditureQuantity}
                            onChange={(e) =>
                                setExpenditureQuantity(
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

                    <div>

                        <label className="
                            block
                            text-sm
                            font-medium
                            mb-2
                        ">
                            Reason
                        </label>

                        <input
                            type="text"
                            value={reason}
                            onChange={(e) =>
                                setReason(
                                    e.target.value
                                )
                            }
                            placeholder="Enter expenditure reason"
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

                    <div className="md:col-span-2">

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
                                : "Record Expenditure"}
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
                    Expenditure History
                </h2>

                {expenditures.length === 0 ? (

                    <p className="text-slate-500">
                        No expenditures recorded yet.
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
                                        Reason
                                    </th>

                                    <th className="py-3 px-2">
                                        Date
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {expenditures.map(
                                    (expenditure) => (

                                        <tr
                                            key={
                                                expenditure.id
                                            }
                                            className="border-b"
                                        >

                                            <td className="py-3 px-2">
                                                {
                                                    expenditure.id
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    expenditure.base_name ||
                                                    expenditure.base_id ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    expenditure.equipment_name ||
                                                    expenditure.equipment_type_id ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    expenditure.category ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="
                                                py-3
                                                px-2
                                                font-semibold
                                            ">
                                                {
                                                    expenditure.quantity
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    expenditure.reason ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    formatDate(
                                                        expenditure.expended_date ||
                                                        expenditure.created_at
                                                    )
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