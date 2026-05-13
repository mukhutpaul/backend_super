"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Search, Printer } from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

import { Controle, getControles } from "@/services/controle.service";

/* ========================= TYPES ========================= */

type Policier = {
    id: string;
    matricule: string;
    noms: string;
    postnom: string;
    prenom: string;
};

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
    const [search, setSearch] = useState("");
    const [selectedUnite, setSelectedUnite] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const [initialLoading, setInitialLoading] = useState(true);

    const [selectedControle, setSelectedControle] = useState<Controle | null>(null);

    /* ========================= LOAD ========================= */

    const loadData = async () => {
        try {
            const res = await getControles();
            setControles(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error(err);
            toast.error("Erreur chargement contrôles");
        } finally {
            setInitialLoading(false);
        }
    };

    /* ========================= INIT + AUTO REFRESH ========================= */

    useEffect(() => {
        loadData();

        const interval = setInterval(() => {
            loadData();
        }, 5000);

        return () => clearInterval(interval);

    }, []);

    /* ========================= UNIQUES UNITES ========================= */

    const uniqueUnites = useMemo(() => {
        return Array.from(
            new Set(controles.map((c) => c.unite).filter(Boolean))
        );
    }, [controles]);

    /* ========================= FILTERS ========================= */

    const filteredControles = useMemo(() => {

        return controles.filter((c) => {

            const matchSearch =
                !search ||
                c.matricule?.toLowerCase().includes(search.toLowerCase()) ||
                c.noms?.toLowerCase().includes(search.toLowerCase()) ||
                c.grade?.toLowerCase().includes(search.toLowerCase()) ||
                c.unite?.toLowerCase().includes(search.toLowerCase());

            const matchUnite =
                !selectedUnite ||
                c.unite === selectedUnite;

            return matchSearch && matchUnite;
        });

    }, [controles, search, selectedUnite]);

    /* ========================= PAGINATION FRONT ========================= */

    const totalPages = Math.ceil(
        filteredControles.length / ITEMS_PER_PAGE
    );

    const paginatedControles = useMemo(() => {
        return filteredControles.slice(
            (page - 1) * ITEMS_PER_PAGE,
            page * ITEMS_PER_PAGE
        );
    }, [filteredControles, page]);

    /* ========================= PRINT ========================= */

    const handlePrintPDF = async (c: Controle) => {

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [74, 105],
        });

        const p = c.policier;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("CONTRÔLE PNC", 37, 10, { align: "center" });

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Police Nationale Congolaise", 37, 14, { align: "center" });

        doc.line(5, 16, 69, 16);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("IDENTITE", 5, 22);

        doc.setFont("helvetica", "normal");
        doc.text(`Nom     : ${p?.nom ?? "-"}`, 5, 28);
        doc.text(`Postnom : ${p?.postnom ?? "-"}`, 5, 33);
        doc.text(`Prenom  : ${p?.prenom ?? "-"}`, 5, 38);

        doc.setFont("helvetica", "bold");
        doc.text("CONTROLE", 5, 47);

        doc.setFont("helvetica", "normal");
        doc.text(`Matricule : ${c.matricule}`, 5, 53);
        doc.text(`Grade     : ${c.grade}`, 5, 58);
        doc.text(`Unité     : ${c.unite}`, 5, 63);

        const qrData = await QRCode.toDataURL(JSON.stringify(c));
        doc.addImage(qrData, "PNG", 48, 25, 22, 22);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(c.present ? 0 : 180, c.present ? 120 : 0, 0);

        doc.text(
            c.present ? "PRESENT" : "ABSENT",
            37,
            75,
            { align: "center" }
        );

        doc.setTextColor(0, 0, 0);

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

    /* ========================= UI ========================= */

    return (
        <DashboardLayout>

            <div className="p-6 space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-bold">Contrôles</h1>
                    <p className="text-sm opacity-70">
                        Liste des contrôles en temps réel
                    </p>
                </div>

                {/* SEARCH + FILTER */}
                <div className="card bg-base-200">
                    <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="relative">
                            <Search className="absolute left-3 top-3 opacity-50" />
                            <input
                                className="input input-bordered w-full pl-10"
                                placeholder="Recherche matricule, nom, grade..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>

                        <Select
                            placeholder="Filtrer par unité"
                            unstyled
                            isClearable
                            classNames={selectStyles}
                            options={uniqueUnites.map((u) => ({
                                value: u,
                                label: u,
                            }))}
                            onChange={(opt: any) => {
                                setSelectedUnite(opt?.value || null);
                                setPage(1);
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
                                        <th>Noms</th>
                                        <th>Unité</th>
                                        <th>Grade</th>
                                        <th>Présent</th>
                                        <th>Justifié</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {initialLoading && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10">
                                                <span className="loading loading-spinner"></span>
                                            </td>
                                        </tr>
                                    )}

                                    {!initialLoading && paginatedControles.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10">
                                                <Search className="mx-auto opacity-50" />
                                                <p>Aucun contrôle</p>
                                            </td>
                                        </tr>
                                    )}

                                    {!initialLoading && paginatedControles.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.matricule}</td>
                                            <td>{c.noms}</td>
                                            <td>{c.unite}</td>
                                            <td>{c.grade}</td>
                                            <td>{c.present ? "Oui" : "Non"}</td>
                                            <td>{c.justifie ? "Oui" : "Non"}</td>

                                            <td>
                                                {c.present && (
                                                    <button
                                                        className="btn btn-sm btn-primary btn-outline"
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
                        {filteredControles.length} contrôles
                    </p>

                    <div className="join">

                        <button
                            className="join-item btn btn-sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            «Précedant
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={`join-item btn btn-sm ${page === p ? "btn-primary" : ""}`}
                                onClick={() => setPage(p)}
                            >
                                
                            </button>
                        ))}

                        <button
                            className="join-item btn btn-sm"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Suivant»
                        </button>

                    </div>

                </div>

            </div>

            {/* MODAL */}
            {selectedControle && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-5 space-y-4">

                        <div className="text-center border-b pb-3">
                            <h2 className="text-lg font-bold uppercase">PNC Contrôle</h2>
                            <p className="text-xs opacity-60">Police Nationale Congolaise</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <p className="font-bold">{selectedControle?.policier?.nom || "-"}</p>
                                <p>{selectedControle?.policier?.postnom || "-"}</p>
                                <p>{selectedControle?.policier?.prenom || "-"}</p>

                                <div className="text-xs mt-2">
                                    <p>Mat: {selectedControle.matricule}</p>
                                    <p>Grade: {selectedControle.grade}</p>
                                    <p>Unité: {selectedControle.unite}</p>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <QRCodeCanvas value={JSON.stringify(selectedControle)} size={150} />
                            </div>

                        </div>

                        <div className="flex justify-center">
                            <span className={`px-3 py-1 text-white text-xs rounded ${selectedControle.present ? "bg-green-600" : "bg-red-600"}`}>
                                {selectedControle.present ? "PRESENT" : "ABSENT"}
                            </span>
                        </div>

                        <div className="flex gap-2 pt-3 border-t">
                            <button className="btn btn-outline w-1/2" onClick={() => setSelectedControle(null)}>
                                Fermer
                            </button>

                            <button className="btn btn-primary w-1/2" onClick={() => handlePrintPDF(selectedControle)}>
                                Imprimer
                            </button>
                        </div>

                    </div>

                </div>
            )}

        </DashboardLayout>
    );
}