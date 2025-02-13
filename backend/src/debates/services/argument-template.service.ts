import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArgumentTemplate } from '../entities/argument-template.entity';
import { CreateArgumentTemplateInput } from '../dto/create-argument-template.input';
import { AIService } from '../../ai/ai.service';

@Injectable()
export class ArgumentTemplateService {
  constructor(
    @InjectRepository(ArgumentTemplate)
    private readonly templateRepository: Repository<ArgumentTemplate>,
    private readonly aiService: AIService,
  ) {}

  async create(input: CreateArgumentTemplateInput): Promise<ArgumentTemplate> {
    const template = this.templateRepository.create(input);
    return this.templateRepository.save(template);
  }

  async findAll(): Promise<ArgumentTemplate[]> {
    return this.templateRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<ArgumentTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async findByCategory(category: string): Promise<ArgumentTemplate[]> {
    return this.templateRepository.find({
      where: { category, isActive: true },
    });
  }

  async update(id: string, input: Partial<CreateArgumentTemplateInput>): Promise<ArgumentTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, input);
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<boolean> {
    const template = await this.findOne(id);
    template.isActive = false;
    await this.templateRepository.save(template);
    return true;
  }

  async validateArgument(templateId: string, content: string): Promise<{
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  }> {
    const template = await this.findOne(templateId);
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (content.length < (template.validationRules.minLength || 0)) {
      errors.push(`Content is too short. Minimum length is ${template.validationRules.minLength} characters.`);
    }
    if (template.validationRules.maxLength && content.length > template.validationRules.maxLength) {
      errors.push(`Content is too long. Maximum length is ${template.validationRules.maxLength} characters.`);
    }

    // Required keywords validation
    if (template.validationRules.requiredKeywords) {
      const missingKeywords = template.validationRules.requiredKeywords.filter(
        keyword => !content.toLowerCase().includes(keyword.toLowerCase())
      );
      if (missingKeywords.length > 0) {
        errors.push(`Missing required keywords: ${missingKeywords.join(', ')}`);
        suggestions.push(`Consider including these keywords: ${missingKeywords.join(', ')}`);
      }
    }

    // Banned keywords validation
    if (template.validationRules.bannedKeywords) {
      const usedBannedKeywords = template.validationRules.bannedKeywords.filter(
        keyword => content.toLowerCase().includes(keyword.toLowerCase())
      );
      if (usedBannedKeywords.length > 0) {
        errors.push(`Found banned keywords: ${usedBannedKeywords.join(', ')}`);
        suggestions.push(`Remove these banned keywords: ${usedBannedKeywords.join(', ')}`);
      }
    }

    // Structure validation using AI
    const aiAnalysis = await this.aiService.assessArgumentQuality(content);
    
    if (!aiAnalysis.structure.hasThesis && template.structure.introduction.required) {
      errors.push('Missing clear thesis statement in introduction');
      suggestions.push('Start with a clear thesis statement that outlines your position');
    }

    if (!aiAnalysis.structure.hasEvidence && template.structure.evidence.required) {
      errors.push('Missing supporting evidence');
      suggestions.push('Include specific evidence, data, or examples to support your points');
    }

    if (!aiAnalysis.structure.hasLogicalFlow) {
      suggestions.push('Improve the logical flow using transition phrases');
      suggestions.push(...template.suggestedTransitions.slice(0, 3));
    }

    if (!aiAnalysis.structure.counterArgumentsAddressed && template.structure.counterArguments.required) {
      errors.push('Missing counter-arguments discussion');
      suggestions.push('Address potential counter-arguments to strengthen your position');
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: [...new Set(suggestions)], // Remove duplicates
    };
  }

  async generateTemplateExamples(templateId: string): Promise<string[]> {
    const template = await this.findOne(templateId);
    return template.examplePhrases;
  }

  async suggestImprovements(templateId: string, content: string): Promise<string[]> {
    const template = await this.findOne(templateId);
    const { suggestions } = await this.validateArgument(templateId, content);
    
    // Add template-specific improvement suggestions
    const templateSuggestions = [
      ...template.structure.introduction.guidelines,
      ...template.structure.mainPoints.guidelines,
      ...template.structure.evidence.guidelines,
      ...template.structure.counterArguments.guidelines,
      ...template.structure.conclusion.guidelines,
    ];

    return [...new Set([...suggestions, ...templateSuggestions])];
  }
} 