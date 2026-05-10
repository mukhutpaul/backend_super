"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Search, Printer } from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

import { Controle, getControles } from "@/services/controle.service";
import { getUnites } from "@/services/unite.service";


/* ========================= TYPES ========================= */

type Unite = {
    id: number;
    name: string;
};

type Policier = {
    id: string; // ✅ UUID = string
    matricule: string;
    nom: string;
    postnom: string;
    prenom: string;
    sexe: string;
};

// type Controle = {
//     id: string;
//     uid?: string;

//     policier?: Policier; // ✅ IMPORTANT

//     present?: boolean;
//     justifie?: boolean;

//     situation?: string;
//     status?: string;

//     matricule?: string;
//     unite?: string;
//     grade?: string;

//     isActif?: boolean;
//     createdAt?: string;
// };

/* ========================= SELECT STYLE ========================= */

export const selectStyles = {
    control: () =>
        "input input-bordered w-full min-h-[48px] flex flex-wrap px-2",

    menu: () =>
        "bg-base-100 border border-base-300 rounded-box shadow-lg mt-2 z-50",

    option: ({ isFocused, isSelected }: any) =>
        `
        px-4 py-2 cursor-pointer text-sm
        ${isFocused ? "bg-base-200" : ""}
        ${isSelected ? "bg-primary text-primary-content" : ""}
    `,
};

/* ========================= PAGE ========================= */

export default function ControlePage() {

    const [controles, setControles] = useState<Controle[]>([]);
    const [unites, setUnites] = useState<Unite[]>([]);

    const [search, setSearch] = useState("");
    const [selectedUnite, setSelectedUnite] = useState<number | null>(null);

    const [page, setPage] = useState(0);
    const size = 100;

    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    /* ========================= QR MODAL ========================= */

    const [selectedControle, setSelectedControle] = useState<Controle | null>(null);

    /* ========================= LOAD ========================= */

    const handlePrintPDF = async (c: Controle) => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [74, 105], // A8
        });

        const p = c.policier;

        // ================= HEADER =================
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("CONTRÔLE PNC", 37, 10, { align: "center" });

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Police Nationale Congolaise", 37, 14, { align: "center" });

        doc.line(5, 16, 69, 16);

        // ================= IDENTITÉ =================
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("IDENTITE", 5, 22);

        doc.setFont("helvetica", "normal");
        doc.text(`Nom     : ${p?.nom ?? "-"}`, 5, 28);
        doc.text(`Postnom : ${p?.postnom ?? "-"}`, 5, 33);
        doc.text(`Prenom  : ${p?.prenom ?? "-"}`, 5, 38);

        // ================= INFOS =================
        doc.setFont("helvetica", "bold");
        doc.text("CONTROLE", 5, 47);

        doc.setFont("helvetica", "normal");
        doc.text(`Matricule : ${c.matricule}`, 5, 53);
        doc.text(`Grade     : ${c.grade}`, 5, 58);
        doc.text(`Unité     : ${c.unite}`, 5, 63);

        // ================= QR CODE =================
        const qrData = await QRCode.toDataURL(JSON.stringify(c));
        doc.addImage(qrData, "PNG", 48, 25, 22, 22);

        // ================= STATUS =================
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(c.present ? 0 : 180, c.present ? 120 : 0, 0);

        doc.text(
            c.present ? "PRESENT" : "ABSENT",
            37,
            75,
            { align: "center" }
        );

        doc.setTextColor(0, 0, 0);

        // ================= FOOTER =================
        doc.setFontSize(6);
        doc.setFont("helvetica", "italic");
        doc.text("PNC - Document officiel de contrôle", 37, 100, {
            align: "center",
        });

        // ================= PRINT DIRECT (NO DOWNLOAD) =================
        const pdfBlobUrl = doc.output("bloburl");

        const printWindow = window.open(pdfBlobUrl);

        if (printWindow) {
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };
        } else {
            toast.error("Impossible d'ouvrir la fenêtre d'impression");
        }
    };
    const loadData = async () => {
        try {
            setLoading(true);

            const res = await getControles({
                page,
                size,
                search,
                unite: selectedUnite ? String(selectedUnite) : undefined,
            });

            setControles(res.content);
            setTotalPages(res.totalPages);

        } catch (err) {
            toast.error("Erreur chargement contrôles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, search, selectedUnite]);

    useEffect(() => {
        const loadUnites = async () => {
            try {
                const uni = await getUnites();
                setUnites(uni);
            } catch {
                toast.error("Erreur unités");
            }
        };

        loadUnites();
    }, []);

    /* ========================= UI ========================= */

    return (
        <DashboardLayout>

            <div className="p-6 space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-bold">Contrôles</h1>
                    <p className="text-sm opacity-70">
                        Liste des contrôles avec QR code imprimable
                    </p>
                </div>

                {/* FILTERS */}
                <div className="card bg-base-200">
                    <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">

                        <input
                            className="input input-bordered w-full"
                            placeholder="Recherche matricule..."
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                        />

                        <Select
                            placeholder="Filtrer par unité"
                            unstyled
                            isClearable
                            classNames={selectStyles}
                            options={unites.map((u) => ({
                                value: u.id,
                                label: u.name,
                            }))}
                            onChange={(opt: any) => {
                                setSelectedUnite(opt?.value || null);
                                setPage(0);
                            }}
                        />

                    </div>
                </div>

                {/* TABLE */}
                <div className="card bg-base-100 shadow-md">

                    <div className="card-body p-0">

                        <div className="overflow-x-auto">

                            <table className="table">

                                <thead className="bg-base-200">
                                    <tr>
                                        <th>Matricule</th>
                                        <th>Unité</th>
                                        <th>Grade</th>
                                        <th>Présent</th>
                                        <th>Statut</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {loading && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10">
                                                <span className="loading loading-spinner"></span>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && controles.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10">
                                                <Search className="mx-auto opacity-50" />
                                                <p>Aucun contrôle</p>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && controles.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.matricule}</td>
                                            <td>{c.unite}</td>
                                            <td>{c.grade}</td>
                                            <td>{c.present ? "Oui" : "Non"}</td>
                                            <td>{c.status}</td>

                                            <td>
                                                {c.present && (
                                                    <button
                                                        className="btn btn-sm btn-primary    btn-ou"
                                                        onClick={() => setSelectedControle(c)}
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                )}
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center">

                    <p className="text-sm opacity-70">
                        Page {page + 1} / {totalPages || 1}
                    </p>

                    <div className="join">

                        <button
                            className="join-item btn btn-sm"
                            disabled={page === 0}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            «
                        </button>

                        <button
                            className="join-item btn btn-sm"
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            »
                        </button>

                    </div>

                </div>

            </div>

            {/* ========================= QR MODAL ========================= */}
            {/* ========================= QR MODAL (A8 STYLE) ========================= */}
            {/* ========================= QR MODAL ========================= */}
            {selectedControle && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

                    {/* CARD */}
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-5 space-y-4">

                        {/* HEADER */}
                        <div className="text-center border-b pb-3">
                            <h2 className="text-lg font-bold uppercase">
                                Pnc-Contrôle
                            </h2>
                            <p className="text-xs opacity-60">
                                Police Nationale Congolaise
                            </p>
                        </div>

                        {/* INFOS PRINCIPALES */}
                        <div className="grid grid-cols-2 gap-4">

                            {/* IDENTITE */}
                            <div className="space-y-1">

                                <p className="text-base font-bold">
                                    {selectedControle?.policier?.nom || "-"}
                                </p>

                                <p className="text-base font-semibold">
                                    {selectedControle?.policier?.postnom || "-"}
                                </p>

                                <p className="text-base">
                                    {selectedControle?.policier?.prenom || "-"}
                                </p>

                                <div className="text-xs opacity-70 mt-2 space-y-1">
                                    <p><span className="font-semibold">Mat:</span> {selectedControle.matricule}</p>
                                    <p><span className="font-semibold">Grade:</span> {selectedControle.grade}</p>
                                    <p><span className="font-semibold">Unité:</span> {selectedControle.unite}</p>
                                </div>

                            </div>

                            {/* QR CODE */}
                            <div className="flex justify-center items-center">
                                <div className="p-2 border rounded-lg bg-white">
                                    <QRCodeCanvas
                                        value={JSON.stringify(selectedControle)}
                                        size={170}   // 👈 QR PLUS GRAND
                                    />
                                </div>
                            </div>

                        </div>

                        {/* STATUS */}
                        <div className="flex justify-center">
                            <span className={`text-xs px-3 py-1 rounded text-white font-semibold
                    ${selectedControle.present ? "bg-green-600" : "bg-red-600"}`}>
                                {selectedControle.present ? "PRESENT" : "ABSENT"}
                            </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-between pt-3 border-t">

                            <button
                                className="btn btn-sm btn-outline w-1/2 mr-2"
                                onClick={() => setSelectedControle(null)}
                            >
                                Fermer
                            </button>

                            <button
                                className="btn btn-sm btn-primary w-1/2 ml-2"
                                onClick={() => handlePrintPDF(selectedControle)}
                            >
                                Imprimer PDF
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}