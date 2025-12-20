import React from 'react';

interface InvoiceProps {
    date: string;
    amount: number;
    planName: string;
    merchantName: string;
    invoiceId: string;
}

/**
 * InvoiceTemplate
 * A formalized, branded template for Ryyt (Calcure Technologies) billing.
 */
const InvoiceTemplate: React.FC<InvoiceProps> = ({ date, amount, planName, merchantName, invoiceId }) => {
    return (
        <div className="bg-white p-12 text-zinc-900 font-sans max-w-3xl mx-auto border border-zinc-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b border-zinc-100 pb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-600 mb-1">Ryyt</h1>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Financial Logistics Layer</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">Calcure Technologies Private Limited</p>
                    <p className="text-xs text-zinc-500 max-w-[200px] ml-auto">
                        Shantiniketan Apartment, 3 No Basunagar, Madhyamgram, Kolkata 700129
                    </p>
                </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Billed To</p>
                    <p className="text-sm font-bold">{merchantName}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Invoice Details</p>
                    <p className="text-xs"><span className="text-zinc-500 uppercase">Number:</span> {invoiceId}</p>
                    <p className="text-xs"><span className="text-zinc-500 uppercase">Date:</span> {date}</p>
                </div>
            </div>

            {/* Table */}
            <table className="w-full text-left border-collapse mb-12">
                <thead>
                    <tr className="border-b-2 border-zinc-100 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        <th className="py-2">Description</th>
                        <th className="py-2 text-right">Qty</th>
                        <th className="py-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    <tr>
                        <td className="py-4">
                            <p className="text-sm font-bold">{planName} Plan</p>
                            <p className="text-[10px] text-zinc-500">Monthly Subscription Fee</p>
                        </td>
                        <td className="py-4 text-sm text-right">1</td>
                        <td className="py-4 text-sm font-mono font-bold text-right">₹{amount.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            {/* Total Section */}
            <div className="flex justify-end pt-8 border-t border-zinc-100">
                <div className="w-1/2 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Subtotal</span>
                        <span className="font-mono">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">GST (0% - Export/Exempt)</span>
                        <span className="font-mono">₹0</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-100">
                        <span>Total Paid</span>
                        <span className="text-blue-600 font-mono">₹{amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-zinc-100 text-center">
                <p className="text-[10px] text-zinc-400">
                    This is a computer-generated receipt for your records. No signature required.
                    Thank you for partnering with Ryyt.
                </p>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
