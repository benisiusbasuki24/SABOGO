import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Student } from '../types';
import { Search, UserCheck, X, GraduationCap, Check, ChevronDown } from 'lucide-react';

interface StudentPickerProps {
  students: Student[];
  selectedStudentId?: string;
  selectedStudentName?: string;
  selectedStudentNis?: string;
  onSelect: (student: Student | null) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
}

export const StudentPicker: React.FC<StudentPickerProps> = ({
  students,
  selectedStudentId,
  selectedStudentName,
  selectedStudentNis,
  onSelect,
  required = false,
  label = 'Pilih Nama Siswa (Anak Kandung / Asuh)',
  placeholder = 'Ketik nama siswa atau NIS...',
  helperText = 'Pilih siswa yang bersekolah di SD BOPKRI Gondolayu',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Find currently selected student object
  const currentStudent = useMemo(() => {
    if (selectedStudentId) {
      const match = students.find((s) => s.id === selectedStudentId);
      if (match) return match;
    }
    if (selectedStudentNis) {
      const match = students.find((s) => s.nis === selectedStudentNis);
      if (match) return match;
    }
    if (selectedStudentName) {
      const match = students.find(
        (s) => s.name.toLowerCase() === selectedStudentName.toLowerCase()
      );
      if (match) return match;
    }
    return null;
  }, [students, selectedStudentId, selectedStudentNis, selectedStudentName]);

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return students.slice(0, 50); // Show first 50 by default
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.nis.toLowerCase().includes(term) ||
          s.grade.toLowerCase().includes(term) ||
          (s.parentName && s.parentName.toLowerCase().includes(term))
      )
      .slice(0, 50);
  }, [students, searchTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectStudent = (student: Student) => {
    onSelect(student);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchTerm('');
  };

  return (
    <div className="space-y-1.5" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {currentStudent ? (
        /* Selected Student Card */
        <div className="p-3 bg-blue-50/90 border-2 border-blue-400/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-blue-950 truncate">
                  {currentStudent.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-200/80 text-blue-900">
                  {currentStudent.grade}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                NIS: <strong className="text-slate-800 font-mono">{currentStudent.nis}</strong>
                {currentStudent.parentName && (
                  <> · Orang Tua: <span className="text-slate-700 font-medium">{currentStudent.parentName}</span></>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setSearchTerm('');
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-blue-800 bg-white hover:bg-blue-100/80 border border-blue-300 rounded-lg transition-colors cursor-pointer"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleClear}
              title="Hapus pilihan anak"
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Selector Trigger Button */
        <div className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
              error
                ? 'border-red-400 ring-2 ring-red-100 bg-red-50/30'
                : 'border-slate-300 hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 text-slate-500">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-normal">{placeholder}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {/* Search Box inside Dropdown */}
              <div className="p-2.5 border-b border-slate-200 bg-slate-50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ketik nama murid atau NIS..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-500">
                  <span>Ditemukan: {filteredStudents.length} siswa</span>
                  <span>Total: {students.length} siswa terdaftar</span>
                </div>
              </div>

              {/* Student Options List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => {
                    const isSelected = s.id === selectedStudentId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectStudent(s)}
                        className={`p-2.5 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                          isSelected ? 'bg-blue-50 font-bold text-blue-900' : 'text-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 truncate">
                              {s.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                              {s.grade}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">NIS: {s.nis}</span>
                            {s.parentName && (
                              <span className="truncate">· Ortu: {s.parentName}</span>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">Tidak ada siswa yang cocok</p>
                    <p className="text-[11px] mt-0.5 text-slate-400">
                      Coba cari dengan kata kunci nama atau NIS lainnya.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error ? (
        <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>
      ) : helperText && !currentStudent ? (
        <p className="text-[10px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
