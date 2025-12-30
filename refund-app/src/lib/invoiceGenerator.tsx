"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateFinalBill } from "./taxCalculator";

// 1. Strict Interfaces
export interface InvoiceMerchantData {
    brandName: string;
    email: string;
    gstin?: string; // Optional GSTIN
    address?: string; // Optional Address
}

export interface InvoicePaymentData {
    id?: string;
    amount?: number; // Total Paid
    planName?: string;
    date?: { seconds: number } | Date | string | number;

    // Hybrid Billing Details
    basePrice?: number;
    usageCount?: number;
    limit?: number; // Included Refunds
    excessRate?: number;
    email?: string; // Optional override
}

export const generateInvoice = (merchantData: InvoiceMerchantData, paymentData: InvoicePaymentData) => {
    // 1. Guard against Server Side
    if (typeof window === "undefined") return;

    // 2. Prepare Data & Fallbacks
    const brandName = merchantData.brandName || "Merchant Partner";
    const totalAmount = paymentData.amount || 0;
    const planName = paymentData.planName || "Subscription";
    const email = merchantData.email || paymentData.email || "shuvam@ryyt.in";

    // Date Logic
    let dateObj = new Date();
    if (paymentData.date) {
        if (typeof paymentData.date === 'object' && 'seconds' in paymentData.date) {
            dateObj = new Date(paymentData.date.seconds * 1000);
        } else {
            dateObj = new Date(paymentData.date);
        }
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${day}/${month}/${year}`;

    // Professional ID Generation: CAL-[YYYY]-[MM]-[Sequence/Hash]
    // Using last 4 chars of ID or random if missing to simulate sequence
    const uniqueSuffix = paymentData.id ? paymentData.id.slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000);
    const displayInvoiceId = `CAL-${year}-${month}-${uniqueSuffix}`;

    // 3. Initialize jsPDF
    const doc = new jsPDF('p', 'mm', 'a4');

    // 4. ELITE BRANDING HEADER
    // Left: Product Brand
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("RYYT", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Automated Refund Infrastructure", 14, 28);

    // Right: Invoice Meta Block
    const metaX = 140;
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Ryyt Indigo
    doc.text("INVOICE", metaX, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    doc.text("Invoice #:", metaX, 32);
    doc.setTextColor(0, 0, 0);
    doc.text(displayInvoiceId, metaX + 25, 32);

    doc.setTextColor(100, 100, 100);
    doc.text("Date:", metaX, 38);
    doc.setTextColor(0, 0, 0);
    doc.text(dateStr, metaX + 25, 38);

    doc.setTextColor(100, 100, 100);
    doc.text("Status:", metaX, 44);
    doc.setTextColor(34, 197, 94); // Green Safe
    doc.setFont("helvetica", "bold");
    doc.text("PAID", metaX + 25, 44);

    // 5. ADDRESS BLOCKS
    const sectionY = 60;

    // From (Calcure)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("FROM", 14, sectionY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Calcure Technologies Private Limited", 14, sectionY + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("3 no. Basunagar, Madhaymgram", 14, sectionY + 11);
    doc.text("Kolkata 700129", 14, sectionY + 16);
    doc.text("support@ryyt.in", 14, sectionY + 21);

    // To (Merchant)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("BILL TO", 110, sectionY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(brandName, 110, sectionY + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    // Address if available, else plain email
    if (merchantData.address) doc.text(merchantData.address, 110, sectionY + 11);
    doc.text(email, 110, sectionY + (merchantData.address ? 16 : 11));
    if (merchantData.gstin) doc.text(`GSTIN: ${merchantData.gstin}`, 110, sectionY + (merchantData.address ? 21 : 16));


    // 6. HYBRID LINE ITEMS LOGIC
    const tableBody = [];

    // Item 1: Base Subscription
    // If basePrice is provided, use it. Else validation fallback logic could go here, 
    // but we assume paymentData implies a fulfilled cycle or prepaid start.
    const basePrice = paymentData.basePrice !== undefined ? paymentData.basePrice : totalAmount;
    // Note: If strictly usage based, base might be 0, but usually it's a plan price.

    tableBody.push([
        `Software Subscription - ${planName.charAt(0).toUpperCase() + planName.slice(1)} (Prepaid)`,
        "1 Month",
        `Rs. ${basePrice.toLocaleString()}`
    ]);

    // Item 2: Overage (Conditional)
    if (
        paymentData.usageCount !== undefined &&
        paymentData.limit !== undefined &&
        paymentData.usageCount > paymentData.limit
    ) {
        const excess = paymentData.usageCount - paymentData.limit;
        const rate = paymentData.excessRate || 15; // Default fallback
        const overageCost = excess * rate;

        tableBody.push([
            `Usage Overage (Previous Cycle: ${paymentData.usageCount} refunds)`,
            `${excess} @ Rs.${rate}`,
            `Rs. ${overageCost.toLocaleString()}`
        ]);
    }

    // 6.5 Calculate GST Breakdown
    const { subtotal, gstAmount, total: grandTotal } = calculateFinalBill(basePrice + (paymentData.usageCount && paymentData.limit && paymentData.usageCount > paymentData.limit ? (paymentData.usageCount - paymentData.limit) * (paymentData.excessRate || 15) : 0));
    // Fallback if paymentData.amount was already stored as total inclusive in DB
    const finalTotal = paymentData.amount || grandTotal;

    // 7. GENERATE TABLE
    autoTable(doc, {
        startY: 95,
        head: [['Item Description', 'Qty / Detail', 'Amount (INR)']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: [79, 70, 229], // Indigo-600
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 8
        },
        styles: {
            fontSize: 10,
            cellPadding: 8,
            textColor: [50, 50, 50],
            lineColor: [230, 230, 230],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 40 },
            2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
        },
        bodyStyles: {
            halign: 'left'
        },
        // Adding the tax breakdown rows
        foot: [
            [
                { content: 'Subtotal:', colSpan: 2, styles: { halign: 'right', fontSize: 10, fontStyle: 'normal' } },
                { content: `Rs. ${subtotal.toLocaleString()}`, styles: { halign: 'right', fontSize: 10, fontStyle: 'normal' } }
            ],
            [
                { content: 'GST (18%):', colSpan: 2, styles: { halign: 'right', fontSize: 10, fontStyle: 'normal' } },
                { content: `Rs. ${gstAmount.toLocaleString()}`, styles: { halign: 'right', fontSize: 10, fontStyle: 'normal' } }
            ],
            [
                { content: 'Grand Total (Inclusive of Tax):', colSpan: 2, styles: { halign: 'right', fontSize: 12, fontStyle: 'bold' } },
                { content: `Rs. ${finalTotal.toLocaleString()}`, styles: { halign: 'right', fontSize: 12, fontStyle: 'bold', textColor: [0, 0, 0] } }
            ]
        ],
        footStyles: {
            fillColor: [249, 250, 251], // Gray-50
            textColor: [0, 0, 0],
            lineColor: [230, 230, 230],
            lineWidth: 0.1
        }
    });

    // 8. FOOTER
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 120;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.line(14, finalY + 15, 196, finalY + 15);

    doc.text("Terms & Conditions:", 14, finalY + 22);
    doc.setFontSize(8);
    doc.text("1. This is a computer-generated invoice and serves as a valid proof of payment.", 14, finalY + 27);
    doc.text("2. Calcure Technologies Private Limited is a registered entity in India.", 14, finalY + 32);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Issued by Calcure Technologies Private Limited", 14, 280); // Bottom of page

    // 9. SAVE
    const safeBrandName = brandName.replace(/[^a-zA-Z0-9]/g, "_");
    const safeDate = dateStr.replace(/\//g, "-");
    const filename = `Invoice_${safeBrandName}_${displayInvoiceId}_${safeDate}.pdf`;

    doc.save(filename);
};
