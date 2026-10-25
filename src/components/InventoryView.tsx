import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AssetCategory,
  AssetCondition,
  AssetFundingSource,
  AssetStatus,
  InventoryAsset,
} from '../types';
import {
  AlertTriangle,
  Archive,
  ArrowUpDown,
  Boxes,
  CheckCircle2,
  DollarSign,
  Download,
  Edit2,
  Filter,
  Layers,
  Laptop,
  Maximize2,
  Music,
  Package,
  Plus,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  Wrench,
  X,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    deleteAssetsBulk,
    purgeModuleData,
    setIsDataPurgeModalOpen,
    currentUser,
    staffInfo,
  } = useApp();

  const isTeacher = currentUser?.role === 'TEACHER';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Selected IDs for Bulk Delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<InventoryAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<InventoryAsset | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [labelAsset, setLabelAsset] = useState<InventoryAsset | null>(null);

  // Form State for Add / Edit
  const initialFormState: Omit<InventoryAsset, 'id' | 'createdAt' | 'totalValue'> = {
    code: '',
    name: '',
    category: 'TIK_ELEKTRONIK',
    location: 'Lab Komputer Lt. 2',
    condition: 'BAIK',
    quantity: 1,
    unit: 'Unit',
    procurementYear: 2026,
    sourceOfFunds: 'BOS_REGULER',
    purchasePrice: 0,
    picName: 'Benisius Rahmat Basuki, S.Pd',
    status: 'TERSEDIA',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto-generate code helper
  const generateNewAssetCode = (category: AssetCategory) => {
    const prefixMap: Record<AssetCategory, string> = {
      TIK_ELEKTRONIK: 'BGT-INV-TIK',
      MEBEL_PERABOT: 'BGT-INV-MBL',
      ALAT_MUSIK: 'BGT-INV-MSK',
      ALAT_OLAHRAGA: 'BGT-INV-OLR',
      ALAT_LAB_IPA: 'BGT-INV-IPA',
      BUKU_PUSTAKA: 'BGT-INV-PST',
      SARANA_GEDUNG: 'BGT-INV-GDG',
      LAINNYA: 'BGT-INV-LNN',
    };
    const year = new Date().getFullYear();
    const count = assets.filter((a) => a.category === category).length + 1;
    const num = String(count).padStart(3, '0');
    return `${prefixMap[category]}/${year}/${num}`;
  };

  const handleOpenAddModal = () => {
    const code = generateNewAssetCode('TIK_ELEKTRONIK');
    setFormData({
      ...initialFormState,
      code,
      picName: currentUser?.name || 'Benisius Rahmat Basuki, S.Pd',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (asset: InventoryAsset) => {
    setEditingAsset(asset);
    setFormData({
      code: asset.code,
      name: asset.name,
      category: asset.category,
      location: asset.location,
      condition: asset.condition,
      quantity: asset.quantity,
      unit: asset.unit,
      procurementYear: asset.procurementYear,
      sourceOfFunds: asset.sourceOfFunds,
      purchasePrice: asset.purchasePrice,
      picName: asset.picName,
      status: asset.status,
      notes: asset.notes || '',
    });
    setFormError(null);
  };

  // Submit Handler for Add / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Nama aset wajib diisi.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Kode barang/aset wajib diisi.');
      return;
    }
    if (formData.quantity < 1) {
      setFormError('Jumlah minimal adalah 1.');
      return;
    }

    if (editingAsset) {
      // Update existing
      updateAsset(editingAsset.id, formData);
      setSuccessToast(`Aset "${formData.name}" berhasil diperbarui!`);
      setEditingAsset(null);
    } else {
      // Create new
      addAsset(formData);
      setSuccessToast(`Aset "${formData.name}" berhasil didaftarkan ke sistem!`);
      setIsAddModalOpen(false);
    }

    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Delete Handlers
  const handleConfirmSingleDelete = () => {
    if (!deletingAsset) return;
    deleteAsset(deletingAsset.id);
    setSelectedIds((prev) => prev.filter((id) => id !== deletingAsset.id));
    setSuccessToast(`Aset "${deletingAsset.name}" berhasil dihapus dari inventaris.`);
    setDeletingAsset(null);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirmBulkDelete = () => {
    const count = deleteAssetsBulk(selectedIds);
    setSuccessToast(`${count} aset berhasil dihapus.`);
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Selection toggle
  const toggleSelectAll = (filteredAssets: InventoryAsset[]) => {
    if (selectedIds.length === filteredAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAssets.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Unique locations for filter
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => {
      if (a.location) set.add(a.location);
    });
    return Array.from(set).sort();
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Keyword
      const matchKeyword =
        !searchTerm.trim() ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.picName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.notes && asset.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category
      const matchCategory =
        selectedCategory === 'ALL' || asset.category === selectedCategory;

      // Condition
      const matchCondition =
        selectedCondition === 'ALL' || asset.condition === selectedCondition;

      // Status
      const matchStatus =
        selectedStatus === 'ALL' || asset.status === selectedStatus;

      // Location
      const matchLocation =
        selectedLocation === 'ALL' || asset.location === selectedLocation;

      return (
        matchKeyword &&
        matchCategory &&
        matchCondition &&
        matchStatus &&
        matchLocation
      );
    });
  }, [
    assets,
    searchTerm,
    selectedCategory,
    selectedCondition,
    selectedStatus,
    selectedLocation,
  ]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalItems = assets.length;
    const totalPhysicalUnits = assets.reduce((acc, a) => acc + (a.quantity || 0), 0);
    const totalValuation = assets.reduce((acc, a) => acc + (a.totalValue || 0), 0);
    const goodConditionCount = assets.filter((a) => a.condition === 'BAIK').length;
    const repairConditionCount = assets.filter(
      (a) => a.condition === 'RUSAK_RINGAN' || a.condition === 'RUSAK_BERAT'
    ).length;
    const inRepairCount = assets.filter((a) => a.status === 'DALAM_PERBAIKAN').length;

    return {
      totalItems,
      totalPhysicalUnits,
      totalValuation,
      goodConditionCount,
      repairConditionCount,
      inRepairCount,
    };
  }, [assets]);

  // Category labels and colors
  const categoryMeta: Record<AssetCategory, { label: string; bg: string; text: string }> = {
    TIK_ELEKTRONIK: { label: 'TIK & Elektronik', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    MEBEL_PERABOT: { label: 'Mebel & Perabot', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    ALAT_MUSIK: { label: 'Alat Musik', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
    ALAT_OLAHRAGA: { label: 'Alat Olahraga', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    ALAT_LAB_IPA: { label: 'Laboratorium IPA', bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700' },
    BUKU_PUSTAKA: { label: 'Buku Pustaka', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    SARANA_GEDUNG: { label: 'Sarana Gedung', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
    LAINNYA: { label: 'Lainnya', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
  };

  const fundingLabels: Record<AssetFundingSource, string> = {
    BOS_REGULER: 'Dana BOS Reguler',
    BOS_KINERJA: 'Dana BOS Kinerja',
    YAYASAN_BOPKRI: 'Yayasan BOPKRI',
    KOMITE_SEKOLAH: 'Komite Sekolah',
    HIBAH_DONASI: 'Hibah / Donasi',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Hero / Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-blue-600/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Menu Inventarisasi Sekolah
              </span>
              <span className="text-xs text-slate-300">
                SD BOPKRI Gondolayu Yogyakarta
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inventarisasi & Aset Sarana Prasarana
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pencatatan lengkap aset sekolah, pelacakan kondisi, lokasi ruangan, nilai perolehan, penanggung jawab, dan pelaporan sarana pembelajaran Kurikulum Merdeka.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Penanggung Jawab: <strong>{staffInfo.appDeveloper || 'Benisius Rahmat Basuki, S.Pd'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <Package className="w-4 h-4 text-blue-300" />
                <span>T.A. {staffInfo.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isTeacher && (
              <>
                <button
                  type="button"
                  onClick={() => setIsDataPurgeModalOpen(true)}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all flex items-center gap-2 shadow-xs"
                  title="Buka Pusat Pengelolaan & Penghapusan Data Sistem"
                >
                  <Trash2 className="w-4 h-4 text-slate-300" />
                  <span>Pusat Hapus Data</span>
                </button>
                {assets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`⚠️ PERINGATAN ADMIN: Apakah Anda yakin ingin MENGHAPUS SEMUA ${assets.length} data aset dan inventaris sarpras?\nSeluruh buku inventaris akan dikosongkan.`)) {
                        purgeModuleData('assets');
                        setSelectedIds([]);
                      }
                    }}
                    className="px-3.5 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold border border-red-500/50 transition-all flex items-center gap-2 shadow-xs"
                    title="Kosongkan Seluruh Aset Inventaris"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Kosongkan Inventaris</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all flex items-center gap-2 shadow-xs"
              title="Cetak format cetak inventarisasi"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Aset Baru (Lengkap)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Assets */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Jenis Aset</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.totalItems}</span>
            <span className="text-xs font-medium text-slate-500">item terdaftar</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total kuantitas fisik: <strong className="text-slate-700">{metrics.totalPhysicalUnits}</strong> unit/set
          </p>
        </div>

        {/* Total Valuation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Nilai Perolehan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              Rp {metrics.totalValuation.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Valuasi barang modal & aset inventaris</p>
        </div>

        {/* Good Condition */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Kondisi Baik (Prima)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.goodConditionCount}</span>
            <span className="text-xs font-semibold text-teal-700">
              ({metrics.totalItems > 0 ? Math.round((metrics.goodConditionCount / metrics.totalItems) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Siap pakai dalam proses belajar mengajar</p>
        </div>

        {/* Needs Repair */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Perlu Servis / Rusak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{metrics.repairConditionCount}</span>
            <span className="text-xs font-medium text-slate-500">
              ({metrics.inRepairCount} dalam perbaikan)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pemeliharaan dan penggantian suku cadang</p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari kode aset, nama barang, ruangan, penanggung jawab, catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Clear & Count */}
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span>
              Menampilkan <strong>{filteredAssets.length}</strong> dari {assets.length} aset
            </span>
            {(selectedCategory !== 'ALL' ||
              selectedCondition !== 'ALL' ||
              selectedStatus !== 'ALL' ||
              selectedLocation !== 'ALL' ||
              searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedCondition('ALL');
                  setSelectedStatus('ALL');
                  setSelectedLocation('ALL');
                  setSearchTerm('');
                }}
                className="text-blue-700 hover:underline font-semibold ml-1"
              >
                Reset Filter
              </button>
            )}
          </div>

        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs">
          
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Kategori Aset
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="TIK_ELEKTRONIK">TIK & Elektronik</option>
              <option value="MEBEL_PERABOT">Mebel & Perabot</option>
              <option value="ALAT_MUSIK">Alat Musik</option>
              <option value="ALAT_OLAHRAGA">Alat Olahraga</option>
              <option value="ALAT_LAB_IPA">Laboratorium IPA</option>
              <option value="BUKU_PUSTAKA">Buku Pustaka</option>
              <option value="SARANA_GEDUNG">Sarana Gedung</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Kondisi Fisik
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Kondisi</option>
              <option value="BAIK">Kondisi Baik</option>
              <option value="RUSAK_RINGAN">Rusak Ringan</option>
              <option value="RUSAK_BERAT">Rusak Berat</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status Ketersediaan
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Status</option>
              <option value="TERSEDIA">Tersedia (Ready)</option>
              <option value="DIPINJAM">Sedang Dipinjam</option>
              <option value="DALAM_PERBAIKAN">Dalam Perbaikan</option>
              <option value="DIHAPUSBUKUKAN">Dihapusbukukan</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Ruangan / Lokasi
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Ruangan</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold">{selectedIds.length} aset terpilih</span>
              <span className="text-amber-700">
                (Dapat dihapus secara massal)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
              >
                Batal Pilih
              </button>
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus {selectedIds.length} Aset Terpilih</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredAssets.length > 0 &&
                      selectedIds.length === filteredAssets.length
                    }
                    onChange={() => toggleSelectAll(filteredAssets)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                    title="Pilih semua"
                  />
                </th>
                <th className="py-3 px-3">Kode & Nama Aset</th>
                <th className="py-3 px-3">Kategori & Lokasi</th>
                <th className="py-3 px-3 text-center">Kondisi</th>
                <th className="py-3 px-3 text-center">Jumlah</th>
                <th className="py-3 px-3">Tahun & Sumber Dana</th>
                <th className="py-3 px-3 text-right">Nilai Perolehan</th>
                <th className="py-3 px-3">Penanggung Jawab</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">Tidak ada aset inventaris yang sesuai</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba ubah kata kunci pencarian atau reset filter di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isSelected = selectedIds.includes(asset.id);
                  const cat = categoryMeta[asset.category] || categoryMeta.LAINNYA;

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(asset.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Code & Name */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded inline-block mb-1">
                          {asset.code}
                        </div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {asset.name}
                        </div>
                        {asset.notes && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={asset.notes}>
                            {asset.notes}
                          </p>
                        )}
                      </td>

                      {/* Category & Location */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1 ${cat.bg} ${cat.text}`}
                        >
                          {cat.label}
                        </span>
                        <div className="text-slate-700 font-medium text-xs flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{asset.location}</span>
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="py-3 px-3 text-center">
                        {asset.condition === 'BAIK' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Baik
                          </span>
                        )}
                        {asset.condition === 'RUSAK_RINGAN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Rusak Ringan
                          </span>
                        )}
                        {asset.condition === 'RUSAK_BERAT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Rusak Berat
                          </span>
                        )}
                      </td>

                      {/* Quantity & Unit */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {asset.quantity}
                        </div>
                        <span className="text-[10px] text-slate-500">{asset.unit}</span>
                      </td>

                      {/* Year & Funding */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          Thn. {asset.procurementYear}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]" title={fundingLabels[asset.sourceOfFunds]}>
                          {fundingLabels[asset.sourceOfFunds] || asset.sourceOfFunds}
                        </div>
                      </td>

                      {/* Purchase Price & Total Value */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-extrabold text-slate-900">
                          Rp {asset.totalValue.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          @ Rp {asset.purchasePrice.toLocaleString('id-ID')}
                        </div>
                      </td>

                      {/* PIC */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800 truncate max-w-[140px]" title={asset.picName}>
                          {asset.picName}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              asset.status === 'TERSEDIA'
                                ? 'bg-emerald-500'
                                : asset.status === 'DALAM_PERBAIKAN'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{asset.status.replace('_', ' ')}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          
                          {/* Label Preview */}
                          <button
                            onClick={() => setLabelAsset(asset)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Lihat Label / QR Tag Aset"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Aset */}
                          <button
                            onClick={() => handleOpenEditModal(asset)}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100/70 rounded-lg transition-colors"
                            title="Edit Data Aset Lengkap"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Hapus Aset */}
                          <button
                            onClick={() => setDeletingAsset(asset)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Aset ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Footer Summary Strip */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Total Baris: <strong>{filteredAssets.length}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Total Kuantitas Fisik Terfilter:{' '}
              <strong>{filteredAssets.reduce((sum, a) => sum + a.quantity, 0)} unit</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Subtotal Valuasi Terfilter:</span>
            <span className="font-extrabold text-blue-900 text-sm">
              Rp {filteredAssets.reduce((sum, a) => sum + a.totalValue, 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

      </div>

      {/* ==============================================================
          MODAL: INPUT ASET (LENGKAP) & EDIT ASET
          ============================================================== */}
      {(isAddModalOpen || editingAsset) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  {editingAsset ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingAsset ? 'Edit Data Aset Inventaris' : 'Input Aset Baru (Lengkap)'}
                  </h3>
                  <p className="text-xs text-blue-200">SD BOPKRI Gondolayu Yogyakarta</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingAsset(null);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Row 1: Kode & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Kode Barang / Aset <span className="text-red-500">*</span>
                    </label>
                    {!editingAsset && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            code: generateNewAssetCode(prev.category),
                          }))
                        }
                        className="text-[10px] text-blue-700 hover:underline font-semibold"
                      >
                        Auto-Generate
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: BGT-INV-TIK/2026/001"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Aset <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as AssetCategory;
                      setFormData({
                        ...formData,
                        category: newCat,
                        code: !editingAsset ? generateNewAssetCode(newCat) : formData.code,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                  >
                    <option value="TIK_ELEKTRONIK">TIK & Elektronik (Laptop, Proyektor, WiFi)</option>
                    <option value="MEBEL_PERABOT">Mebel & Perabot (Meja, Kursi, Lemari)</option>
                    <option value="ALAT_MUSIK">Alat Musik (Piano, Biola, Drumband)</option>
                    <option value="ALAT_OLAHRAGA">Alat Olahraga (Futsal, Basket, Matras)</option>
                    <option value="ALAT_LAB_IPA">Laboratorium IPA (Mikroskop, Model Tubuh)</option>
                    <option value="BUKU_PUSTAKA">Buku Perpustakaan</option>
                    <option value="SARANA_GEDUNG">Sarana Fisik Gedung</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Nama Aset Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Aset / Barang Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Chromebook Asus C214MA Flip Touchscreen atau Piano Upright Yamaha"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                />
              </div>

              {/* Row 3: Ruangan & Penanggung Jawab (PIC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi / Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Lab Komputer Lt. 2, Ruang Kelas 4A, Ruang Musik"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penanggung Jawab / Pemegang (PIC) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.picName}
                    onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                    placeholder="Contoh: Benisius Rahmat Basuki, S.Pd"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row 4: Jumlah, Satuan, Nilai Perolehan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah (Qty) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan Barang
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Set">Set</option>
                    <option value="Buah">Buah</option>
                    <option value="Paket">Paket</option>
                    <option value="Rim">Rim</option>
                    <option value="Kotak">Kotak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500">Estimasi Total Nilai Aset:</span>
                <span className="font-extrabold text-blue-900 text-sm">
                  Rp {(formData.quantity * formData.purchasePrice).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Row 5: Tahun, Sumber Dana, Kondisi, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Pengadaan
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    value={formData.procurementYear}
                    onChange={(e) => setFormData({ ...formData, procurementYear: parseInt(e.target.value) || 2026 })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sumber Dana
                  </label>
                  <select
                    value={formData.sourceOfFunds}
                    onChange={(e) => setFormData({ ...formData, sourceOfFunds: e.target.value as AssetFundingSource })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="BOS_REGULER">Dana BOS Reguler</option>
                    <option value="BOS_KINERJA">Dana BOS Kinerja</option>
                    <option value="YAYASAN_BOPKRI">Yayasan BOPKRI</option>
                    <option value="KOMITE_SEKOLAH">Komite Sekolah</option>
                    <option value="HIBAH_DONASI">Hibah / Donasi</option>
                  </select>
                </div>
              </div>

              {/* Kondisi & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kondisi Fisik Saat Ini
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white font-semibold"
                  >
                    <option value="BAIK">Baik (Prima / Siap Pakai)</option>
                    <option value="RUSAK_RINGAN">Rusak Ringan (Perlu Servis Minor)</option>
                    <option value="RUSAK_BERAT">Rusak Berat (Tidak Berfungsi / Diafkirkan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Ketersediaan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white font-semibold"
                  >
                    <option value="TERSEDIA">Tersedia di Ruangan</option>
                    <option value="DIPINJAM">Sedang Dipinjam</option>
                    <option value="DALAM_PERBAIKAN">Dalam Perbaikan (Servis)</option>
                    <option value="DIHAPUSBUKUKAN">Dihapusbukukan / Diafkir</option>
                  </select>
                </div>
              </div>

              {/* Spesifikasi / Catatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Spesifikasi Teknis / Nomor Seri
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nomor seri perangkat, merek, spesifikasi memori, riwayat servis, dll."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAsset(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingAsset ? 'Simpan Perubahan' : 'Daftarkan Aset Baru'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: KONFIRMASI HAPUS SATUAN ASET
          ============================================================== */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900 mb-1">
              Hapus Aset Inventaris?
            </h3>
            
            <p className="text-xs text-slate-600 text-center mb-4">
              Apakah Anda yakin ingin menghapus data aset berikut dari sistem inventarisasi SD BOPKRI Gondolayu?
            </p>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1 mb-5">
              <div>
                <span className="text-slate-400">Kode:</span>{' '}
                <strong className="text-slate-800 font-mono">{deletingAsset.code}</strong>
              </div>
              <div>
                <span className="text-slate-400">Nama Aset:</span>{' '}
                <strong className="text-slate-900">{deletingAsset.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Lokasi:</span>{' '}
                <span className="text-slate-700">{deletingAsset.location}</span>
              </div>
              <div>
                <span className="text-slate-400">Nilai:</span>{' '}
                <span className="text-emerald-700 font-bold">
                  Rp {deletingAsset.totalValue.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingAsset(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Ya, Hapus Aset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: KONFIRMASI HAPUS BULK (MASSAL)
          ============================================================== */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900 mb-1">
              Hapus {selectedIds.length} Aset Terpilih?
            </h3>
            
            <p className="text-xs text-slate-600 text-center mb-4">
              Tindakan ini akan menghapus seluruh <strong>{selectedIds.length}</strong> data aset terpilih secara permanen dari daftar inventarisasi sekolah.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Hapus {selectedIds.length} Aset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: LABEL / QR TAG PREVIEW
          ============================================================== */}
      {labelAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-700" />
                <span>Label Inventaris Fisik (Asset Tag)</span>
              </span>
              <button
                onClick={() => setLabelAsset(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sticker / Label Card */}
            <div className="border-2 border-dashed border-blue-400 bg-gradient-to-b from-blue-50/50 to-white p-4 rounded-xl text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <img
                  src="/src/assets/images/logo_bopkri_gondolayu.png"
                  alt="SD BOPKRI Gondolayu"
                  className="w-6 h-6 object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-extrabold text-blue-950 uppercase tracking-tight">
                  SD BOPKRI Gondolayu
                </span>
              </div>

              <div className="font-mono text-sm font-extrabold text-blue-900 bg-white border border-blue-200 py-1 px-3 rounded-md shadow-2xs inline-block">
                {labelAsset.code}
              </div>

              <div className="font-bold text-slate-800 text-xs">
                {labelAsset.name}
              </div>

              <div className="text-[10px] text-slate-500">
                Lokasi: <strong>{labelAsset.location}</strong> · Pengadaan: {labelAsset.procurementYear}
              </div>

              <div className="text-[9px] text-slate-400 border-t border-slate-200 pt-1.5 mt-2">
                Dilarang memindahkan barang tanpa persetujuan Penanggung Jawab Inventaris ({labelAsset.picName})
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Label Stiker</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
