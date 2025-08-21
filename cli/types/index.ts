/**
 * Type definitions for CLI command inquirer prompts
 */

// Reading command types
export interface BasicReadingInfo {
  title: string;
  author: string;
}

export interface FinishedPrompt {
  finished: boolean;
}

export interface DateInputPrompt {
  dateInput: string;
}

export interface ImageChoicePrompt {
  imageChoice: 'url' | 'local' | 'skip';
}

export interface ImageUrlPrompt {
  imageUrl: string;
}

export interface ImageFilePrompt {
  imagePath: string;
}

export interface ThoughtsPrompt {
  addThoughts: boolean;
}

export interface AudiobookPrompt {
  audiobook: boolean;
}

export interface ContinueWithoutImagePrompt {
  continueWithoutImage: boolean;
}

export interface ReadingActionPrompt {
  action: 'reread' | 'update' | 'cancel';
}

export interface ConfirmPrompt {
  confirmed: boolean;
}

export interface ConfirmDeletePrompt {
  confirmDelete: boolean;
}

// Project command types
export interface BasicProjectInfo {
  title: string;
  description: string;
}

export interface ProjectTechStackInput {
  techStackInput: string;
}

export interface ProjectHasSiteUrl {
  hasSiteUrl: boolean;
}

export interface ProjectHasCodeUrl {
  hasCodeUrl: boolean;
}

export interface ProjectUrlPrompt {
  url: string;
}

export interface ProjectImageChoice {
  imageChoice: 'existing' | 'skip';
}

export interface ProjectImageName {
  imageName: string;
}

export interface ProjectConfirm {
  confirm: boolean;
}

export interface ProjectOverwrite {
  overwrite: boolean;
}

export interface ProjectStatusPrompt {
  status: 'active' | 'completed' | 'archived';
}

export interface ProjectTechPrompt {
  technologies: string;
}

export interface ProjectImagePrompt {
  imageUrl: string;
}

// Place command types
export interface BasicPlaceInfo {
  name: string;
  country: string;
}

export interface PlaceTypePrompt {
  type: 'visited' | 'lived' | 'born';
}

export interface PlaceCoordinatesPrompt {
  lat: number;
  lng: number;
}

export interface PlaceHasNote {
  hasNote: boolean;
}

export interface PlaceNoteInput {
  noteInput: string;
}

export interface PlaceConfirm {
  confirm: boolean;
}

export interface PlaceOverwrite {
  overwrite: boolean;
}

export interface PlaceYearPrompt {
  year: string;
}

export interface PlaceDescriptionPrompt {
  description: string;
}

// Quote command types
export interface QuoteTextPrompt {
  text: string;
}

export interface QuoteAuthorPrompt {
  author: string;
}

// Common types
export interface ListChoice<T> {
  choice: T;
}

export interface ReadingFrontmatter {
  title: string;
  author: string;
  finished?: string | null;
  coverImage?: string;
  audiobook?: boolean;
}

export interface ProjectFrontmatter {
  title: string;
  description: string;
  techStack: string[];
  siteUrl?: string;
  codeUrl?: string;
  imageSrc: string;
  altText: string;
  order: number;
}

export interface PlaceFrontmatter {
  name: string;
  country: string;
  type: 'visited' | 'lived' | 'born';
  coordinates: [number, number];
  year?: number;
  description?: string;
}
