export type GradeBand =
  | 'PRIMARY'
  | 'MIDDLE'
  | 'SECONDARY'
  | 'INTERMEDIATE'

export type Stream =
  | 'SCIENCE'
  | 'COMMERCE'
  | 'HUMANITIES'
  | 'LANGUAGES'
  | 'ALL'

export type Board = 'CBSE' | 'ICSE' | 'IGCSE' | 'STATE' | 'COMMON_CORE'

export interface Subject {
  id: string
  label: string
  bands: GradeBand[]
  boards: Board[]
  streams: Stream[]
  group: string
}

export const SUBJECT_CATALOGUE: Subject[] = [
  { id: 'math_primary', label: 'Mathematics', bands: ['PRIMARY'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'math_middle', label: 'Mathematics', bands: ['MIDDLE'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'math_secondary', label: 'Mathematics', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'math_11', label: 'Mathematics', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['SCIENCE', 'COMMERCE'], group: 'Mathematics' },
  { id: 'statistics_11', label: 'Statistics', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['SCIENCE', 'COMMERCE', 'HUMANITIES'], group: 'Mathematics' },
  { id: 'applied_math_11', label: 'Applied Mathematics', bands: ['INTERMEDIATE'], boards: ['CBSE'], streams: ['COMMERCE', 'HUMANITIES'], group: 'Mathematics' },

  { id: 'science_primary', label: 'Science', bands: ['PRIMARY'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Science' },
  { id: 'science_middle', label: 'Science', bands: ['MIDDLE'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Science' },
  { id: 'physics_secondary', label: 'Physics (Integrated)', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Science' },
  { id: 'chemistry_secondary', label: 'Chemistry (Integrated)', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Science' },
  { id: 'biology_secondary', label: 'Biology (Integrated)', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Science' },
  { id: 'physics_11', label: 'Physics', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'chemistry_11', label: 'Chemistry', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'biology_11', label: 'Biology', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'botany_11', label: 'Botany', bands: ['INTERMEDIATE'], boards: ['STATE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'zoology_11', label: 'Zoology', bands: ['INTERMEDIATE'], boards: ['STATE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'cs_secondary', label: 'Computer Science', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Science' },
  { id: 'cs_11', label: 'Computer Science', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['SCIENCE', 'COMMERCE'], group: 'Science' },
  { id: 'it_11', label: 'Information Technology', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['SCIENCE', 'COMMERCE'], group: 'Science' },
  { id: 'environmental_science', label: 'Environmental Science', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE'], streams: ['SCIENCE', 'HUMANITIES'], group: 'Science' },

  { id: 'social_primary', label: 'Social Studies', bands: ['PRIMARY'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Social Science' },
  { id: 'social_middle', label: 'Social Studies', bands: ['MIDDLE'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Social Science' },
  { id: 'history_secondary', label: 'History', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Social Science' },
  { id: 'geography_secondary', label: 'Geography', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Social Science' },
  { id: 'civics_secondary', label: 'Civics / Political Science', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Social Science' },
  { id: 'economics_secondary', label: 'Economics', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Social Science' },

  { id: 'history_11', label: 'History', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['HUMANITIES'], group: 'Humanities' },
  { id: 'geography_11', label: 'Geography', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['HUMANITIES', 'SCIENCE'], group: 'Humanities' },
  { id: 'political_science_11', label: 'Political Science', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['HUMANITIES'], group: 'Humanities' },
  { id: 'sociology_11', label: 'Sociology', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['HUMANITIES'], group: 'Humanities' },
  { id: 'psychology_11', label: 'Psychology', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['SCIENCE', 'HUMANITIES'], group: 'Humanities' },
  { id: 'philosophy_11', label: 'Philosophy', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['HUMANITIES'], group: 'Humanities' },
  { id: 'home_science_11', label: 'Home Science', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['HUMANITIES', 'SCIENCE'], group: 'Humanities' },
  { id: 'public_admin_11', label: 'Public Administration', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['HUMANITIES'], group: 'Humanities' },

  { id: 'commerce_11', label: 'Commerce', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['COMMERCE'], group: 'Commerce' },
  { id: 'accounts_11', label: 'Accountancy', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['COMMERCE'], group: 'Commerce' },
  { id: 'business_studies_11', label: 'Business Studies', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['COMMERCE'], group: 'Commerce' },
  { id: 'economics_11', label: 'Economics', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['COMMERCE', 'HUMANITIES', 'SCIENCE'], group: 'Commerce' },
  { id: 'entrepreneurship_11', label: 'Entrepreneurship', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['COMMERCE'], group: 'Commerce' },

  { id: 'english_primary', label: 'English', bands: ['PRIMARY'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Languages' },
  { id: 'english_middle', label: 'English', bands: ['MIDDLE'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Languages' },
  { id: 'english_secondary', label: 'English', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['ALL'], group: 'Languages' },
  { id: 'english_11', label: 'English', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE', 'COMMON_CORE'], streams: ['SCIENCE', 'COMMERCE', 'HUMANITIES', 'LANGUAGES'], group: 'Languages' },
  { id: 'english_literature_11', label: 'English Literature', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE'], streams: ['HUMANITIES', 'LANGUAGES'], group: 'Languages' },

  { id: 'hindi_primary', label: 'Hindi', bands: ['PRIMARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'hindi_middle', label: 'Hindi', bands: ['MIDDLE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'hindi_secondary', label: 'Hindi', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'hindi_11', label: 'Hindi', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['SCIENCE', 'COMMERCE', 'HUMANITIES', 'LANGUAGES'], group: 'Languages' },

  { id: 'telugu_primary', label: 'Telugu', bands: ['PRIMARY'], boards: ['STATE', 'CBSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'telugu_middle', label: 'Telugu', bands: ['MIDDLE'], boards: ['STATE', 'CBSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'telugu_secondary', label: 'Telugu', bands: ['SECONDARY'], boards: ['STATE', 'CBSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'telugu_11', label: 'Telugu', bands: ['INTERMEDIATE'], boards: ['STATE', 'CBSE'], streams: ['SCIENCE', 'COMMERCE', 'HUMANITIES', 'LANGUAGES'], group: 'Languages' },

  { id: 'sanskrit_middle', label: 'Sanskrit', bands: ['MIDDLE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'sanskrit_secondary', label: 'Sanskrit', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'sanskrit_11', label: 'Sanskrit', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['HUMANITIES', 'LANGUAGES'], group: 'Languages' },

  { id: 'urdu_primary', label: 'Urdu', bands: ['PRIMARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'urdu_middle', label: 'Urdu', bands: ['MIDDLE'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'urdu_secondary', label: 'Urdu', bands: ['SECONDARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'urdu_11', label: 'Urdu', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['HUMANITIES', 'LANGUAGES'], group: 'Languages' },

  { id: 'tamil_primary', label: 'Tamil', bands: ['PRIMARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'tamil_middle', label: 'Tamil', bands: ['MIDDLE'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'tamil_secondary', label: 'Tamil', bands: ['SECONDARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'tamil_11', label: 'Tamil', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['HUMANITIES', 'LANGUAGES'], group: 'Languages' },

  { id: 'french_middle', label: 'French', bands: ['MIDDLE'], boards: ['CBSE', 'ICSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'french_secondary', label: 'French', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'french_11', label: 'French', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'german_secondary', label: 'German', bands: ['SECONDARY'], boards: ['CBSE', 'ICSE'], streams: ['ALL'], group: 'Languages' },

  { id: 'ela_cc', label: 'English Language Arts', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Core Subjects' },
  { id: 'math_cc', label: 'Mathematics', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Core Subjects' },
  { id: 'algebra_cc', label: 'Algebra I & II', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'geometry_cc', label: 'Geometry', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'precalc_cc', label: 'Pre-Calculus', bands: ['INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'calculus_cc', label: 'Calculus (AP)', bands: ['INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'bio_cc', label: 'Biology', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Science' },
  { id: 'chem_cc', label: 'Chemistry', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Science' },
  { id: 'physics_cc', label: 'Physics', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Science' },
  { id: 'us_history_cc', label: 'US History', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Social Studies' },
  { id: 'world_history_cc', label: 'World History', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Social Studies' },
  { id: 'economics_cc', label: 'Economics', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Social Studies' },
  { id: 'ap_cs_cc', label: 'AP Computer Science', bands: ['INTERMEDIATE'], boards: ['COMMON_CORE'], streams: ['ALL'], group: 'Science' },

  { id: 'physical_education', label: 'Physical Education', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY', 'INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Vocational' },
  { id: 'fine_arts_11', label: 'Fine Arts / Drawing', bands: ['SECONDARY', 'INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['HUMANITIES'], group: 'Vocational' },
  { id: 'music_11', label: 'Music', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['HUMANITIES'], group: 'Vocational' },

  { id: 'igcse_math', label: 'Mathematics', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'igcse_extended_math', label: 'Extended Mathematics', bands: ['SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'igcse_add_math', label: 'Additional Mathematics', bands: ['SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Mathematics' },
  { id: 'igcse_english_first', label: 'English as a First Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'igcse_english_second', label: 'English as a Second Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'igcse_physics', label: 'Physics', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Science' },
  { id: 'igcse_chemistry', label: 'Chemistry', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Science' },
  { id: 'igcse_biology', label: 'Biology', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Science' },
  { id: 'igcse_combined_science', label: 'Combined Science', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Science' },
  { id: 'igcse_coord_science', label: 'Co-ordinated Sciences', bands: ['SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Science' },
  { id: 'igcse_history', label: 'History', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Humanities' },
  { id: 'igcse_geography', label: 'Geography', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Humanities' },
  { id: 'igcse_economics', label: 'Economics', bands: ['SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Humanities' },
  { id: 'igcse_business', label: 'Business Studies', bands: ['SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Humanities' },
  { id: 'igcse_accounting', label: 'Accounting', bands: ['SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Humanities' },
  { id: 'igcse_sociology', label: 'Sociology', bands: ['SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Humanities' },
  { id: 'igcse_computer_science', label: 'Computer Science', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Science' },
  { id: 'igcse_ict', label: 'Information & Communication Technology', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Science' },
  { id: 'igcse_art', label: 'Art & Design', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Vocational' },
  { id: 'igcse_music', label: 'Music', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Vocational' },
  { id: 'igcse_drama', label: 'Drama', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Vocational' },
  { id: 'igcse_physical_ed', label: 'Physical Education', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Vocational' },
  { id: 'igcse_environmental', label: 'Environmental Management', bands: ['SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Science' },
  { id: 'igcse_global_perspectives', label: 'Global Perspectives', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Humanities' },

  { id: 'igcse_hindi', label: 'Hindi as a Foreign Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'igcse_french', label: 'French as a Foreign Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'igcse_telugu', label: 'Telugu as a Foreign Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'igcse_tamil', label: 'Tamil as a Foreign Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'igcse_spanish', label: 'Spanish as a Foreign Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'igcse_arabic', label: 'Arabic as a Foreign Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'igcse_chinese', label: 'Chinese as a Foreign Language', bands: ['MIDDLE', 'SECONDARY'], boards: ['IGCSE'], streams: ['ALL'], group: 'Languages' },

  { id: 'alevel_math', label: 'A-Level Mathematics', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['SCIENCE', 'COMMERCE'], group: 'Mathematics' },
  { id: 'alevel_further_math', label: 'A-Level Further Mathematics', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['SCIENCE'], group: 'Mathematics' },
  { id: 'alevel_physics', label: 'A-Level Physics', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'alevel_chemistry', label: 'A-Level Chemistry', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'alevel_biology', label: 'A-Level Biology', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'alevel_cs', label: 'A-Level Computer Science', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['SCIENCE'], group: 'Science' },
  { id: 'alevel_economics', label: 'A-Level Economics', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['COMMERCE', 'HUMANITIES'], group: 'Humanities' },
  { id: 'alevel_business', label: 'A-Level Business', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['COMMERCE'], group: 'Humanities' },
  { id: 'alevel_accounting', label: 'A-Level Accounting', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['COMMERCE'], group: 'Humanities' },
  { id: 'alevel_history', label: 'A-Level History', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['HUMANITIES'], group: 'Humanities' },
  { id: 'alevel_geography', label: 'A-Level Geography', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['HUMANITIES', 'SCIENCE'], group: 'Humanities' },
  { id: 'alevel_english_lit', label: 'A-Level English Literature', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['HUMANITIES', 'LANGUAGES'], group: 'Languages' },
  { id: 'alevel_english_lang', label: 'A-Level English Language', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['HUMANITIES', 'LANGUAGES'], group: 'Languages' },
  { id: 'alevel_psychology', label: 'A-Level Psychology', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['SCIENCE', 'HUMANITIES'], group: 'Humanities' },
  { id: 'alevel_sociology', label: 'A-Level Sociology', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['HUMANITIES'], group: 'Humanities' },
  { id: 'alevel_law', label: 'A-Level Law', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['HUMANITIES'], group: 'Humanities' },
  { id: 'alevel_art', label: 'A-Level Art & Design', bands: ['INTERMEDIATE'], boards: ['IGCSE'], streams: ['HUMANITIES'], group: 'Vocational' },

  { id: 'marathi_primary', label: 'Marathi', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'marathi_11', label: 'Marathi', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['LANGUAGES', 'HUMANITIES'], group: 'Languages' },
  { id: 'odia_primary', label: 'Odia', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'odia_11', label: 'Odia', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['LANGUAGES', 'HUMANITIES'], group: 'Languages' },
  { id: 'malayalam_primary', label: 'Malayalam', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'malayalam_11', label: 'Malayalam', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['LANGUAGES', 'HUMANITIES'], group: 'Languages' },
  { id: 'bengali_primary', label: 'Bengali', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'bengali_11', label: 'Bengali', bands: ['INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'STATE'], streams: ['LANGUAGES', 'HUMANITIES'], group: 'Languages' },
  { id: 'gujarati_primary', label: 'Gujarati', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'gujarati_11', label: 'Gujarati', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['LANGUAGES', 'HUMANITIES'], group: 'Languages' },
  { id: 'punjabi_primary', label: 'Punjabi', bands: ['PRIMARY', 'MIDDLE', 'SECONDARY'], boards: ['CBSE', 'STATE'], streams: ['ALL'], group: 'Languages' },
  { id: 'punjabi_11', label: 'Punjabi', bands: ['INTERMEDIATE'], boards: ['CBSE', 'STATE'], streams: ['LANGUAGES', 'HUMANITIES'], group: 'Languages' },
  { id: 'french_igcse_school', label: 'French', bands: ['MIDDLE', 'SECONDARY', 'INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'german_igcse_school', label: 'German', bands: ['MIDDLE', 'SECONDARY', 'INTERMEDIATE'], boards: ['CBSE', 'ICSE', 'IGCSE'], streams: ['ALL'], group: 'Languages' },
  { id: 'spanish_school', label: 'Spanish', bands: ['MIDDLE', 'SECONDARY', 'INTERMEDIATE'], boards: ['CBSE', 'IGCSE'], streams: ['ALL'], group: 'Languages' },
]

export function getGradeBand(grade: string | number): GradeBand {
  const value = Number(grade)
  if (!Number.isFinite(value) || value <= 0) return 'PRIMARY'
  if (value <= 5) return 'PRIMARY'
  if (value <= 8) return 'MIDDLE'
  if (value <= 10) return 'SECONDARY'
  return 'INTERMEDIATE'
}

export function normaliseBoard(board: string): Board {
  const value = board.toUpperCase().trim()
  if (value.includes('IGCSE') || value.includes('CAMBRIDGE') || value.includes('CIE')) return 'IGCSE'
  if (value.includes('ICSE')) return 'ICSE'
  if (value.includes('COMMON') || value.includes('CORE') || value.includes('CC')) return 'COMMON_CORE'
  if (value.includes('STATE') || value.includes('AP') || value.includes('TS') || value.includes('MH') || value.includes('KA') || value.includes('TN')) return 'STATE'
  return 'CBSE'
}

export interface SubjectGroup {
  group: string
  stream?: string
  subjects: Subject[]
}

export function getSubjectsFor(board: string, grade: string | number): SubjectGroup[] {
  const normBoard = normaliseBoard(board)
  const band = getGradeBand(grade)

  const filtered = SUBJECT_CATALOGUE.filter((subject) => subject.bands.includes(band) && subject.boards.includes(normBoard))

  if (band !== 'INTERMEDIATE') {
    const groups = new Map<string, Subject[]>()
    filtered.forEach((subject) => {
      if (!groups.has(subject.group)) groups.set(subject.group, [])
      groups.get(subject.group)?.push(subject)
    })

    return Array.from(groups.entries()).map(([group, subjects]) => ({ group, subjects }))
  }

  const streamOrder: Stream[] = ['SCIENCE', 'COMMERCE', 'HUMANITIES', 'LANGUAGES']
  const result: SubjectGroup[] = []

  streamOrder.forEach((stream) => {
    const inStream = filtered.filter((subject) => subject.streams.includes(stream) || subject.streams.includes('ALL'))
    const groups = new Map<string, Subject[]>()

    inStream.forEach((subject) => {
      if (!groups.has(subject.group)) groups.set(subject.group, [])
      groups.get(subject.group)?.push(subject)
    })

    Array.from(groups.entries()).forEach(([group, subjects]) => {
      result.push({
        group,
        stream: stream.charAt(0).toUpperCase() + stream.slice(1).toLowerCase(),
        subjects,
      })
    })
  })

  return result
}

const SUBJECT_ALIASES: Record<string, string> = {
  math: 'Mathematics',
  mathematics: 'Mathematics',
  science: 'Science',
  'social science': 'Social Science',
  'social studies': 'Social Studies',
  'environmental studies': 'Environmental Studies',
  english: 'English',
  'english language arts': 'English Language Arts',
  hindi: 'Hindi',
  history: 'History',
  geography: 'Geography',
  economics: 'Economics',
  'computer science': 'Computer Science',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  'civics / political science': 'Civics / Political Science',
  civics: 'Civics / Political Science',
  'political science': 'Political Science',
  sociology: 'Sociology',
  psychology: 'Psychology',
  business: 'Business Studies',
  'business studies': 'Business Studies',
  commerce: 'Commerce',
  accountancy: 'Accountancy',
  'physical education': 'Physical Education',
}

function normalizeSubjectKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCaseSubject(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase()
      const smallWords = new Set(['and', 'or', 'of', 'the', 'a', 'an', 'in', 'on', 'to', 'for'])
      if (smallWords.has(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

export function getSubjectLabel(id: string): string {
  const value = String(id ?? '').trim()
  if (!value) return ''

  const directMatch = SUBJECT_CATALOGUE.find((subject) => subject.id === value)
  if (directMatch) return directMatch.label

  const normalized = normalizeSubjectKey(value)
  const aliasMatch = SUBJECT_ALIASES[normalized]
  if (aliasMatch) return aliasMatch

  const labelMatch = SUBJECT_CATALOGUE.find((subject) => {
    const candidateA = normalizeSubjectKey(subject.id)
    const candidateB = normalizeSubjectKey(subject.label)
    return candidateA === normalized || candidateB === normalized
  })

  if (labelMatch) return labelMatch.label

  return titleCaseSubject(value)
}

export function validateSubjectIds(ids: string[], board: string, grade: string | number): string[] {
  const valid = new Set(
    getSubjectsFor(board, grade)
      .flatMap((group) => group.subjects)
      .map((subject) => subject.id),
  )

  return ids.filter((id) => valid.has(id))
}
