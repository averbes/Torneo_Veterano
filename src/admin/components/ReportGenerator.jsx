import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Camera, FileText, Share2, Loader2, Sparkles } from 'lucide-react';

const ReportGenerator = ({ targetId, fileName = 'NEO_LEAGUE_REPORT', title = 'EXPORT PROTOCOL' }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateImage = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#050510',
                scale: 2, // Higher quality
                logging: false,
                useCORS: true, // For images from other domains (like Supabase storage)
                onclone: (clonedDoc) => {
                    // We can modify the cloned element before snapshot
                    const clonedElement = clonedDoc.getElementById(targetId);
                    clonedElement.style.padding = '40px';
                    clonedElement.style.borderRadius = '0px';
                }
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${fileName}.png`;
            link.click();
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePDF = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#050510',
                scale: 2,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${fileName}.pdf`);
        } catch (err) {
            console.error("PDF Export failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[8px] font-mono text-[#ffffff30] uppercase leading-none">{title}</span>
                <span className="text-[10px] font-black text-[#00f2ff] uppercase tracking-widest">Authorized</span>
            </div>

            <div className="flex bg-[#ffffff05] border border-[#ffffff10] p-1 rounded-xl backdrop-blur-md">
                <button
                    onClick={generateImage}
                    disabled={isGenerating}
                    className="p-2 text-[#ffffff60] hover:text-[#00f2ff] hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
                    title="Export as PNG"
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    <span className="text-[10px] font-black uppercase hidden sm:inline">PNG</span>
                </button>

                <div className="w-px h-4 bg-white/5 self-center mx-1"></div>

                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="p-2 text-[#ffffff60] hover:text-[#7000ff] hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
                    title="Export as PDF"
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    <span className="text-[10px] font-black uppercase hidden sm:inline">PDF</span>
                </button>
            </div>

            <button
                className="p-2 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20 rounded-xl hover:bg-[#00f2ff]/20 transition-all flex items-center gap-2"
                onClick={() => {
                    if (navigator.share) {
                        generateImage().then(() => {
                            // Sharing logic would go here if we wanted to support direct sharing
                            // but usually it requires a file object
                        });
                    }
                }}
            >
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase hidden lg:inline">Magic Capture</span>
            </button>
        </div>
    );
};

export default ReportGenerator;
