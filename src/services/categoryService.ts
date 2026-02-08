import { supabase } from '../lib/supabase';
import { Category } from '../types';

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Category[];
  },

  async createCategory(label: string, icon_name: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        label,
        icon_name,
        is_default: false
      })
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Pick<Category, 'label' | 'icon_name'>>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
