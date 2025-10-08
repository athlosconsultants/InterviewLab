/**
 * Industry and role mapping utility (T87)
 * Maps job titles and industries to structured interview kits.
 */

import { industryKits } from './industry_kits';

// Type definitions for industry kit structure
export interface IndustryKit {
  styles: string[];
  competencies: string[];
  tone: string;
  stages: string[];
  question_examples: string[];
}

export interface IndustryMatch {
  industry: string;
  subIndustry: string;
  kit: IndustryKit;
  confidence: 'high' | 'medium' | 'low';
}

// Role keyword mappings for fuzzy matching
const ROLE_KEYWORDS: Record<string, { industry: string; subIndustry: string }> =
  {
    // Technology
    'software engineer': { industry: 'Technology', subIndustry: 'Software' },
    'software developer': { industry: 'Technology', subIndustry: 'Software' },
    developer: { industry: 'Technology', subIndustry: 'Software' },
    programmer: { industry: 'Technology', subIndustry: 'Software' },
    'full stack': { industry: 'Technology', subIndustry: 'Software' },
    'front end': { industry: 'Technology', subIndustry: 'Software' },
    'back end': { industry: 'Technology', subIndustry: 'Software' },
    'data scientist': { industry: 'Technology', subIndustry: 'Data Science' },
    'data engineer': { industry: 'Technology', subIndustry: 'Data Science' },
    'machine learning': { industry: 'Technology', subIndustry: 'Data Science' },
    'ai engineer': { industry: 'Technology', subIndustry: 'Data Science' },
    'product manager': {
      industry: 'Technology',
      subIndustry: 'Product Management',
    },
    'it support': {
      industry: 'Technology',
      subIndustry: 'IT & Infrastructure',
    },
    'network engineer': {
      industry: 'Technology',
      subIndustry: 'IT & Infrastructure',
    },
    'system administrator': {
      industry: 'Technology',
      subIndustry: 'IT & Infrastructure',
    },
    devops: { industry: 'Technology', subIndustry: 'IT & Infrastructure' },

    // Finance
    'investment banker': {
      industry: 'Finance',
      subIndustry: 'Investment Banking',
    },
    banker: { industry: 'Finance', subIndustry: 'Retail Banking' },
    'financial analyst': {
      industry: 'Finance',
      subIndustry: 'Investment Banking',
    },
    accountant: { industry: 'Finance', subIndustry: 'Accounting' },
    auditor: { industry: 'Finance', subIndustry: 'Accounting' },

    // Consulting
    consultant: { industry: 'Consulting', subIndustry: 'Management' },
    'strategy consultant': {
      industry: 'Consulting',
      subIndustry: 'Management',
    },

    // Healthcare
    nurse: { industry: 'Healthcare', subIndustry: 'Nursing' },
    doctor: { industry: 'Healthcare', subIndustry: 'Medical' },
    physician: { industry: 'Healthcare', subIndustry: 'Medical' },
    'medical assistant': {
      industry: 'Healthcare',
      subIndustry: 'Allied Health',
    },

    // Education
    teacher: { industry: 'Education', subIndustry: 'K-12 Teaching' },
    professor: { industry: 'Education', subIndustry: 'Higher Education' },
    'teaching assistant': {
      industry: 'Education',
      subIndustry: 'K-12 Teaching',
    },

    // Hospitality
    bartender: { industry: 'Hospitality', subIndustry: 'Food & Beverage' },
    waiter: { industry: 'Hospitality', subIndustry: 'Food & Beverage' },
    server: { industry: 'Hospitality', subIndustry: 'Food & Beverage' },
    chef: { industry: 'Hospitality', subIndustry: 'Food & Beverage' },
    'hotel manager': {
      industry: 'Hospitality',
      subIndustry: 'Hotel Management',
    },

    // Retail
    'sales associate': { industry: 'Retail', subIndustry: 'Sales Floor' },
    'retail manager': { industry: 'Retail', subIndustry: 'Management' },
    cashier: { industry: 'Retail', subIndustry: 'Sales Floor' },

    // Construction & Engineering
    'project manager': {
      industry: 'Consulting',
      subIndustry: 'Construction Project Consulting',
    },
    'construction manager': {
      industry: 'Consulting',
      subIndustry: 'Construction Project Consulting',
    },
    'site manager': {
      industry: 'Consulting',
      subIndustry: 'Construction Project Consulting',
    },
    'assistant project manager': {
      industry: 'Consulting',
      subIndustry: 'Construction Project Consulting',
    },
    engineer: { industry: 'Engineering', subIndustry: 'Civil' },
    'civil engineer': { industry: 'Engineering', subIndustry: 'Civil' },
    'mechanical engineer': {
      industry: 'Engineering',
      subIndustry: 'Mechanical',
    },
    electrician: { industry: 'Engineering', subIndustry: 'Civil' },
    plumber: { industry: 'Engineering', subIndustry: 'Civil' },
    carpenter: { industry: 'Engineering', subIndustry: 'Civil' },

    // Marketing
    'marketing manager': {
      industry: 'Marketing & Sales',
      subIndustry: 'Digital Marketing',
    },
    'content writer': {
      industry: 'Marketing & Sales',
      subIndustry: 'Digital Marketing',
    },
    'social media': {
      industry: 'Marketing & Sales',
      subIndustry: 'Digital Marketing',
    },
    'sales representative': {
      industry: 'Marketing & Sales',
      subIndustry: 'Sales',
    },
    'account executive': {
      industry: 'Marketing & Sales',
      subIndustry: 'Sales',
    },
  };

/**
 * Maps a job title and industry string to the most appropriate industry kit.
 * Uses fuzzy matching based on keywords.
 */
export function mapRoleToIndustryKit(
  jobTitle: string,
  industryHint?: string
): IndustryMatch | null {
  const normalizedTitle = jobTitle.toLowerCase();
  const normalizedIndustry = industryHint?.toLowerCase() || '';

  // Try exact keyword match first
  for (const [keyword, mapping] of Object.entries(ROLE_KEYWORDS)) {
    if (normalizedTitle.includes(keyword)) {
      const kit = getIndustryKit(mapping.industry, mapping.subIndustry);
      if (kit) {
        return {
          industry: mapping.industry,
          subIndustry: mapping.subIndustry,
          kit,
          confidence: 'high',
        };
      }
    }
  }

  // Try industry hint matching with additional fuzzy logic
  if (normalizedIndustry) {
    // T92: Special handling for construction/manufacturing/infrastructure
    if (
      normalizedIndustry.includes('construction') ||
      normalizedIndustry.includes('infrastructure') ||
      normalizedIndustry.includes('civil') ||
      normalizedIndustry.includes('signage') ||
      normalizedIndustry.includes('manufacturing')
    ) {
      const kit = getIndustryKit(
        'Consulting',
        'Construction Project Consulting'
      );
      if (kit) {
        return {
          industry: 'Consulting',
          subIndustry: 'Construction Project Consulting',
          kit,
          confidence: 'high',
        };
      }
    }

    for (const [industry, subIndustries] of Object.entries(industryKits)) {
      if (normalizedIndustry.includes(industry.toLowerCase())) {
        // Pick first sub-industry as fallback
        const firstSubIndustry = Object.keys(subIndustries)[0];
        const kit = getIndustryKit(industry, firstSubIndustry);
        if (kit) {
          return {
            industry,
            subIndustry: firstSubIndustry,
            kit,
            confidence: 'medium',
          };
        }
      }
    }
  }

  // Fallback to generic software/business kit
  const fallbackKit = getIndustryKit('Technology', 'Software');
  if (fallbackKit) {
    return {
      industry: 'Technology',
      subIndustry: 'Software',
      kit: fallbackKit,
      confidence: 'low',
    };
  }

  return null;
}

/**
 * Retrieves an industry kit from the nested structure.
 */
function getIndustryKit(
  industry: string,
  subIndustry: string
): IndustryKit | null {
  const industryData = industryKits[industry as keyof typeof industryKits];
  if (!industryData) return null;

  const kit = industryData[subIndustry as keyof typeof industryData];
  if (!kit) return null;

  return kit as IndustryKit;
}

/**
 * Gets all available industries and sub-industries.
 */
export function getAvailableIndustries(): Array<{
  industry: string;
  subIndustries: string[];
}> {
  return Object.entries(industryKits).map(([industry, subIndustries]) => ({
    industry,
    subIndustries: Object.keys(subIndustries),
  }));
}
