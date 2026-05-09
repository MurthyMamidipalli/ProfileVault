'use server';
/**
 * @fileOverview A Genkit flow for generating a professional summary or bio based on user's education and experience details.
 *
 * - generateProfessionalSummary - A function that handles the professional summary generation process.
 * - GenerateProfessionalSummaryInput - The input type for the generateProfessionalSummary function.
 * - GenerateProfessionalSummaryOutput - The return type for the generateProfessionalSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EducationEntrySchema = z.object({
  institution: z.string().describe('The name of the educational institution.'),
  degree: z.string().describe('The degree or qualification obtained.'),
  fieldOfStudy: z.string().optional().describe('The field of study or major.'),
  startDate: z.string().describe('The start date of education (e.g., "YYYY-MM-DD").'),
  endDate: z.string().optional().describe('The end date of education (e.g., "YYYY-MM-DD" or "Present").'),
  description: z.string().optional().describe('A brief description of achievements or coursework.'),
});

const ExperienceEntrySchema = z.object({
  company: z.string().describe('The name of the company.'),
  title: z.string().describe('The job title.'),
  location: z.string().optional().describe('The location of the job.'),
  startDate: z.string().describe('The start date of employment (e.g., "YYYY-MM-DD").'),
  endDate: z.string().optional().describe('The end date of employment (e.g., "YYYY-MM-DD" or "Present").'),
  description: z.string().optional().describe('A brief description of responsibilities and achievements.'),
});

const GenerateProfessionalSummaryInputSchema = z.object({
  education: z.array(EducationEntrySchema).describe('A list of education entries for the user.').default([]),
  experience: z.array(ExperienceEntrySchema).describe('A list of professional experience entries for the user.').default([]),
});
export type GenerateProfessionalSummaryInput = z.infer<typeof GenerateProfessionalSummaryInputSchema>;

const GenerateProfessionalSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise and impactful professional summary or bio.'),
});
export type GenerateProfessionalSummaryOutput = z.infer<typeof GenerateProfessionalSummaryOutputSchema>;

export async function generateProfessionalSummary(input: GenerateProfessionalSummaryInput): Promise<GenerateProfessionalSummaryOutput> {
  return generateProfessionalSummaryFlow(input);
}

const professionalSummaryPrompt = ai.definePrompt({
  name: 'professionalSummaryPrompt',
  input: { schema: GenerateProfessionalSummaryInputSchema },
  output: { schema: GenerateProfessionalSummaryOutputSchema },
  prompt: `You are an AI assistant tasked with generating a concise and impactful professional summary or bio based on a user's education and experience details.
Focus on highlighting key skills, achievements, and career goals.
The summary should be engaging, professional, and ideally 3-5 sentences long. Ensure the output is only the summary text.

---START OF USER DATA---

Education:
{{#if education.length}}
{{#each education}}
- Institution: {{this.institution}}
- Degree: {{this.degree}}{{#if this.fieldOfStudy}} in {{this.fieldOfStudy}}{{/if}}
- Dates: {{this.startDate}} - {{this.endDate}}
{{#if this.description}}
- Description: {{this.description}}
{{/if}}

{{/each}}
{{else}}
No education details provided.
{{/if}}

Experience:
{{#if experience.length}}
{{#each experience}}
- Company: {{this.company}}
- Title: {{this.title}}
- Dates: {{this.startDate}} - {{this.endDate}}
{{#if this.description}}
- Description: {{this.description}}
{{/if}}

{{/each}}
{{else}}
No experience details provided.
{{/if}}

---END OF USER DATA---

Generate a professional summary based on the provided information, outputting only the summary text.`,
});

const generateProfessionalSummaryFlow = ai.defineFlow(
  {
    name: 'generateProfessionalSummaryFlow',
    inputSchema: GenerateProfessionalSummaryInputSchema,
    outputSchema: GenerateProfessionalSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await professionalSummaryPrompt(input);
    return output!;
  }
);
