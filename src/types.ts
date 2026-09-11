export type SpectrumSection = 'hero' | 'ethereal' | 'garden' | 'wishing';

export interface PortraitItem {
  id: string;
  imageKey: string;
  title: string;
  subtitle: string;
  description: string;
  src: string;
  section: 'hero' | 'ethereal' | 'garden';
  attire: string;
  specialTrigger?: 'kinetic_jhumka' | 'pearl_scatter' | 'hair_bloom' | 'autumn_grayscale';
}

export interface BirthdayWish {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  color: string;
  constellationLetter: 'K' | 'A' | 'J' | 'A2' | 'L';
}
