import supabase from "@/lib/supabaseClient";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

const withTimeout = async <T>(
  promise: PromiseLike<T>,
  timeoutMs = 15000,
  timeoutMessage = "Supabase request timed out",
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

// ─── Employer Profile ────────────────────────────────────────────────

export async function getEmployerProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("employer_profiles")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

export async function createEmployerProfile(payload: {
  user_id: string;
  name: string;
  email?: string;
  description?: string;
  profile_pic?: string;
  background_img?: string;
  industry?: string;
  location?: string;
  website?: string;
  no_of_employers?: number;
  specialties?: string;
  phone_number?: number;
  country_code?: number;
}) {
  // Use upsert on user_id to avoid unique constraint errors when profile already exists.
  const now = new Date().toISOString();
  const insertObj = { ...payload, updated_at: now };

  try {
    // guard against indefinitely hanging requests by applying a timeout
    const supabaseCall = supabase
      .from("employer_profiles")
      .upsert([insertObj], { onConflict: "user_id" })
      .select()
      .single();

    const timeoutMs = 15000;
    const timeoutPromise = new Promise((_res, rej) =>
      setTimeout(() => rej(new Error("Supabase request timed out")), timeoutMs),
    );

    const resp = (await Promise.race([
      supabaseCall,
      timeoutPromise,
    ])) as PostgrestSingleResponse<unknown>;

    // Normalize return shape similar to other service functions: throw on error, return data
    if (resp?.error) {
      console.error("createEmployerProfile error from supabase:", resp.error);
      throw resp.error;
    }

    return resp?.data ?? resp;
  } catch (err) {
    console.error("createEmployerProfile caught error:", err);
    throw err;
  }
}

export async function updateEmployerProfile(
  profileId: string,
  updates: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("employer_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Employer Data (links profile → jobs/partnerships) ──────────────

export async function getOrCreateEmployerData(employerProfileId: string) {
  const { data, error } = await withTimeout(
    supabase
      .from("employer_data")
      .upsert(
        { employer_profile_id: employerProfileId },
        { onConflict: "employer_profile_id" },
      )
      .select()
      .single(),
    15000,
    "Loading employer data timed out",
  );
  if (error) throw error;
  return data;
}

// ─── Jobs ────────────────────────────────────────────────────────────

export async function listJobsByEmployerDataId(employerDataId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_data_id", employerDataId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createJob(payload: {
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  salary?: number | null;
  date?: string | null;
  skill?: string[] | null;
  image?: string | null;
  employer_data_id: string;
  requires_interview?: boolean;
}) {
  const now = new Date().toISOString();
  const insertObj = {
    ...payload,
    updated_at: now,
    published_at: now,
  };

  const { data, error } = await withTimeout(
    supabase.from("jobs").insert([insertObj]).select().single(),
    15000,
    "Posting job timed out",
  );
  if (error) throw error;
  return data;
}

export async function uploadJobImage(file: File, userId: string) {
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_JOB_IMAGES_BUCKET || "job-images";
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await withTimeout(
    supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    }),
    20000,
    "Image upload timed out",
  );

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error("Failed to resolve uploaded image URL.");
  }

  return data.publicUrl;
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw error;
}

// ─── Global Job Postings ─────────────────────────────────────────────

export async function createGlobalJobPosting(payload: {
  employer_profile_id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: number | null;
  description?: string | null;
  requirements?: string | null;
  deadline?: string | null;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("global_job_postings")
    .insert([{ ...payload, published_at: now, updated_at: now }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listGlobalJobPostingsByEmployer(
  employerProfileId: string,
) {
  const { data, error } = await supabase
    .from("global_job_postings")
    .select("*")
    .eq("employer_profile_id", employerProfileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteGlobalJobPosting(postingId: string) {
  const { error } = await supabase
    .from("global_job_postings")
    .delete()
    .eq("id", postingId);
  if (error) throw error;
}

// ─── College Job Postings ────────────────────────────────────────────

export async function createCollegeJobPosting(payload: {
  employer_profile_id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: number | null;
  description?: string | null;
  requirements?: string | null;
  deadline?: string | null;
  colleges?: unknown; // stored as jsonb in DB
}) {
  const now = new Date().toISOString();
  const insertObj = { ...payload, published_at: now, updated_at: now };
  const { data, error } = await supabase
    .from("college_job_postings")
    .insert([insertObj])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listCollegeJobPostings() {
  const { data, error } = await supabase
    .from("college_job_postings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ─── College Profiles (read-only for employers) ─────────────────────

export async function listCollegeProfiles() {
  const { data, error } = await supabase
    .from("college_profiles")
    .select("*")
    .order("college_name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCollegeProfile(collegeId: string) {
  const { data, error } = await supabase
    .from("college_profiles")
    .select("*")
    .eq("id", collegeId)
    .single();
  if (error) throw error;
  return data;
}

// ─── Employer–College Partnerships ───────────────────────────────────

export async function listPartnerships(employerDataId: string) {
  const { data, error } = await supabase
    .from("employer_college_partnerships")
    .select("*, college_profiles(*)")
    .eq("employer_data_id", employerDataId);
  if (error) throw error;
  return data;
}

export async function createPartnership(
  employerDataId: string,
  collegeProfileId: string,
) {
  const { data, error } = await supabase
    .from("employer_college_partnerships")
    .insert([
      {
        employer_data_id: employerDataId,
        college_profile_id: collegeProfileId,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Student Profiles (read-only for employers) ─────────────────────

export async function listStudentProfiles(filters?: {
  college?: string;
  minCgpa?: number;
  skills?: string[];
}) {
  let query = supabase
    .from("student_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.college) {
    query = query.eq("college", filters.college);
  }
  if (filters?.minCgpa) {
    query = query.gte("graduation_year", 0); // placeholder – cgpa not directly in column
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getStudentProfile(studentProfileId: string) {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", studentProfileId)
    .single();
  if (error) throw error;
  return data;
}

// ─── Dashboard Tiles ─────────────────────────────────────────────────

export async function getDashboardTiles() {
  const { data, error } = await supabase
    .from("employer_dash_tiles")
    .select("*")
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error; // ignore "no rows"
  return data;
}
