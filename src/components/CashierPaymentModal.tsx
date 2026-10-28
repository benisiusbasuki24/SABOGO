import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bill, PaymentMethod } from '../types';
import { formatRupiah } from '../utils/formatters';
import { QRIS_CODE, QRIS_CODE_FALLBACK } from '../assets/logo';
import {
  Banknote,
  Check,
  CheckCircle,
  Copy,
  CreditCard,
  QrCode,
  Receipt,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

export const CashierPaymentModal: React.FC = () => {
  const {
    activePayingBill,
    setActivePayingBill,
    processPayment,
    openReceiptPrint,
    staffInfo,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'MANDIRI' | 'BRI' | 'BNI'>('BCA');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [autoPrintNota, setAutoPrintNota] = useState<boolean>(true);
  const [copiedVA, setCopiedVA] = useState<boolean>(false);
  const [qrisSimulatedPaid, setQrisSimulatedPaid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!activePayingBill) return null;

  const bill = activePayingBill;
  const remainingDue = bill.amount - bill.paidAmount;

  // Initialize cash tendered to remaining due when opening
  const currentCashTendered = cashTendered > 0 ? cashTendered : remainingDue;
  const cashChange = Math.max(0, currentCashTendered - remainingDue);

  const handleSelectQuickCash = (amount: number) => {
    setCashTendered(amount);
  };

  const getVaNumber = (bank: string, nis: string) => {
    switch (bank) {
      case 'BCA':
        return `12345${nis}`;
      case 'MANDIRI':
        return `88012${nis}`;
      case 'BRI':
        return `10293${nis}`;
      case 'BNI':
        return `98811${nis}`;
      default:
        return `88012${nis}`;
    }
  };

  const activeVaNumber = getVaNumber(selectedBank, bill.studentNis);

  const handleCopyVa = () => {
    navigator.clipboard.writeText(activeVaNumber);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method.startsWith('VA_')) {
      const bank = method.replace('VA_', '') as 'BCA' | 'MANDIRI' | 'BRI' | 'BNI';
      setSelectedBank(bank);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const effectiveMethod = paymentMethod.startsWith('VA')
        ? (`VA_${selectedBank}` as PaymentMethod)
        : paymentMethod;

      const tx = processPayment({
        billId: bill.id,
        amountPaid: remainingDue,
        paymentMethod: effectiveMethod,
        cashTendered: paymentMethod === 'TUNAI' ? currentCashTendered : undefined,
        cashChange: paymentMethod === 'TUNAI' ? cashChange : undefined,
        referenceNumber:
          paymentMethod === 'QRIS'
            ? referenceNumber || `QRS-${Date.now().toString().slice(-7)}`
            : paymentMethod.startsWith('VA')
            ? referenceNumber || `VA-${selectedBank}-${bill.studentNis}`
            : undefined,
        notes: notes || `Pembayaran ${bill.billTypeName} (${bill.period}) di Loket Kasir`,
      });

      // Close paying modal
      setActivePayingBill(null);

      // Open receipt modal and optionally trigger auto-print
      openReceiptPrint(tx, 'A4');
      if (autoPrintNota) {
        setTimeout(() => {
          window.print();
        }, 350);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pembayaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Loket Kasir & Pembayaran</h2>
            <p className="text-xs text-slate-500">
              Kasir: <span className="font-semibold text-slate-700">{staffInfo.cashier}</span> · SD BOPKRI Gondolayu
            </p>
          </div>
          <button
            onClick={() => setActivePayingBill(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bill & Student Information Banner */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {bill.billTypeName}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{bill.studentName}</h3>
                <p className="text-xs text-slate-600">
                  Kelas: <span className="font-semibold">{bill.studentGrade}</span> · NIS: {bill.studentNis} · Periode: <span className="font-semibold text-blue-900">{bill.period}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Sisa Tagihan</p>
                <p className="text-xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {formatRupiah(remainingDue)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span>Wali Murid: <strong className="text-slate-700">{bill.parentName}</strong> ({bill.parentPhone})</span>
              <span>Jatuh Tempo: <strong className="text-slate-700">{bill.dueDate}</strong></span>
            </div>
          </div>

          {/* Payment Method Selector (Tunai, QRIS, Virtual Account) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleMethodChange('TUNAI')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'TUNAI'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1.5 text-blue-700" />
                <span className="text-xs">Tunai (Cash)</span>
                <span className="text-[10px] text-slate-500">Loket Kasir</span>
              </button>

              <button
                type="button"
                onClick={() => handleMethodChange('QRIS')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1.5 text-red-600" />
                <span className="text-xs">QRIS BOPKRI</span>
                <span className="text-[10px] text-slate-500">BCA, Mandiri, OVO, GoPay</span>
              </button>

              <button
                type="button"
                onClick={() => handleMethodChange('VA_BCA')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  paymentMethod.startsWith('VA')
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5 text-indigo-700" />
                <span className="text-xs">Virtual Account</span>
                <span className="text-[10px] text-slate-500">BCA / Mandiri / BRI / BNI</span>
              </button>
            </div>
          </div>

          {/* Method Specific Details */}
          {paymentMethod === 'TUNAI' && (
            <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Uang Diterima dari Orang Tua (Rp)
                  </label>
                  <input
                    type="number"
                    value={currentCashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    min={remainingDue}
                    className="w-full font-mono text-lg font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Uang Kembalian
                  </label>
                  <div className="w-full font-mono text-lg font-bold text-emerald-700 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    {formatRupiah(cashChange)}
                  </div>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-500">Pilihan Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleSelectQuickCash(remainingDue)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                >
                  Uang Pas ({formatRupiah(remainingDue)})
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickCash(remainingDue + 50000)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                >
                  +{formatRupiah(50000)}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickCash(Math.ceil(remainingDue / 100000) * 100000)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                >
                  Bulatkan ke Ratusan Ribu
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'QRIS' && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex flex-col md:flex-row items-center gap-5">
              <div className="shrink-0 bg-white p-2 rounded-xl shadow-xs border border-slate-200 text-center">
                <img
                  src={QRIS_CODE}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = QRIS_CODE_FALLBACK;
                    }
                  }}
                  alt="QRIS SD BOPKRI Gondolayu"
                  className="w-48 h-auto object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
                <p className="text-[10px] text-slate-500 mt-1">NMID: ID102345678910</p>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Scan QRIS SD BOPKRI Gondolayu</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Orang tua murid dapat memindai barcode QRIS di samping melalui seluruh aplikasi mobile banking (BCA, Mandiri, BRI, BNI, BSI) atau e-Wallet (GoPay, OVO, ShopeePay, DANA).
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Merchant:</span>
                    <strong className="text-slate-800">SD BOPKRI GONDOLAYU</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nominal Tagihan:</span>
                    <strong className="text-blue-900 font-mono">{formatRupiah(remainingDue)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQrisSimulatedPaid(true);
                      setReferenceNumber(`QRS-${Date.now().toString().slice(-7)}`);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      qrisSimulatedPaid
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {qrisSimulatedPaid ? 'Pembayaran QRIS Terkonfirmasi' : 'Simulasi Pembayaran QRIS Masuk'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentMethod.startsWith('VA') && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">Pilih Bank Virtual Account</label>
              <div className="grid grid-cols-4 gap-2">
                {(['BCA', 'MANDIRI', 'BRI', 'BNI'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setSelectedBank(b);
                      setPaymentMethod(`VA_${b}` as PaymentMethod);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                      selectedBank === b
                        ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Nomor Virtual Account {selectedBank}</p>
                  <p className="text-base font-mono font-extrabold text-blue-900 tracking-wider">
                    {activeVaNumber}
                  </p>
                  <p className="text-[10px] text-slate-500">Atas nama: SD BOPKRI - {bill.studentName}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyVa}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {copiedVA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedVA ? 'Disalin!' : 'Salin VA'}
                </button>
              </div>
            </div>
          )}

          {/* Notes & Auto-Print Option */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Catatan Transaksi (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Titipan orang tua melalui siswa / Pelunasan SPP"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Opsi Cetak Nota Otomatis - As Requested */}
            <div className="flex items-center gap-2 p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
              <input
                type="checkbox"
                id="autoPrintNota"
                checked={autoPrintNota}
                onChange={(e) => setAutoPrintNota(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="autoPrintNota" className="text-xs text-slate-800 font-medium cursor-pointer">
                <strong>Cetak Nota Otomatis:</strong> Langsung tampilkan dan buka dialog cetak nota setelah pembayaran berhasil diselesaikan.
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActivePayingBill(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Receipt className="w-4 h-4" />
              Selesaikan Pembayaran & Terbitkan Kwitansi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
