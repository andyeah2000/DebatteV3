import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ArgumentTemplate } from '../entities/argument-template.entity';
import { ArgumentTemplateService } from '../services/argument-template.service';
import { CreateArgumentTemplateInput } from '../dto/create-argument-template.input';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Resolver(() => ArgumentTemplate)
export class ArgumentTemplateResolver {
  constructor(private readonly templateService: ArgumentTemplateService) {}

  @Query(() => [ArgumentTemplate])
  async argumentTemplates() {
    return this.templateService.findAll();
  }

  @Query(() => ArgumentTemplate)
  async argumentTemplate(@Args('id', { type: () => ID }) id: string) {
    return this.templateService.findOne(id);
  }

  @Query(() => [ArgumentTemplate])
  async argumentTemplatesByCategory(@Args('category') category: string) {
    return this.templateService.findByCategory(category);
  }

  @Mutation(() => ArgumentTemplate)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async createArgumentTemplate(
    @Args('input') input: CreateArgumentTemplateInput,
  ) {
    return this.templateService.create(input);
  }

  @Mutation(() => ArgumentTemplate)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async updateArgumentTemplate(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: Partial<CreateArgumentTemplateInput>,
  ) {
    return this.templateService.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async removeArgumentTemplate(@Args('id', { type: () => ID }) id: string) {
    return this.templateService.remove(id);
  }

  @Query(() => [String])
  async argumentTemplateExamples(@Args('id', { type: () => ID }) id: string) {
    return this.templateService.generateTemplateExamples(id);
  }

  @Query(() => Boolean)
  async validateArgument(
    @Args('templateId', { type: () => ID }) templateId: string,
    @Args('content') content: string,
  ) {
    const result = await this.templateService.validateArgument(templateId, content);
    return result.isValid;
  }

  @Query(() => [String])
  async suggestArgumentImprovements(
    @Args('templateId', { type: () => ID }) templateId: string,
    @Args('content') content: string,
  ) {
    return this.templateService.suggestImprovements(templateId, content);
  }
} 