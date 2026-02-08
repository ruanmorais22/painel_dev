import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqujggzccazvahrqryqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdWpnZ3pjY2F6dmFocnFyeXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2NjE4MzgsImV4cCI6MjA0NDIzNzgzOH0._gaxMdEcMG-QIY7fMRC74JgFDC3lhkgtixVdR11SWZM';

export const supabase = createClient(supabaseUrl, supabaseKey);