import supabase from '@/lib/supabaseClient';

export async function getEmployerProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

export async function listJobsByEmployerProfileId(employerProfileId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('employer_data_id', employerProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createJob(payload: {
  title: string;
  company?: string;
  location?: string;
  description?: string;
  salary?: number;
  skill?: any;
  image?: string;
  employer_data_id?: string;
}) {
  const { data, error } = await supabase.from('jobs').insert([payload]).select().single();
  if (error) throw error;
  return data;
}
