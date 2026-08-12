import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingCart,
    ArrowRightLeft,
    UserRound,
    Shield,
    LogOut
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";


const links = [
    {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard
    },
    {
        to: "/purchases",
        label: "Purchases",
        icon: ShoppingCart
    },
    {
        to: "/transfers",
        label: "Transfers",
        icon: ArrowRightLeft
    },
    {
        to: "/assignments",
        label: "Assignments",
        icon: UserRound
    }
];


export default function Sidebar() {

    const { logout } = useAuth();

    const navigate = useNavigate();


    const handleLogout = () => {

        logout();

        navigate("/login", {
            replace: true
        });

    };


    return (

        <aside className="w-64 min-h-screen bg-slate-900 text-white p-5 flex flex-col">


            <div className="flex items-center gap-3 mb-8">

                <Shield size={30} />

                <div>

                    <h1 className="font-bold text-lg">
                        Kristallball
                    </h1>

                    <p className="text-xs text-slate-400">
                        Asset Management
                    </p>

                </div>

            </div>


            <nav className="space-y-2">

                {links.map(
                    ({
                        to,
                        label,
                        icon: Icon
                    }) => (

                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg ${
                                    isActive
                                        ? "bg-slate-700"
                                        : "hover:bg-slate-800"
                                }`
                            }
                        >

                            <Icon size={19} />

                            {label}

                        </NavLink>

                    )
                )}

            </nav>


            <div className="mt-auto pt-6">

                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
                >

                    <LogOut size={19} />

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>

    );

}