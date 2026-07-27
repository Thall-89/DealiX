import { localRepository } from "@/lib/data/localRepository";
import { supabaseRepository } from "@/lib/data/supabaseRepository";
export const activeRepository = () => supabaseRepository.configured ? supabaseRepository : localRepository;
