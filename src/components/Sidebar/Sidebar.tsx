import React, { useState, useEffect } from 'react';
import { X, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Category, Folder } from '../../types';
import { categoryService } from '../../services/categoryService';
import { CategoryModal } from './CategoryModal';
import { getIcon } from '../../utils/iconMap';
import toast from 'react-hot-toast';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setCurrentFolder: (folder: Folder | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, setCurrentFolder }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
      
      // If activeTab is not in categories (e.g. initial load or deleted), set to first one
      if (data.length > 0) {
        const activeExists = data.some(c => c.id === activeTab);
        if (!activeTab || !activeExists) {
          setActiveTab(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async (label: string, iconName: string) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { label, icon_name: iconName });
        toast.success('Categoria atualizada com sucesso');
      } else {
        await categoryService.createCategory(label, iconName);
        toast.success('Categoria criada com sucesso');
      }
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Categoria excluída com sucesso');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-[#051024] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <img 
              src="/logo.svg" 
              alt="PainelDev" 
              className="h-10 mb-2 object-contain"
            />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 pt-6 pb-2 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categorias</span>
          <button 
            onClick={() => {
              setEditingCategory(undefined);
              setIsModalOpen(true);
            }}
            className="text-slate-400 hover:text-[#D4AF37] transition-colors p-1 rounded hover:bg-white/5"
            title="Nova Categoria"
          >
            <Plus size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-6 custom-scrollbar">
          {loading ? (
            <div className="text-center py-4 text-slate-500 text-sm">Carregando...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm px-4 border border-dashed border-slate-800 rounded-lg bg-white/5">
              Nenhuma categoria encontrada.
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-[#D4AF37] hover:underline block w-full"
              >
                Criar primeira
              </button>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="relative group">
                <button
                  onClick={() => {
                    setActiveTab(cat.id);
                    setCurrentFolder(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-4 rounded-xl transition-all duration-300 pr-10
                    ${activeTab === cat.id
                      ? 'bg-[#0F1E36] border border-[#D4AF37]/30 text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'text-slate-400 hover:bg-[#0F1E36] hover:text-[#D4AF37] border border-transparent'}
                  `}
                >
                  <span className={`mr-3 transition-colors ${activeTab === cat.id ? 'text-[#D4AF37]' : 'text-slate-500 group-hover:text-[#D4AF37]'}`}>
                    {getIcon(cat.icon_name, { size: 20 })}
                  </span>
                  <span className="font-poppins font-semibold text-sm truncate">{cat.label}</span>
                </button>
                
                {/* Actions Menu */}
                {!cat.is_default && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === cat.id ? null : cat.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {menuOpen === cat.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-32 bg-[#0F1E36] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategory(cat);
                                setIsModalOpen(true);
                                setMenuOpen(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                            >
                              <Pencil size={14} /> Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(cat.id);
                                setMenuOpen(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </nav>
        <div className="p-6 border-t border-white/10 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] opacity-60 mb-2">Sincronização Ativa</div>
          <div className="text-xs text-slate-600 font-mono">v2.3 • Mobile Ready</div>
        </div>
      </aside>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategory}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
      />
    </>
  );
};
