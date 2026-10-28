import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SPMBEntryTrack,
  SPMBRegistration,
  SPMBStatus,
} from '../types';
import { formatDateIndo } from '../utils/formatters';
import { BOPKRI_LOGO, handleImageError } from '../assets/logo';
import {
  AlertCircle,
  Award,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FileUp,
  GraduationCap,
  Home,
  Info,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Ruler,
  Search,
  Send,
  Sparkles,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  SPMBStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  MENUNGGU_VERIFIKASI: {
    label: 'Menunggu Verifikasi',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  DITERIMA: {
    label: 'Diterima Resmi',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  CADANGAN: {
    label: 'Daftar Cadangan',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  DITOLAK: {
    label: 'Tidak Diterima',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: <X className="w-3.5 h-3.5" />,
  },
};

const TRACK_CONFIG: Record<SPMBEntryTrack, { label: string; badge: string }> = {
  REGULER: { label: 'Jalur Reguler', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
  ZONASI: { label: 'Jalur Zonasi', badge: 'bg-teal-50 text-teal-800 border-teal-200' },
  PRESTASI: { label: 'Jalur Prestasi', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  AFIRMASI: { label: 'Jalur Afirmasi / KIP', badge: 'bg-amber-50 text-amber-900 border-amber-200' },
};

const AGAMA_OPTIONS = [
  'KRISTEN PROTESTAN',
  'KATOLIK',
  'ISLAM',
  'HINDU',
  'BUDDHA',
  'KONGHUCU',
];

const TEMPAT_TINGGAL_OPTIONS = [
  'BERSAMA ORANG TUA',
  'WALI',
  'KOST',
  'ASRAMA',
  'PANTI ASUHAN',
  'LAINNYA',
];

const MODA_TRANSPORTASI_OPTIONS = [
  'JALAN KAKI',
  'SEPEDA',
  'SEPEDA MOTOR',
  'MOBIL PRIBADI',
  'ANTAR JEMPUT SEKOLAH',
  'ANGKUTAN UMUM',
  'OJEK ONLINE',
  'LAINNYA',
];

const STATUS_HUBUNGAN_OPTIONS = [
  'ANAK KANDUNG',
  'ANAK ANGKAT',
  'ANAK TIRI',
  'LAINNYA',
];

interface UploadedDocState {
  name: string;
  size: string;
  previewUrl?: string;
}

export const SPMBView: React.FC = () => {
  const {
    spmbRegistrations,
    addSPMBRegistration,
    updateSPMBStatus,
    deleteSPMBRegistration,
    isSuperAdmin,
    staffInfo,
    showToast,
  } = useApp();

  // Active view: list or new form
  const [activeView, setActiveView] = useState<'LIST' | 'FORM'>('LIST');

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTrack, setFilterTrack] = useState<string>('ALL');

  // Auto NIS sequence
  const currentYear = new Date().getFullYear();
  const nextNisSequence = spmbRegistrations.length + 1;
  const previewNis = `${currentYear}${String(nextNisSequence).padStart(3, '0')}`;

  // Form States (All uppercase handling)
  const [fullName, setFullName] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [birthPlace, setBirthPlace] = useState('YOGYAKARTA');
  const [birthDate, setBirthDate] = useState('2019-05-15');
  const [nik, setNik] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [noKk, setNoKk] = useState('');
  const [aktaLahirRegNo, setAktaLahirRegNo] = useState('');
  const [religion, setReligion] = useState('KRISTEN PROTESTAN');

  // Measurements
  const [heightCm, setHeightCm] = useState<string>('115');
  const [weightKg, setWeightKg] = useState<string>('20');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<string>('50');

  // Address (KK)
  const [address, setAddress] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');
  const [dusun, setDusun] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kabupatenKota, setKabupatenKota] = useState('KOTA YOGYAKARTA');
  const [provinsi, setProvinsi] = useState('D.I. YOGYAKARTA');
  const [postalCode, setPostalCode] = useState('55223');

  // Residence & Transport
  const [residenceType, setResidenceType] = useState('BERSAMA ORANG TUA');
  const [transportationMode, setTransportationMode] = useState('SEPEDA MOTOR');
  const [distanceToSchoolKm, setDistanceToSchoolKm] = useState<string>('1.5');
  const [travelTimeToSchoolMin, setTravelTimeToSchoolMin] = useState<string>('15');

  // Family & Social Support
  const [birthOrder, setBirthOrder] = useState<string>('1');
  const [familyRelationStatus, setFamilyRelationStatus] = useState('ANAK KANDUNG');
  const [siblingsCount, setSiblingsCount] = useState<string>('0');
  const [isKpsRecipient, setIsKpsRecipient] = useState<'YA' | 'TIDAK'>('TIDAK');
  const [kpsNumber, setKpsNumber] = useState('');
  const [hasKip, setHasKip] = useState<'YA' | 'TIDAK'>('TIDAK');
  const [kipNumber, setKipNumber] = useState('');

  // Parent & Notification
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('08');
  const [parentEmail, setParentEmail] = useState('');
  const [targetGrade, setTargetGrade] = useState('Kelas 1A');
  const [entryTrack, setEntryTrack] = useState<SPMBEntryTrack>('REGULER');
  const [notes, setNotes] = useState('');

  // 10MB Document Uploads
  const [docPasFoto, setDocPasFoto] = useState<UploadedDocState | null>(null);
  const [docKartuKeluarga, setDocKartuKeluarga] = useState<UploadedDocState | null>(null);
  const [docAktaLahir, setDocAktaLahir] = useState<UploadedDocState | null>(null);
  const [docSuratTkOrPindah, setDocSuratTkOrPindah] = useState<UploadedDocState | null>(null);
  const [docSuratPsikolog, setDocSuratPsikolog] = useState<UploadedDocState | null>(null);

  // Modals
  const [detailModalData, setDetailModalData] = useState<SPMBRegistration | null>(null);
  const [selectedProof, setSelectedProof] = useState<SPMBRegistration | null>(null);
  const [emailModalData, setEmailModalData] = useState<SPMBRegistration | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<SPMBRegistration | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<SPMBStatus>('DITERIMA');

  // File upload validation (Max 10MB)
  const handleFileSelection = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (doc: UploadedDocState | null) => void,
    fieldLabel: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      showToast(`Ukuran file "${file.name}" melebihi batas 10MB! Harap pilih file yang lebih kecil.`, 'error');
      e.target.value = '';
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeLabel = `${sizeInMb} MB`;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setter({
          name: file.name,
          size: sizeLabel,
          previewUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setter({
        name: file.name,
        size: sizeLabel,
      });
    }

    showToast(`Dokumen ${fieldLabel} berhasil diunggah (${sizeLabel}).`, 'success');
  };

  // Filtered registrations
  const filteredList = useMemo(() => {
    return spmbRegistrations.filter((reg) => {
      const matchSearch =
        reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.nis.includes(searchQuery) ||
        reg.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reg.nik && reg.nik.includes(searchQuery)) ||
        (reg.nisn && reg.nisn.includes(searchQuery)) ||
        reg.parentEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === 'ALL' || reg.status === filterStatus;
      const matchTrack = filterTrack === 'ALL' || reg.entryTrack === filterTrack;

      return matchSearch && matchStatus && matchTrack;
    });
  }, [spmbRegistrations, searchQuery, filterStatus, filterTrack]);

  // Statistics
  const totalCount = spmbRegistrations.length;
  const acceptedCount = spmbRegistrations.filter((r) => r.status === 'DITERIMA').length;
  const pendingCount = spmbRegistrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
  const reserveCount = spmbRegistrations.filter((r) => r.status === 'CADANGAN').length;

  // Form Submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fullName.trim() ||
      !previousSchool.trim() ||
      !birthPlace.trim() ||
      !birthDate.trim() ||
      !nik.trim() ||
      !nisn.trim() ||
      !noKk.trim() ||
      !aktaLahirRegNo.trim() ||
      !religion.trim() ||
      !address.trim() ||
      !rt.trim() ||
      !rw.trim() ||
      !kelurahan.trim() ||
      !kecamatan.trim() ||
      !kabupatenKota.trim() ||
      !provinsi.trim() ||
      !postalCode.trim() ||
      !parentName.trim() ||
      !parentPhone.trim() ||
      !parentEmail.trim()
    ) {
      showToast('Mohon lengkapi seluruh kolom yang bertanda bintang merah (*)!', 'error');
      return;
    }

    if (!docPasFoto) {
      showToast('Wajib mengunggah Pas Foto terbaru calon peserta didik (*)!', 'warning');
      return;
    }
    if (!docKartuKeluarga) {
      showToast('Wajib mengunggah Kartu Keluarga (C1) (*)!', 'warning');
      return;
    }
    if (!docAktaLahir) {
      showToast('Wajib mengunggah Akta Lahir (*)!', 'warning');
      return;
    }

    const created = addSPMBRegistration({
      fullName: fullName.trim().toUpperCase(),
      previousSchool: previousSchool.trim().toUpperCase(),
      birthPlace: birthPlace.trim().toUpperCase(),
      birthDate,
      nik: nik.trim(),
      nisn: nisn.trim(),
      gender,
      heightCm: Number(heightCm) || undefined,
      weightKg: Number(weightKg) || undefined,
      headCircumferenceCm: headCircumferenceCm ? Number(headCircumferenceCm) : undefined,
      noKk: noKk.trim(),
      aktaLahirRegNo: aktaLahirRegNo.trim().toUpperCase(),
      religion: religion.toUpperCase(),
      address: address.trim().toUpperCase(),
      rt: rt.trim(),
      rw: rw.trim(),
      dusun: dusun.trim() ? dusun.trim().toUpperCase() : undefined,
      kelurahan: kelurahan.trim().toUpperCase(),
      kecamatan: kecamatan.trim().toUpperCase(),
      kabupatenKota: kabupatenKota.trim().toUpperCase(),
      provinsi: provinsi.trim().toUpperCase(),
      postalCode: postalCode.trim(),
      residenceType: residenceType.toUpperCase(),
      transportationMode: transportationMode.toUpperCase(),
      distanceToSchoolKm: Number(distanceToSchoolKm) || 1,
      travelTimeToSchoolMin: Number(travelTimeToSchoolMin) || 15,
      birthOrder: Number(birthOrder) || 1,
      familyRelationStatus: familyRelationStatus.toUpperCase(),
      siblingsCount: Number(siblingsCount) || 0,
      isKpsRecipient,
      kpsNumber: isKpsRecipient === 'YA' ? kpsNumber.trim().toUpperCase() : undefined,
      hasKip,
      kipNumber: hasKip === 'YA' ? kipNumber.trim().toUpperCase() : undefined,
      
      docPasFoto: docPasFoto ? `${docPasFoto.name} (${docPasFoto.size})` : undefined,
      docKartuKeluarga: docKartuKeluarga ? `${docKartuKeluarga.name} (${docKartuKeluarga.size})` : undefined,
      docAktaLahir: docAktaLahir ? `${docAktaLahir.name} (${docAktaLahir.size})` : undefined,
      docSuratTkOrPindah: docSuratTkOrPindah ? `${docSuratTkOrPindah.name} (${docSuratTkOrPindah.size})` : undefined,
      docSuratPsikolog: docSuratPsikolog ? `${docSuratPsikolog.name} (${docSuratPsikolog.size})` : undefined,

      parentName: parentName.trim().toUpperCase(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      targetGrade,
      entryTrack,
      status: 'MENUNGGU_VERIFIKASI',
      notes: notes.trim() ? notes.trim().toUpperCase() : undefined,
    });

    // Reset Form
    setFullName('');
    setPreviousSchool('');
    setNik('');
    setNisn('');
    setNoKk('');
    setAktaLahirRegNo('');
    setAddress('');
    setRt('');
    setRw('');
    setDusun('');
    setKelurahan('');
    setKecamatan('');
    setParentName('');
    setParentPhone('08');
    setParentEmail('');
    setNotes('');
    setDocPasFoto(null);
    setDocKartuKeluarga(null);
    setDocAktaLahir(null);
    setDocSuratTkOrPindah(null);
    setDocSuratPsikolog(null);

    setEmailModalData(created);
    setActiveView('LIST');
  };

  const handleResendEmail = (reg: SPMBRegistration) => {
    updateSPMBStatus(reg.id, reg.status, true);
    setEmailModalData(reg);
  };

  const handleSaveStatusChange = () => {
    if (!statusChangeTarget) return;
    updateSPMBStatus(statusChangeTarget.id, newStatusValue, true);
    setStatusChangeTarget(null);
  };

  const exportToCSV = () => {
    const headers = [
      'No Pendaftaran',
      'NIS Otomatis',
      'Nama Calon Siswa',
      'Asal Sekolah',
      'NIK',
      'NISN',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'No KK',
      'No Reg Akta Lahir',
      'Agama',
      'Alamat KK',
      'RT',
      'RW',
      'Kelurahan',
      'Kecamatan',
      'Kab/Kota',
      'Tempat Tinggal',
      'Moda Transportasi',
      'Jarak (KM)',
      'Waktu Tempuh (Menit)',
      'Anak Ke',
      'Hubungan Keluarga',
      'Jml Saudara',
      'Penerima KPS',
      'Punya KIP',
      'Jalur Masuk',
      'Target Kelas',
      'Nama Orang Tua',
      'No WhatsApp',
      'Email',
      'Status',
      'Tanggal Daftar',
    ];

    const rows = filteredList.map((r) => [
      r.registrationNumber,
      r.nis,
      `"${r.fullName}"`,
      `"${r.previousSchool || '-'}"`,
      `"${r.nik || '-'}"`,
      `"${r.nisn || '-'}"`,
      r.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      `"${r.birthPlace}"`,
      r.birthDate,
      `"${r.noKk || '-'}"`,
      `"${r.aktaLahirRegNo || '-'}"`,
      `"${r.religion || '-'}"`,
      `"${r.address}"`,
      `"${r.rt || '-'}"`,
      `"${r.rw || '-'}"`,
      `"${r.kelurahan || '-'}"`,
      `"${r.kecamatan || '-'}"`,
      `"${r.kabupatenKota || '-'}"`,
      `"${r.residenceType || '-'}"`,
      `"${r.transportationMode || '-'}"`,
      r.distanceToSchoolKm || 0,
      r.travelTimeToSchoolMin || 0,
      r.birthOrder || 1,
      `"${r.familyRelationStatus || '-'}"`,
      r.siblingsCount || 0,
      r.isKpsRecipient || 'TIDAK',
      r.hasKip || 'TIDAK',
      r.entryTrack,
      r.targetGrade,
      `"${r.parentName}"`,
      `"${r.parentPhone}"`,
      `"${r.parentEmail}"`,
      r.status,
      r.registrationDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPMB_SD_BOPKRI_Gondolayu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data pendaftaran berhasil diekspor ke file CSV', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs tracking-wider uppercase mb-1">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span>Sistem Penerimaan Murid Baru (SPMB / PPDB)</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-normal">T.A. {staffInfo.academicYear}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Pendaftaran Murid Baru SD BOPKRI Gondolayu</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Pendaftaran calon peserta didik baru dengan penerbitan Nomor Induk Siswa (NIS) otomatis, verifikasi berkas lengkap, dan sistem konfirmasi email otomatis langsung ke orang tua calon murid.
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveView('LIST')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeView === 'LIST'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Calon Murid ({totalCount})</span>
          </button>
          <button
            onClick={() => setActiveView('FORM')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeView === 'FORM'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Formulir Pendaftaran Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pendaftar</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Calon murid terdaftar</p>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Diterima Resmi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{acceptedCount}</div>
          <p className="text-[10px] text-emerald-700/80 mt-0.5">Sudah mendapat NIS & kuota</p>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu Verifikasi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950">{pendingCount}</div>
          <p className="text-[10px] text-amber-700/80 mt-0.5">Perlu verifikasi berkas 10MB</p>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-2xs bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cadangan</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950">{reserveCount}</div>
          <p className="text-[10px] text-blue-700/80 mt-0.5">Prioritas kedua bila kuota ada</p>
        </div>
      </div>

      {/* =====================================================================
         VIEW: FORMULIR PENDAFTARAN BARU DENGAN FORMAT CAPITAL LENGKAP
         ===================================================================== */}
      {activeView === 'FORM' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-150">
          
          {/* Header Formulir */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase bg-white/10 px-2.5 py-0.5 rounded-full text-blue-200 border border-white/10 inline-block mb-1.5">
                Formulir Pendaftaran Siswa Baru
              </span>
              <h2 className="text-xl font-black">Data Calon Peserta Didik</h2>
              <p className="text-xs text-blue-200 mt-1">
                Lengkapi seluruh data di bawah ini. Dokumen persyaratan dapat diunggah langsung (maks. 10MB per file).
              </p>
            </div>
            
            {/* Auto NIS Badge Display */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-xl flex items-center gap-3 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-200 block">
                  NIS Baru Otomatis:
                </span>
                <span className="text-base font-black text-white font-mono tracking-wider">
                  {previewNis}
                </span>
              </div>
            </div>
          </div>

          {/* Capital Warning Notice */}
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-2.5 text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider">
              Perhatian: Diisi dengan menggunakan huruf kapital
            </p>
          </div>

          <form onSubmit={handleSubmitForm} className="p-6 sm:p-8 space-y-8">
            
            {/* 1. IDENTITAS CALON PESERTA DIDIK */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <User className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  1. Identitas Calon Peserta Didik
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nama Lengkap * */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: JONATHAN DANIEL PRASETYO"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Asal sekolah * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Asal Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: TK BOPKRI GONDOLAYU"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Tempat lahir * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: YOGYAKARTA"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Tanggal lahir * (Date) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                {/* Jenis Kelamin * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setGender('L')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        gender === 'L'
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>Laki-laki</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('P')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        gender === 'P'
                          ? 'bg-rose-800 text-white border-rose-800 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>Perempuan</span>
                    </button>
                  </div>
                </div>

                {/* NIK * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="16 DIGIT NIK CALON SISWA"
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono font-medium"
                  />
                </div>

                {/* NISN * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NISN (Nomor Induk Siswa Nasional) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="10 DIGIT NISN DARI TK / PAUD"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono font-medium"
                  />
                </div>

                {/* No. KK * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. KK (Kartu Keluarga) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="16 DIGIT NOMOR KARTU KELUARGA"
                    value={noKk}
                    onChange={(e) => setNoKk(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono font-medium"
                  />
                </div>

                {/* No. Registrasi Akta Lahir * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Registrasi Akta Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: 3471-LT-15042019-0012"
                    value={aktaLahirRegNo}
                    onChange={(e) => setAktaLahirRegNo(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Agama * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agama <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    {AGAMA_OPTIONS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. DATA FISIK & PENGUKURAN */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <Ruler className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  2. Data Fisik & Pengukuran Calon Murid
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tinggi badan (dalam cm) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tinggi Badan (dalam cm) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={70}
                      max={180}
                      placeholder="CONTOH: 115"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                      cm
                    </span>
                  </div>
                </div>

                {/* Berat badan (dalam kg) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Berat Badan (dalam kg) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={10}
                      max={90}
                      placeholder="CONTOH: 20"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                      kg
                    </span>
                  </div>
                </div>

                {/* Lingkar kepala (dalam cm) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lingkar Kepala (dalam cm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={30}
                      max={70}
                      placeholder="CONTOH: 50"
                      value={headCircumferenceCm}
                      onChange={(e) => setHeadCircumferenceCm(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                      cm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ALAMAT TEMPAT TINGGAL (SESUAI KK) */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <MapPin className="w-4 h-4 text-indigo-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  3. Alamat Tempat Tinggal (Sesuai KK)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Alamat tempat tinggal (sesuai KK) * */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Tempat Tinggal (sesuai KK) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="CONTOH: JL. TERBAN GK V NO. 12"
                    value={address}
                    onChange={(e) => setAddress(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* RT (sesuai KK) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RT (sesuai KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: 04"
                    value={rt}
                    onChange={(e) => setRt(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                {/* RW (sesuai KK) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RW (sesuai KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: 02"
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                {/* Nama dusun */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Dusun
                  </label>
                  <input
                    type="text"
                    placeholder="CONTOH: TERBAN"
                    value={dusun}
                    onChange={(e) => setDusun(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Desa/Kelurahan (sesuai KK) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Desa/Kelurahan (sesuai KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: TERBAN"
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Kecamatan (sesuai KK) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kecamatan (sesuai KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: GONDOKUSUMAN"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Kabupaten/Kota (sesuai KK) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kabupaten/Kota (sesuai KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: KOTA YOGYAKARTA"
                    value={kabupatenKota}
                    onChange={(e) => setKabupatenKota(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Provinsi (sesuai KK) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Provinsi (sesuai KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: D.I. YOGYAKARTA"
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                {/* Kode pos (sesuai KK) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Pos (sesuai KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="CONTOH: 55223"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 4. TEMPAT TINGGAL & TRANSPORTASI */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <Car className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  4. Tempat Tinggal & Moda Transportasi
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tempat tinggal * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Tinggal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={residenceType}
                    onChange={(e) => setResidenceType(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    {TEMPAT_TINGGAL_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Moda Trasportasi * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Moda Transportasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={transportationMode}
                    onChange={(e) => setTransportationMode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    {MODA_TRANSPORTASI_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jarak rumah ke sekolah (dalam kilometer) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jarak Rumah ke Sekolah <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="CONTOH: 1.5"
                      value={distanceToSchoolKm}
                      onChange={(e) => setDistanceToSchoolKm(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                      km
                    </span>
                  </div>
                </div>

                {/* Waktu tempuh ke sekolah (dalam menit) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Waktu Tempuh ke Sekolah <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="CONTOH: 15"
                      value={travelTimeToSchoolMin}
                      onChange={(e) => setTravelTimeToSchoolMin(e.target.value)}
                      className="w-full pl-3.5 pr-12 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                      menit
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. DATA KELUARGA & BANTUAN SOSIAL */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <Home className="w-4 h-4 text-purple-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  5. Keadaan Keluarga & Bantuan Sosial
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Anak ke-berapa (berdasarkan KK) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Anak ke-berapa (berdasarkan KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    placeholder="CONTOH: 1"
                    value={birthOrder}
                    onChange={(e) => setBirthOrder(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                {/* Status hubungan dalam keluarga * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Hubungan dalam Keluarga <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={familyRelationStatus}
                    onChange={(e) => setFamilyRelationStatus(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    {STATUS_HUBUNGAN_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jumlah saudara kandung * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Saudara Kandung <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    required
                    placeholder="CONTOH: 1"
                    value={siblingsCount}
                    onChange={(e) => setSiblingsCount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                {/* Penerima KPS (Kartu Keluarga Sejahtera) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penerima KPS (Kartu Keluarga Sejahtera) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={isKpsRecipient}
                    onChange={(e) => setIsKpsRecipient(e.target.value as 'YA' | 'TIDAK')}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="TIDAK">Tidak</option>
                    <option value="YA">Ya (Penerima KPS)</option>
                  </select>
                </div>

                {isKpsRecipient === 'YA' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor KPS (Kartu Keluarga Sejahtera) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="CONTOH: KPS-3471-00921"
                      value={kpsNumber}
                      onChange={(e) => setKpsNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase font-mono"
                    />
                  </div>
                )}

                {/* Apakah punya KIP (Kartu Indonesia Pintar) * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Apakah punya KIP (Kartu Indonesia Pintar) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={hasKip}
                    onChange={(e) => setHasKip(e.target.value as 'YA' | 'TIDAK')}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="TIDAK">Tidak</option>
                    <option value="YA">Ya (Memiliki KIP)</option>
                  </select>
                </div>

                {hasKip === 'YA' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor KIP (Kartu Indonesia Pintar) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="CONTOH: KIP-2026-8812"
                      value={kipNumber}
                      onChange={(e) => setKipNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 6. DATA ORANG TUA / WALI & JALUR PENDAFTARAN */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <Mail className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  6. Kontak Orang Tua / Wali & Pengiriman Email Konfirmasi
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Orang Tua / Wali <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: HENDRIK PRASETYO"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp Orang Tua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="CONTOH: 081227182930"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email Pendaftar <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="orangtua@gmail.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                    ✓ Bukti pendaftaran & NIS otomatis dikirim ke email ini
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jalur Pendaftaran SPMB <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={entryTrack}
                    onChange={(e) => setEntryTrack(e.target.value as SPMBEntryTrack)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="REGULER">Jalur Reguler Umum</option>
                    <option value="ZONASI">Jalur Zonasi (Radius Sekitar SD BOPKRI)</option>
                    <option value="PRESTASI">Jalur Prestasi Akademik / Seni</option>
                    <option value="AFIRMASI">Jalur Afirmasi / KIP / Beasiswa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Penempatan Kelas
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="Kelas 1A">Kelas 1A</option>
                    <option value="Kelas 1B">Kelas 1B</option>
                    <option value="Kelas 1">Kelas 1 (Paralel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="CONTOH: BERSAUDARA KANDUNG DI KELAS 4A"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                  />
                </div>
              </div>
            </div>

            {/* 7. UPLOAD BERKAS DOKUMEN (MAKS. 10MB) */}
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                <FileUp className="w-4 h-4 text-indigo-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  7. Upload Berkas Dokumen Persyaratan (Maksimal 10MB)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Ukuran file maksimal 10MB, bentuk file pdf, doc, gambar. Pastikan dokumen yang diupload jelas dan terbaca.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Upload pas foto terbaru calon peserta didik * */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white transition-all space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      Upload pas foto terbaru calon peserta didik <span className="text-red-500">*</span>
                    </span>
                    {docPasFoto && (
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-slate-500">
                    Ukuran file maksimal 10MB, bentuk file pdf, doc, gambar. Pastikan dokumen yang diupload jelas dan terbaca.
                  </p>

                  {docPasFoto ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-950 truncate font-mono">
                          {docPasFoto.name} ({docPasFoto.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocPasFoto(null)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Hapus / Ganti file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-blue-900">Pilih Pas Foto</span>
                      <span className="text-[9px] text-slate-400">PDF, DOC, DOCX, JPG, PNG (Maks 10MB)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleFileSelection(e, setDocPasFoto, 'Pas Foto')}
                      />
                    </label>
                  )}
                </div>

                {/* 2. Upload Kartu Keluarga (C1) * */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white transition-all space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      Upload Kartu Keluarga (C1) <span className="text-red-500">*</span>
                    </span>
                    {docKartuKeluarga && (
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-slate-500">
                    Ukuran file maksimal 10MB, bentuk file pdf, doc, gambar. Pastikan dokumen yang diupload jelas dan terbaca.
                  </p>

                  {docKartuKeluarga ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-950 truncate font-mono">
                          {docKartuKeluarga.name} ({docKartuKeluarga.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocKartuKeluarga(null)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Hapus / Ganti file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-blue-900">Pilih Kartu Keluarga (C1)</span>
                      <span className="text-[9px] text-slate-400">PDF, DOC, DOCX, JPG, PNG (Maks 10MB)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleFileSelection(e, setDocKartuKeluarga, 'Kartu Keluarga (C1)')}
                      />
                    </label>
                  )}
                </div>

                {/* 3. Upload Akta Lahir * */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white transition-all space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      Upload Akta Lahir <span className="text-red-500">*</span>
                    </span>
                    {docAktaLahir && (
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-slate-500">
                    Ukuran file maksimal 10MB, bentuk file pdf, doc, gambar. Pastikan dokumen yang diupload jelas dan terbaca.
                  </p>

                  {docAktaLahir ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-950 truncate font-mono">
                          {docAktaLahir.name} ({docAktaLahir.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocAktaLahir(null)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Hapus / Ganti file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-blue-900">Pilih Akta Lahir</span>
                      <span className="text-[9px] text-slate-400">PDF, DOC, DOCX, JPG, PNG (Maks 10MB)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleFileSelection(e, setDocAktaLahir, 'Akta Lahir')}
                      />
                    </label>
                  )}
                </div>

                {/* 4. Surat keterangan dari TK atau Surat Keterangan Pindah (Opsional) */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white transition-all space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      Surat keterangan TK atau Pindah
                    </span>
                    {docSuratTkOrPindah && (
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-slate-500">
                    Ukuran file maksimal 10MB, bentuk file pdf, doc, gambar. Pastikan dokumen yang diupload jelas dan terbaca. (Opsional)
                  </p>

                  {docSuratTkOrPindah ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-950 truncate font-mono">
                          {docSuratTkOrPindah.name} ({docSuratTkOrPindah.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocSuratTkOrPindah(null)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Hapus / Ganti file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-blue-900">Pilih Surat TK / Pindah</span>
                      <span className="text-[9px] text-slate-400">PDF, DOC, DOCX, JPG, PNG (Maks 10MB)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleFileSelection(e, setDocSuratTkOrPindah, 'Surat TK / Pindah')}
                      />
                    </label>
                  )}
                </div>

                {/* 5. Upload Surat Keterangan dari Psikolog */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white transition-all space-y-2.5 md:col-span-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      Upload Surat Keterangan dari Psikolog
                    </span>
                    {docSuratPsikolog && (
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-slate-500">
                    Bagi calon peserta didik yang belum berusia 6 tahun pada bulan Juli 2027. Ukuran file maksimal 10MB, bentuk file pdf, doc, gambar. Pastikan dokumen yang diupload jelas dan terbaca.
                  </p>

                  {docSuratPsikolog ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-950 truncate font-mono">
                          {docSuratPsikolog.name} ({docSuratPsikolog.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocSuratPsikolog(null)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Hapus / Ganti file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-blue-900">Pilih Surat Keterangan Psikolog</span>
                      <span className="text-[9px] text-slate-400">PDF, DOC, DOCX, JPG, PNG (Maks 10MB)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleFileSelection(e, setDocSuratPsikolog, 'Surat Keterangan Psikolog')}
                      />
                    </label>
                  )}
                </div>

              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveView('LIST')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Simpan Pendaftaran & Kirim Email Konfirmasi</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* =====================================================================
         MODAL 2: DOSSIER DETAIL LENGKAP CALON PESERTA DIDIK
         ===================================================================== */}
      {detailModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded text-blue-200 inline-block mb-1">
                  Berkas Biodata Calon Peserta Didik
                </span>
                <h3 className="text-base font-black uppercase">{detailModalData.fullName}</h3>
                <p className="text-xs text-blue-200 font-mono">
                  No. Reg: {detailModalData.registrationNumber} · NIS: {detailModalData.nis}
                </p>
              </div>
              <button
                onClick={() => setDetailModalData(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Seleksi:</span>
                  <span className="font-extrabold text-sm text-blue-950">{detailModalData.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Jalur & Kelas:</span>
                  <span className="font-bold text-slate-800">{detailModalData.entryTrack} · {detailModalData.targetGrade}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedProof(detailModalData);
                    setDetailModalData(null);
                  }}
                  className="px-3 py-1.5 bg-blue-900 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Tanda Terima</span>
                </button>
              </div>

              {/* Data Pribadi & Fisik */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h4 className="font-extrabold uppercase text-[11px] text-blue-900 border-b pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Data Calon Peserta Didik & Fisik</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Asal Sekolah:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.previousSchool || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tempat, Tgl Lahir:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.birthPlace}, {formatDateIndo(detailModalData.birthDate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jenis Kelamin:</span>
                    <strong className="text-slate-900">{detailModalData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIK:</span>
                    <strong className="text-slate-900 font-mono">{detailModalData.nik || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NISN:</span>
                    <strong className="text-slate-900 font-mono">{detailModalData.nisn || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Agama:</span>
                    <strong className="text-slate-900">{detailModalData.religion || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. Kartu Keluarga (KK):</span>
                    <strong className="text-slate-900 font-mono">{detailModalData.noKk || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. Reg Akta Lahir:</span>
                    <strong className="text-slate-900 font-mono uppercase">{detailModalData.aktaLahirRegNo || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tinggi / Berat / Kepala:</span>
                    <strong className="text-slate-900">
                      {detailModalData.heightCm || '-'} cm / {detailModalData.weightKg || '-'} kg / {detailModalData.headCircumferenceCm ? `${detailModalData.headCircumferenceCm} cm` : '-'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Alamat Sesuai KK */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h4 className="font-extrabold uppercase text-[11px] text-blue-900 border-b pb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Alamat Tempat Tinggal (Sesuai KK)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <span className="text-slate-400 block text-[10px]">Alamat Lengkap:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.address}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RT / RW / Dusun:</span>
                    <strong className="text-slate-900">RT {detailModalData.rt || '-'} / RW {detailModalData.rw || '-'} / {detailModalData.dusun || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kelurahan / Kecamatan:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.kelurahan || '-'} / {detailModalData.kecamatan || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kabupaten/Kota & Kode Pos:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.kabupatenKota || '-'} {detailModalData.postalCode || ''}</strong>
                  </div>
                </div>
              </div>

              {/* Domisili, Transportasi & Bantuan */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h4 className="font-extrabold uppercase text-[11px] text-blue-900 border-b pb-1.5 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  <span>Domisili, Transportasi, Keadaan Keluarga & Bantuan</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tempat Tinggal:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.residenceType || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Moda Transportasi:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.transportationMode || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jarak & Waktu Tempuh:</span>
                    <strong className="text-slate-900">{detailModalData.distanceToSchoolKm || '-'} km ({detailModalData.travelTimeToSchoolMin || '-'} mnt)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Anak Ke / Jml Saudara:</span>
                    <strong className="text-slate-900">Anak ke-{detailModalData.birthOrder || 1} ({detailModalData.siblingsCount || 0} saudara)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Hubungan:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.familyRelationStatus || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Penerima KPS:</span>
                    <strong className="text-slate-900">{detailModalData.isKpsRecipient === 'YA' ? `Ya (${detailModalData.kpsNumber || ''})` : 'Tidak'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Punya KIP:</span>
                    <strong className="text-slate-900">{detailModalData.hasKip === 'YA' ? `Ya (${detailModalData.kipNumber || ''})` : 'Tidak'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Orang Tua / Kontak:</span>
                    <strong className="text-slate-900 uppercase">{detailModalData.parentName} ({detailModalData.parentPhone})</strong>
                  </div>
                </div>
              </div>

              {/* Berkas Dokumen yang Diunggah */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h4 className="font-extrabold uppercase text-[11px] text-blue-900 border-b pb-1.5 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Status Berkas Dokumen (Maks. 10MB)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                    <span className="text-slate-600 font-medium">1. Pas Foto Terbaru (*):</span>
                    <span className="font-bold text-emerald-800 font-mono text-[11px]">
                      {detailModalData.docPasFoto || '✓ Terlampir'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                    <span className="text-slate-600 font-medium">2. Kartu Keluarga (C1) (*):</span>
                    <span className="font-bold text-emerald-800 font-mono text-[11px]">
                      {detailModalData.docKartuKeluarga || '✓ Terlampir'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                    <span className="text-slate-600 font-medium">3. Akta Lahir (*):</span>
                    <span className="font-bold text-emerald-800 font-mono text-[11px]">
                      {detailModalData.docAktaLahir || '✓ Terlampir'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                    <span className="text-slate-600 font-medium">4. Surat TK / Pindah:</span>
                    <span className="font-bold text-slate-700 font-mono text-[11px]">
                      {detailModalData.docSuratTkOrPindah || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200 sm:col-span-2">
                    <span className="text-slate-600 font-medium">5. Surat Keterangan Psikolog (&lt;6 Th pada Juli 2027):</span>
                    <span className="font-bold text-slate-700 font-mono text-[11px]">
                      {detailModalData.docSuratPsikolog || '-'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalData(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
         MODAL 3: UBAH STATUS PENDAFTARAN
         ===================================================================== */}
      {statusChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Verifikasi & Ubah Status Calon Murid</h3>
              <button
                onClick={() => setStatusChangeTarget(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block text-[10px]">Calon Murid:</span>
                <strong className="text-slate-900 text-sm uppercase">{statusChangeTarget.fullName}</strong>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  NIS: <strong>{statusChangeTarget.nis}</strong> · Ortu: {statusChangeTarget.parentName}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Status Penerimaan Baru:
                </label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value as SPMBStatus)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  <option value="DITERIMA">DITERIMA (Lolos & Masuk Kuota)</option>
                  <option value="MENUNGGU_VERIFIKASI">MENUNGGU VERIFIKASI (Berkas Tertunda)</option>
                  <option value="CADANGAN">CADANGAN (Daftar Tunggu)</option>
                  <option value="DITOLAK">DITOLAK (Tidak Memenuhi Syarat)</option>
                </select>
                <p className="text-[10px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>Notifikasi email konfirmasi pembaruan status akan otomatis dikirimkan ke pendaftar.</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusChangeTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatusChange}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan & Kirim Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
         MODAL 4: CETAK BUKTI PENDAFTARAN RESMI BESERTA DATA LENGKAP
         ===================================================================== */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            {/* Top Toolbar */}
            <div className="no-print bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Bukti Pendaftaran Resmi Calon Peserta Didik Baru</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setSelectedProof(null)}
                  className="p-1 rounded-lg text-white/70 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 print:p-0">
              
              {/* Kop Surat Sekolah */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={BOPKRI_LOGO}
                    onError={handleImageError}
                    alt="Logo BOPKRI"
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h2 className="text-xs uppercase font-extrabold text-blue-900 tracking-wider">
                      {staffInfo.foundationName}
                    </h2>
                    <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                      {staffInfo.schoolName}
                    </h1>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {staffInfo.address} · Telp: {staffInfo.phone} · Web: {staffInfo.website || 'www.sdbopkrigondolayu.sch.id'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Tahun Ajaran</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{staffInfo.academicYear}</span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-950 uppercase underline tracking-wider">
                  BUKTI TANDA TERIMA PENDAFTARAN SPMB
                </h3>
                <p className="text-xs font-mono text-slate-600">
                  Nomor: {selectedProof.registrationNumber}
                </p>
              </div>

              {/* Rincian Calon Siswa */}
              <table className="w-full text-xs border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50 w-48">Nomor Induk Siswa (NIS)</td>
                    <td className="p-2.5 font-mono font-black text-sm text-blue-950">{selectedProof.nis}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Nama Calon Siswa</td>
                    <td className="p-2.5 font-bold text-slate-900 uppercase">{selectedProof.fullName}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Asal Sekolah</td>
                    <td className="p-2.5 uppercase">{selectedProof.previousSchool || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">NIK / NISN</td>
                    <td className="p-2.5 font-mono">{selectedProof.nik || '-'} / {selectedProof.nisn || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Jenis Kelamin / Agama</td>
                    <td className="p-2.5">{selectedProof.gender === 'L' ? 'Laki-laki' : 'Perempuan'} · {selectedProof.religion || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Tempat, Tanggal Lahir</td>
                    <td className="p-2.5 uppercase">{selectedProof.birthPlace}, {formatDateIndo(selectedProof.birthDate)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Tinggi / Berat / Lingkar Kepala</td>
                    <td className="p-2.5">
                      {selectedProof.heightCm || '-'} cm / {selectedProof.weightKg || '-'} kg / {selectedProof.headCircumferenceCm ? `${selectedProof.headCircumferenceCm} cm` : '-'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">No. KK / Reg. Akta Lahir</td>
                    <td className="p-2.5 font-mono">{selectedProof.noKk || '-'} / {selectedProof.aktaLahirRegNo || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Alamat Tempat Tinggal (KK)</td>
                    <td className="p-2.5 uppercase">
                      {selectedProof.address}, RT {selectedProof.rt || '-'}/RW {selectedProof.rw || '-'}, {selectedProof.kelurahan || '-'}, {selectedProof.kecamatan || '-'}, {selectedProof.kabupatenKota || '-'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Tempat Tinggal / Moda Transportasi</td>
                    <td className="p-2.5 uppercase">
                      {selectedProof.residenceType || 'BERSAMA ORANG TUA'} · {selectedProof.transportationMode || 'SEPEDA MOTOR'} (Jarak: {selectedProof.distanceToSchoolKm || 1} km, {selectedProof.travelTimeToSchoolMin || 15} menit)
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Data Keluarga / Bantuan KPS / KIP</td>
                    <td className="p-2.5">
                      Anak ke-{selectedProof.birthOrder || 1} ({selectedProof.familyRelationStatus || 'ANAK KANDUNG'}, {selectedProof.siblingsCount || 0} saudara) · KPS: {selectedProof.isKpsRecipient || 'TIDAK'} · KIP: {selectedProof.hasKip || 'TIDAK'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Jalur / Target Kelas</td>
                    <td className="p-2.5 font-semibold text-slate-900">{selectedProof.entryTrack} · {selectedProof.targetGrade}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Nama Orang Tua & Kontak</td>
                    <td className="p-2.5 uppercase">{selectedProof.parentName} · {selectedProof.parentPhone} · {selectedProof.parentEmail}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Berkas Dokumen Terlampir</td>
                    <td className="p-2.5 text-[11px] font-mono">
                      1. Pas Foto: {selectedProof.docPasFoto || '✓ Terlampir'} | 2. C1: {selectedProof.docKartuKeluarga || '✓ Terlampir'} | 3. Akta: {selectedProof.docAktaLahir || '✓ Terlampir'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold bg-slate-50">Status Pendaftaran</td>
                    <td className="p-2.5 font-bold text-emerald-800">{selectedProof.status}</td>
                  </tr>
                </tbody>
              </table>

              {/* Tanda Tangan */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Orang Tua / Wali Murid,</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900 uppercase">{selectedProof.parentName}</p>
                </div>
                <div>
                  <p className="text-slate-500">
                    Yogyakarta, {formatDateIndo(selectedProof.registrationDate)}
                  </p>
                  <p className="text-slate-500">Panitia SPMB / Kepala Sekolah,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-blue-900 font-bold border border-blue-200 px-2 py-0.5 rounded bg-blue-50/50">
                      [TERVERIFIKASI RESMI SIBOGO]
                    </span>
                  </div>
                  <p className="font-bold underline text-slate-900">{staffInfo.principal}</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
