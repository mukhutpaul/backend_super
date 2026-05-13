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

/* ========================= STYLE SELECT ========================= */

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

    /* ========================= QR DATA ========================= */

    const buildQRData = (c: Controle) => {
        const p = c.policier;

        return JSON.stringify({
            matricule: c.matricule,
            nom: p?.nom || "",
            postnom: p?.postnom || "",
            genre: p?.sexe || "",
            groupe: p?.groupeSanguin || "",
            dateNaissance: p?.dateNaissance || "",
            lieuNaissance: p?.lieuNaissance || "",
        });
    };

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

    /* ========================= INIT AUTO REFRESH ========================= */

    useEffect(() => {
        loadData();

        const interval = setInterval(() => {
            loadData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    /* ========================= FILTER UNITE ========================= */

    const uniqueUnites = useMemo(() => {
        return Array.from(
            new Set(controles.map((c) => c.unite).filter(Boolean))
        );
    }, [controles]);

    /* ========================= FILTER DATA ========================= */

    const filteredControles = useMemo(() => {
        return controles.filter((c) => {

            const matchSearch =
                !search ||
                c.matricule?.toLowerCase().includes(search.toLowerCase()) ||
                c.noms?.toLowerCase().includes(search.toLowerCase()) ||
                c.grade?.toLowerCase().includes(search.toLowerCase()) ||
                c.unite?.toLowerCase().includes(search.toLowerCase());

            const matchUnite =
                !selectedUnite || c.unite === selectedUnite;

            return matchSearch && matchUnite;
        });
    }, [controles, search, selectedUnite]);

    /* ========================= PAGINATION ========================= */

    const totalPages = Math.ceil(filteredControles.length / ITEMS_PER_PAGE);

    const paginatedControles = useMemo(() => {
        return filteredControles.slice(
            (page - 1) * ITEMS_PER_PAGE,
            page * ITEMS_PER_PAGE
        );
    }, [filteredControles, page]);

    /* ========================= PDF PRINT ========================= */

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

        // ✅ QR IDENTIQUE UI + PDF
        const qrData = await QRCode.toDataURL(buildQRData(c), {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 300,
        });

        doc.addImage(qrData, "PNG", 48, 25, 22, 22);

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

                <h1 className="text-2xl font-bold">Contrôles</h1>

                {/* SEARCH */}
                <div className="card bg-base-200">
                    <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="relative">
                            <Search className="absolute left-3 top-3 opacity-50" />
                            <input
                                className="input input-bordered w-full pl-10"
                                placeholder="Recherche..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>

                        <Select
                            placeholder="Filtrer unité"
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
                                            loading...
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

                {/* MODAL QR */}
                {selectedControle && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

                            {/* HEADER */}
                            <div className="bg-blue-900 text-white p-4 text-center">
                                <h2 className="text-lg font-bold tracking-wide">
                                    PNC - CONTRÔLE
                                </h2>
                                <p className="text-xs opacity-80">
                                    Police Nationale Congolaise
                                </p>
                            </div>

                            {/* BODY */}
                            <div className="p-5 space-y-4">

                                {/* NOM PRINCIPAL */}
                                <div className="text-center">
                                    <p className="text-xl font-extrabold uppercase text-gray-800">
                                        {selectedControle?.policier?.noms}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {selectedControle?.policier?.postnom} {selectedControle?.policier?.prenom}
                                    </p>
                                </div>

                                {/* INFOS + QR */}
                                <div className="grid grid-cols-2 gap-4 items-center">

                                    {/* INFOS */}
                                    <div className="text-xs space-y-1 bg-gray-50 p-3 rounded-lg">
                                        <p><span className="font-semibold">Mat:</span> {selectedControle.matricule}</p>
                                        <p><span className="font-semibold">Grade:</span> {selectedControle.grade}</p>
                                        <p><span className="font-semibold">Unité:</span> {selectedControle.unite}</p>

                                        <p className="mt-2">
                                            <span className={`px-2 py-1 rounded text-white text-[10px]
                                ${selectedControle.present ? "bg-green-600" : "bg-red-600"}`}>
                                                {selectedControle.present ? "PRESENT" : "ABSENT"}
                                            </span>
                                        </p>
                                    </div>

                                    {/* QR */}
                                    <div className="flex justify-center">
                                        <div className="p-2 bg-white border rounded-xl shadow">
                                            <QRCodeCanvas
                                                value={buildQRData(selectedControle)}
                                                size={140}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-2 pt-3">

                                    <button
                                        className="btn btn-outline w-1/2"
                                        onClick={() => setSelectedControle(null)}
                                    >
                                        Fermer
                                    </button>

                                    <button
                                        className="btn btn-primary w-1/2"
                                        onClick={() => handlePrintPDF(selectedControle)}
                                    >
                                        Imprimer PDF
                                    </button>

                                </div>

                            </div>

                        </div>
                    </div>
                )}

            </div>

        </DashboardLayout>
    );
}