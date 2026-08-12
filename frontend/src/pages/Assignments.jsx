import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

export default function Assignments() {

    // ASSIGNMENT FORM

    const [assignmentBaseId, setAssignmentBaseId] =
        useState("");

    const [assignmentEquipmentTypeId, setAssignmentEquipmentTypeId] =
        useState("");

    const [personnelName, setPersonnelName] =
        useState("");

    const [assignmentQuantity, setAssignmentQuantity] =
        useState("");


    // EXPENDITURE FORM

    const [expenditureBaseId, setExpenditureBaseId] =
        useState("");

    const [expenditureEquipmentTypeId, setExpenditureEquipmentTypeId] =
        useState("");

    const [expenditureQuantity, setExpenditureQuantity] =
        useState("");

    const [reason, setReason] =
        useState("");


    // DATA

    const [bases, setBases] =
        useState([]);

    const [equipmentTypes, setEquipmentTypes] =
        useState([]);

    const [assignments, setAssignments] =
        useState([]);

    const [expenditures, setExpenditures] =
        useState([]);


    // UI STATE

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // TOKEN

    const getToken = () => {

        return localStorage.getItem("token");

    };


    // LOAD BASES + EQUIPMENT TYPES

    const loadMasterData = async () => {

        try {

            const token = getToken();

            const [basesResponse, equipmentResponse] =
                await Promise.all([

                    fetch(
                        `${API_BASE}/bases`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    ),

                    fetch(
                        `${API_BASE}/equipment-types`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )

                ]);


            const basesData =
                await basesResponse.json();

            const equipmentData =
                await equipmentResponse.json();


            if (!basesResponse.ok) {

                throw new Error(
                    basesData.message ||
                    "Failed to load bases"
                );

            }


            if (!equipmentResponse.ok) {

                throw new Error(
                    equipmentData.message ||
                    "Failed to load equipment types"
                );

            }


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

            setError(err.message);

        }

    };


    // LOAD ASSIGNMENTS

    const loadAssignments = async () => {

        try {

            const token = getToken();

            const response = await fetch(
                `${API_BASE}/assignments`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            console.log(
                "ASSIGNMENTS RESPONSE:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load assignments"
                );

            }


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

            setError(err.message);

        }

    };


    // LOAD EXPENDITURES

    const loadExpenditures = async () => {

        try {

            const token = getToken();

            const response = await fetch(
                `${API_BASE}/expenditures`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            console.log(
                "EXPENDITURES RESPONSE:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load expenditures"
                );

            }


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

            setError(err.message);

        }

    };

    // LOAD ALL DATA
    useEffect(() => {

        loadMasterData();

        loadAssignments();

        loadExpenditures();

    }, []);

    // CREATE ASSIGNMENT

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


        if (
            Number(assignmentQuantity) <= 0
        ) {

            setError(
                "Assignment quantity must be greater than zero."
            );

            return;

        }


        try {

            setLoading(true);

            const token = getToken();


            const response = await fetch(
                `${API_BASE}/assignments`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

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

                    })

                }
            );


            const data =
                await response.json();


            console.log(
                "CREATE ASSIGNMENT:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to create assignment"
                );

            }


            setMessage(
                "Assignment recorded successfully."
            );


            // Clear form

            setAssignmentBaseId("");

            setAssignmentEquipmentTypeId("");

            setPersonnelName("");

            setAssignmentQuantity("");


            // Refresh table

            await loadAssignments();


        } catch (err) {

            console.error(
                "Create assignment error:",
                err
            );

            setError(err.message);

        } finally {

            setLoading(false);

        }

    };
    // CREATE EXPENDITURE
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


        if (
            Number(expenditureQuantity) <= 0
        ) {

            setError(
                "Expenditure quantity must be greater than zero."
            );

            return;

        }


        try {

            setLoading(true);

            const token = getToken();


            const response = await fetch(
                `${API_BASE}/expenditures`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

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

                    })

                }
            );


            const data =
                await response.json();


            console.log(
                "CREATE EXPENDITURE:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to create expenditure"
                );

            }


            setMessage(
                "Expenditure recorded successfully."
            );


            // Clear form

            setExpenditureBaseId("");

            setExpenditureEquipmentTypeId("");

            setExpenditureQuantity("");

            setReason("");


            // Refresh table

            await loadExpenditures();


        } catch (err) {

            console.error(
                "Create expenditure error:",
                err
            );

            setError(err.message);

        } finally {

            setLoading(false);

        }

    };
    // FORMAT DATE
    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString();

    };

    // UI
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



            {message && (

                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-5">

                    {message}

                </div>

            )}



            {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-5">

                    {error}

                </div>

            )}


            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">

                <h2 className="text-xl font-semibold mb-5">
                    Assign Equipment
                </h2>


                <form
                    onSubmit={
                        handleAssignmentSubmit
                    }
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                    {/* BASE */}

                    <div>

                        <label className="block text-sm font-medium mb-2">
                            Base
                        </label>

                        <select
                            value={
                                assignmentBaseId
                            }
                            onChange={(e) =>
                                setAssignmentBaseId(
                                    e.target.value
                                )
                            }
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
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


                    {/* EQUIPMENT */}

                    <div>

                        <label className="block text-sm font-medium mb-2">
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
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
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


                    {/* PERSONNEL */}

                    <div>

                        <label className="block text-sm font-medium mb-2">
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
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        />

                    </div>


                    {/* QUANTITY */}

                    <div>

                        <label className="block text-sm font-medium mb-2">
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
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        />

                    </div>


                    {/* BUTTON */}

                    <div className="md:col-span-2">

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                        >

                            {loading
                                ? "Saving..."
                                : "Assign Equipment"}

                        </button>

                    </div>

                </form>

            </div>



            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">

                <h2 className="text-xl font-semibold mb-5">
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

                                <tr className="border-b text-left">

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
                                                    assignment.base_id
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    assignment.equipment_name ||
                                                    assignment.equipment_type_id
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    assignment.personnel_name
                                                }
                                            </td>

                                            <td className="py-3 px-2 font-semibold">
                                                {
                                                    assignment.quantity
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    formatDate(
                                                        assignment.assigned_date
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


            {/*
                EXPENDITURE FORM
          */}

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">

                <h2 className="text-xl font-semibold mb-5">
                    Record Expenditure
                </h2>


                <form
                    onSubmit={
                        handleExpenditureSubmit
                    }
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                    {/* BASE */}

                    <div>

                        <label className="block text-sm font-medium mb-2">
                            Base
                        </label>

                        <select
                            value={
                                expenditureBaseId
                            }
                            onChange={(e) =>
                                setExpenditureBaseId(
                                    e.target.value
                                )
                            }
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
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


                    {/* EQUIPMENT */}

                    <div>

                        <label className="block text-sm font-medium mb-2">
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
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
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


                    {/* QUANTITY */}

                    <div>

                        <label className="block text-sm font-medium mb-2">
                            Quantity
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={
                                expenditureQuantity
                            }
                            onChange={(e) =>
                                setExpenditureQuantity(
                                    e.target.value
                                )
                            }
                            placeholder="Enter quantity"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        />

                    </div>


                    {/* REASON */}

                    <div>

                        <label className="block text-sm font-medium mb-2">
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
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        />

                    </div>


                    {/* BUTTON */}

                    <div className="md:col-span-2">

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                        >

                            {loading
                                ? "Saving..."
                                : "Record Expenditure"}

                        </button>

                    </div>

                </form>

            </div>

         
                //EXPENDITURE HISTORY
             

            <div className="bg-white rounded-xl border border-slate-200 p-6">

                <h2 className="text-xl font-semibold mb-5">
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

                                <tr className="border-b text-left">

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
                                                    expenditure.base_id
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    expenditure.equipment_name ||
                                                    expenditure.equipment_type_id
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    expenditure.category ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="py-3 px-2 font-semibold">
                                                {
                                                    expenditure.quantity
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    expenditure.reason
                                                }
                                            </td>

                                            <td className="py-3 px-2">
                                                {
                                                    formatDate(
                                                        expenditure.expended_date
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