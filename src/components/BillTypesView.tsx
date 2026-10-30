import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BillCategory, BillFrequency, BillType, SCHOOL_GRADES } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Calendar,
  Check,
  Edit,
  Layers,
  Plus,
  Send,
  Trash2,
  X,
  Settings,
  Sparkles,
  Save,
  ShieldCheck,
} from 'lucide-react';

export const BillTypesView: React.FC = () => {
  const {
    billTypes,
    addBillType,
    updateBillType,
    deleteBillType,
    deleteBillTypesBulk,
    purgeModuleData,
    setIsDataPurgeModalOpen,
    generateBillsForBillType,
    setActiveTab,
    currentUser,
    updateClassActivityTariff,
    updateEkskulTariffRate,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';
  const canEditTariffs =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'BENDAHARA' ||
    currentUser?.role === 'TATA_USAHA';

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [selectedTypeForGeneration, setSelectedTypeForGeneration] = useState<BillType | null>(null);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState<boolean>(false);

  // Class tariffs state
  const kegiatanBillType = billTypes.find((bt) => bt.category === 'KEGIATAN' || bt.id === 'bt-kegiatan');
  const ekskulBillType = billTypes.find((bt) => bt.category === 'EKSTRAKURIKULER' || bt.id === 'bt-ekskul');

  const [classAmounts, setClassAmounts] = useState<Record<string, number>>(() => {
    return (
      kegiatanBillType?.classAmounts || {
        '1.1': 1000000,
        '1.2': 1000000,
        '2.1': 1100000,
        '2.2': 1100000,
        '3.1': 1200000,
        '3.2': 1200000,
        '4.1': 1300000,
        '4.2': 1300000,
        '5.1': 1400000,
        '5.2': 1400000,
        '6.1': 1500000,
        '6.2': 1500000,
      }
    );
  });

  const [ekskulRate, setEkskulRate] = useState<number>(() => {
    return ekskulBillType?.ekskulFeePerItem || ekskulBillType?.defaultAmount || 200000;
  });

  const [isSavingTariff, setIsSavingTariff] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<BillCategory>('SPP');
  const [frequency, setFrequency] = useState<BillFrequency>('BULANAN');
  const [defaultAmount, setDefaultAmount] = useState<number>(350000);
  const [description, setDescription] = useState<string>('');
  const [targetGrade, setTargetGrade] = useState<string>('Semua Kelas');

  // Generation Modal Form State
  const [genPeriod, setGenPeriod] = useState<string>('November 2026');
  const [genDueDate, setGenDueDate] = useState<string>('2026-11-10');
  const [genGrade, setGenGrade] = useState<string>('Semua Kelas');
  const [genCustomAmount, setGenCustomAmount] = useState<number>(0);
  const [genSuccessCount, setGenSuccessCount] = useState<number | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('SPP');
    setFrequency('BULANAN');
    setDefaultAmount(350000);
    setDescription('');
    setTargetGrade('Semua Kelas');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bt: BillType) => {
    setEditingId(bt.id);
    setName(bt.name);
    setCategory(bt.category);
    setFrequency(bt.frequency);
    setDefaultAmount(bt.defaultAmount);
    setDescription(bt.description);
    setTargetGrade(bt.targetGrades[0] || 'Semua Kelas');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama tagihan wajib diisi');
      return;
    }

    if (editingId) {
      updateBillType(editingId, {
        name,
        category,
        frequency,
        defaultAmount,
        description,
        targetGrades: [targetGrade],
      });
    } else {
      addBillType({
        name,
        category,
        frequency,
        defaultAmount,
        description,
        targetGrades: [targetGrade],
        isActive: true,
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleOpenGenerate = (bt: BillType) => {
    setSelectedTypeForGeneration(bt);
    setGenCustomAmount(bt.defaultAmount);
    setGenSuccessCount(null);
    setIsGenerateModalOpen(true);
  };

  const handleGenerateBills = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeForGeneration) return;

    const count = generateBillsForBillType(
      selectedTypeForGeneration.id,
      genPeriod,
      genDueDate,
      genGrade,
      genCustomAmount
    );

    setGenSuccessCount(count);
  };

  const gradeOptions = ['Semua Kelas', ...SCHOOL_GRADES];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Manajemen Keuangan</span>
            <span aria-hidden="true">·</span>
            <span>SD BOPKRI Gondolayu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pembuat & Pengaturan Jenis Tagihan Sekolah
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Buat dan atur pos pembayaran sekolah seperti SPP Bulanan, Uang Kegiatan Tahunan, Uang Ekstrakurikuler, atau tagihan khusus lainnya, serta terbitkan ke siswa secara masal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setIsDataPurgeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                title="Buka Pusat Pengelolaan & Penghapusan Data Sistem"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Pusat Hapus Data</span>
              </button>
              {billTypes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`⚠️ PERINGATAN ADMIN: Apakah Anda yakin ingin MENGHAPUS SEMUA ${billTypes.length} jenis master tagihan?\nSeluruh template tagihan akan dikosongkan.`)) {
                      purgeModuleData('billTypes');
                      setSelectedTypeIds([]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                  title="Kosongkan Semua Jenis Tagihan"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Kosongkan Master Tagihan</span>
                </button>
              )}
            </>
          )}

          {canEditTariffs && (
            <button
              type="button"
              onClick={() => setIsTariffModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-colors shrink-0"
              title="Atur Tarif Uang Kegiatan per Kelas & Ekstrakurikuler"
            >
              <Settings className="w-4 h-4 text-amber-900" />
              <span>Atur Tarif Kelas & Ekskul</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Jenis Tagihan Baru
          </button>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedTypeIds.length > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs">
          <span className="font-semibold text-red-900">
            Terpilih: {selectedTypeIds.length} dari {billTypes.length} jenis tagihan
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedTypeIds([])}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-red-100/50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Hapus ${selectedTypeIds.length} jenis tagihan terpilih? Tindakan ini tidak dapat dibatalkan.`)) {
                  deleteBillTypesBulk(selectedTypeIds);
                  setSelectedTypeIds([]);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus {selectedTypeIds.length} Jenis Tagihan</span>
            </button>
          </div>
        </div>
      )}

      {/* Bill Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {billTypes.map((bt) => {
          const isSelected = selectedTypeIds.includes(bt.id);

          return (
            <div
              key={bt.id}
              className={`bg-white border rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between ${
                isSelected ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypeIds((prev) => [...prev, bt.id]);
                        } else {
                          setSelectedTypeIds((prev) => prev.filter((id) => id !== bt.id));
                        }
                      }}
                      className="mt-1 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {bt.category} · {bt.frequency}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{bt.name}</h3>
                    </div>
                  </div>
                  <span className="text-base font-mono font-extrabold text-slate-900 tabular-nums shrink-0">
                    {formatRupiah(bt.defaultAmount)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  {bt.description || 'Tidak ada deskripsi tambahan.'}
                </p>

                <div className="text-xs text-slate-500 pt-1 pl-6">
                  Target Kelas: <strong className="text-slate-700">{bt.targetGrades.join(', ')}</strong>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenGenerate(bt)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Terbitkan Tagihan ke Siswa
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(bt)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Ubah Jenis Tagihan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus jenis tagihan "${bt.name}"?`)) {
                        deleteBillType(bt.id);
                        setSelectedTypeIds((prev) => prev.filter((id) => id !== bt.id));
                      }
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Hapus Jenis Tagihan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'Ubah Jenis Tagihan' : 'Tambah Jenis Tagihan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Tagihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SPP Bulanan, Uang Kegiatan, Uang Buku, Retret..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kategori Tagihan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BillCategory)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="SPP">SPP (Sumbangan Pembinaan)</option>
                    <option value="KEGIATAN">Uang Kegiatan</option>
                    <option value="EKSTRAKURIKULER">Ekstrakurikuler</option>
                    <option value="LAINNYA">Lainnya (Buku / Seragam / Acara)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Frekuensi Penagihan
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="BULANAN">Bulanan</option>
                    <option value="SEMESTER">Per Semester</option>
                    <option value="TAHUNAN">Per Tahun</option>
                    <option value="SEKALI_BAYAR">Sekali Bayar / Insidental</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nominal Standar (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Sasaran Tingkat Kelas
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Deskripsi / Keterangan Tagihan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan alokasi dana dan peruntukan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  {editingId ? 'Simpan Perubahan' : 'Buat Jenis Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Bill Generation Modal */}
      {isGenerateModalOpen && selectedTypeForGeneration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Terbitkan Tagihan Masal ke Siswa
                </h3>
                <p className="text-xs text-slate-500">{selectedTypeForGeneration.name}</p>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBills} className="p-6 space-y-4">
              {genSuccessCount !== null ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Berhasil Menerbitkan {genSuccessCount} Tagihan!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Tagihan <strong>{selectedTypeForGeneration.name}</strong> untuk periode <strong>{genPeriod}</strong> telah dibuat untuk siswa yang memenuhi syarat.
                  </p>
                  <div className="pt-3 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGenerateModalOpen(false);
                        setActiveTab('tagihan');
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-800 rounded-lg hover:bg-blue-900"
                    >
                      Buka Daftar Tagihan & Tunggakan
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Nama Periode Tagihan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: November 2026 / Semester Genap"
                        value={genPeriod}
                        onChange={(e) => setGenPeriod(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Tanggal Jatuh Tempo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={genDueDate}
                        onChange={(e) => setGenDueDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Sasaran Kelas
                      </label>
                      <select
                        value={genGrade}
                        onChange={(e) => setGenGrade(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        {gradeOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Nominal Tagihan (Rp)
                        </label>
                        <span className="text-[10px] text-blue-700 font-bold">Tulis Manual Bebas</span>
                      </div>
                      <input
                        type="number"
                        min={1000}
                        step={10000}
                        value={genCustomAmount}
                        onChange={(e) => setGenCustomAmount(Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50 text-slate-900"
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Admin dapat mengetik angka nominal manual secara bebas.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    Sistem akan otomatis mengecek siswa agar tagihan untuk periode yang sama tidak terduplikasi.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsGenerateModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs"
                    >
                      Terbitkan Sekarang
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
      {/* MODAL PENGATURAN TARIF UANG KEGIATAN PER KELAS & EKSKUL (KASIR, BENDAHARA, ADMIN) */}
      {isTariffModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    BENDAHARA & KASIR TU
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">SD BOPKRI Gondolayu</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Pengaturan Tarif Uang Kegiatan per Kelas & Ekstrakurikuler
                </h3>
                <p className="text-xs text-slate-500">
                  Perubahan tarif di bawah ini akan disimpan langsung ke database Cloud Firestore dan diterapkan otomatis saat penerbitan tagihan siswa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTariffModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bagian 1: Tarif Uang Kegiatan Tahunan Per Kelas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    1. Tarif Uang Kegiatan Tahunan Per Kelas (Berbeda Setiap Kelas)
                  </h4>
                </div>
                <span className="text-[11px] text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  Format Kelas Baru: 1.1 s/d 6.2
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sesuai ketentuan, tarif uang kegiatan berbeda untuk tiap tingkatan kelas rombel. Anda dapat menentukan besaran nominal untuk masing-masing kelas.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {SCHOOL_GRADES.map((g) => (
                  <div key={g} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Kelas {g}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={25000}
                      value={classAmounts[g] || 1200000}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setClassAmounts((prev) => ({ ...prev, [g]: val }));
                      }}
                      className="w-full text-xs font-mono font-bold px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 text-right">
                      {formatRupiah(classAmounts[g] || 1200000)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian 2: Tarif Ekstrakurikuler Semesteran */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    2. Tarif Ekstrakurikuler Semesteran
                  </h4>
                </div>
                <span className="text-[11px] text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Rp 200.000 / Semester / Pilihan Ekskul
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tarif standar ekstrakurikuler SD BOPKRI Gondolayu adalah sebesar Rp 200.000 / semester untuk 1 pilihan ekskul (jika memilih 2 ekskul maka menjadi Rp 400.000 / semester).
              </p>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-1">
                    Besaran Nominal Tarif per 1 Pilihan Ekskul (Rp)
                  </label>
                  <p className="text-[11px] text-emerald-800">
                    Diberlakukan untuk semua pilihan ekskul aktif (Coding, Biola, Padus, Basket, dll.)
                  </p>
                </div>
                <div className="w-full sm:w-48 shrink-0">
                  <input
                    type="number"
                    min={0}
                    step={25000}
                    value={ekskulRate}
                    onChange={(e) => setEkskulRate(Number(e.target.value))}
                    className="w-full text-sm font-mono font-black px-3 py-2 bg-white border-2 border-emerald-400 rounded-xl focus:ring-2 focus:ring-emerald-600 text-emerald-950 text-right shadow-xs"
                  />
                  <p className="text-[10px] text-emerald-700 font-bold font-mono mt-0.5 text-right">
                    {formatRupiah(ekskulRate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsTariffModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingTariff}
                onClick={async () => {
                  setIsSavingTariff(true);
                  try {
                    await updateClassActivityTariff(classAmounts);
                    await updateEkskulTariffRate(ekskulRate);
                    setIsTariffModalOpen(false);
                  } catch (err) {
                    console.error('Failed to save tariffs:', err);
                  } finally {
                    setIsSavingTariff(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingTariff ? 'Menyimpan ke Cloud...' : 'Simpan Semua Tarif ke Cloud Firestore'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
