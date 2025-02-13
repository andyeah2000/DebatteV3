'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation } from '@apollo/client'
import { GET_ARGUMENT_TEMPLATES, GET_TEMPLATE_EXAMPLES } from '@/graphql/queries'
import { CREATE_COMMENT } from '@/graphql/mutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { Icons } from '@/components/ui/icons'

const argumentSchema = z.object({
  templateId: z.string().uuid().optional(),
  isProArgument: z.boolean(),
  sections: z.array(
    z.object({
      type: z.string(),
      content: z.string().min(10).max(5000)
    })
  ),
  sources: z.array(z.string().url()).optional()
})

type ArgumentInput = z.infer<typeof argumentSchema>

interface StructuredArgumentFormProps {
  debateId: string
  onSuccess?: () => void
  defaultIsProArgument?: boolean
}

export function StructuredArgumentForm({
  debateId,
  onSuccess,
  defaultIsProArgument = true
}: StructuredArgumentFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  const { data: templatesData, loading: loadingTemplates } = useQuery(GET_ARGUMENT_TEMPLATES)
  const [createComment, { loading: submitting }] = useMutation(CREATE_COMMENT)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<ArgumentInput>({
    resolver: zodResolver(argumentSchema),
    defaultValues: {
      isProArgument: defaultIsProArgument,
      sections: [],
      sources: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections'
  })

  const watchTemplateId = watch('templateId')

  useEffect(() => {
    if (watchTemplateId && templatesData?.argumentTemplates) {
      const template = templatesData.argumentTemplates.find(
        (t: any) => t.id === watchTemplateId
      )
      setSelectedTemplate(template)

      // Pre-populate sections based on template
      if (template) {
        reset({
          templateId: watchTemplateId,
          isProArgument: defaultIsProArgument,
          sections: [
            ...template.requiredSections.map((type: string) => ({
              type,
              content: ''
            })),
            ...template.optionalSections.map((type: string) => ({
              type,
              content: ''
            }))
          ],
          sources: []
        })
      }
    }
  }, [watchTemplateId, templatesData, reset, defaultIsProArgument])

  const onSubmit = async (data: ArgumentInput) => {
    try {
      setValidationErrors([])
      
      const { data: result } = await createComment({
        variables: {
          input: {
            debateId,
            ...data,
            content: data.sections
              .map(s => `[${s.type}]\n${s.content}`)
              .join('\n\n')
          }
        }
      })

      if (result?.createComment) {
        reset()
        onSuccess?.()
      }
    } catch (error) {
      if (error instanceof Error) {
        setValidationErrors([error.message])
      }
    }
  }

  if (loadingTemplates) {
    return <Spinner />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
          Argument Template
        </label>
        <Select
          {...register('templateId')}
          className="mt-1"
          placeholder="Select a template..."
        >
          {templatesData?.argumentTemplates.map((template: any) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Position Selection */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
          Position
        </label>
        <div className="mt-1 flex space-x-4">
          <Button
            type="button"
            variant={watch('isProArgument') ? 'default' : 'outline'}
            onClick={() => {
              reset({ ...watch(), isProArgument: true })
            }}
          >
            Pro
          </Button>
          <Button
            type="button"
            variant={!watch('isProArgument') ? 'default' : 'outline'}
            onClick={() => {
              reset({ ...watch(), isProArgument: false })
            }}
          >
            Con
          </Button>
        </div>
      </div>

      {/* Sections */}
      <AnimatePresence>
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
                  {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                </h3>
                {!selectedTemplate?.requiredSections.includes(field.type) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {selectedTemplate && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.structure[field.type]?.guidelines.map(
                      (guideline: string, i: number) => (
                        <Tooltip key={i} content={guideline}>
                          <Badge variant="secondary">{guideline}</Badge>
                        </Tooltip>
                      )
                    )}
                  </div>
                </div>
              )}

              <Textarea
                {...register(`sections.${index}.content`)}
                className="mt-4"
                placeholder={`Enter your ${field.type}...`}
                rows={5}
              />

              {errors.sections?.[index]?.content && (
                <Alert variant="destructive" className="mt-2">
                  {errors.sections[index]?.content?.message}
                </Alert>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Optional Sections */}
      {selectedTemplate?.optionalSections.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Add Optional Section
          </label>
          <Select
            className="mt-1"
            placeholder="Select a section to add..."
            onChange={(e) => {
              if (e.target.value) {
                append({ type: e.target.value, content: '' })
                e.target.value = ''
              }
            }}
          >
            {selectedTemplate.optionalSections.map((type: string) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Sources */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
          Sources
        </label>
        <div className="mt-1 space-y-2">
          {fields.map((_, index) => (
            <Input
              key={index}
              {...register(`sources.${index}`)}
              placeholder="Enter source URL..."
              type="url"
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ url: '' })}
          >
            Add Source
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <ul className="list-inside list-disc">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner className="mr-2" /> : null}
          Submit Argument
        </Button>
      </div>
    </form>
  )
} 