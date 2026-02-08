import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../../types';
import { iconMap } from '../../utils/iconMap';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, iconName: string) => Promise<void>;
  initialData?: Category;
  title: string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  title 
}) => {
  const [label, setLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Cpu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchIcon, setSearchIcon] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setLabel(initialData.label);
        setSelectedIcon(initialData.icon_name);
      } else {
        setLabel('');
        setSelectedIcon('Cpu');
      }
      setError(null);
      setSearchIcon('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('O nome da categoria é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await onSave(label, selectedIcon);
      onClose();
    } catch (err) {
      setError('Erro ao salvar categoria');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredIcons = Object.keys(iconMap).filter(name => 
    name.toLowerCase().includes(searchIcon.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1E36] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-[#051024] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="Ex: Marketing"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">Ícone</label>
              <input 
                type="text" 
                placeholder="Buscar ícone..." 
                value={searchIcon}
                onChange={(e) => setSearchIcon(e.target.value)}
                className="bg-[#051024] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37] w-32"
              />
            </div>
            <div className="grid grid-cols-6 gap-2 h-48 overflow-y-auto p-2 bg-[#051024] rounded-lg border border-white/10 custom-scrollbar">
              {filteredIcons.map((iconName) => {
                const Icon = iconMap[iconName];
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`
                      p-2 rounded-lg flex items-center justify-center transition-all
                      ${isSelected 
                        ? 'bg-[#D4AF37] text-[#051024] shadow-lg scale-105' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                    `}
                    title={iconName}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded border border-red-400/20">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#D4AF37] text-[#051024] rounded-lg font-semibold text-sm hover:bg-[#E5C158] transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? 'Salvando...' : (
                <>
                  <Check size={16} className="mr-1.5" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
