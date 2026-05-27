import React from 'react'
import { Stack, Title, Text, Paper, Group } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextInput, Button } from '../../../ui/primitives'
import { PENDO_IDS } from '../../../pendo/PENDO_IDS'

const CareerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  githubUrl: z
    .string()
    .min(1, 'GitHub URL is required')
    .url('Enter a valid URL')
    .refine((val) => val.includes('github.com'), 'Must be a GitHub URL'),
})

type CareerFormValues = z.infer<typeof CareerSchema>

export function CareerPage(): React.JSX.Element {
  const form = useForm<CareerFormValues>({
    resolver: zodResolver(CareerSchema),
    mode: 'onSubmit',
    defaultValues: { name: '', email: '', githubUrl: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    pendo.track('career_application_submitted', {
      nameLength: values.name.length,
      emailDomain: values.email.split('@')[1] ?? '',
      githubUrlLength: values.githubUrl.length,
    })

    notifications.show({
      title: 'Application submitted!',
      message: "Thanks for applying. We'll be in touch soon.",
      color: 'green',
      icon: <IconCheck size={16} />,
      autoClose: 4000,
    })

    form.reset()
  })

  return (
    <Stack gap="xl" data-pendo-id={PENDO_IDS.career.container}>
      <Stack gap={4}>
        <Title order={2}>Careers</Title>
        <Text c="dimmed" size="sm">
          Interested in joining the team? Fill out the form below and we'll reach out.
        </Text>
      </Stack>

      <Paper withBorder p="xl" radius="md" maw={560}>
        <form onSubmit={onSubmit} noValidate>
          <Stack gap="md">
            <TextInput
              {...form.register('name')}
              label="Full name"
              placeholder="Jane Smith"
              error={form.formState.errors.name?.message}
              pendoId={PENDO_IDS.career.form.name}
            />
            <TextInput
              {...form.register('email')}
              label="Email"
              placeholder="jane@example.com"
              type="email"
              error={form.formState.errors.email?.message}
              pendoId={PENDO_IDS.career.form.email}
            />
            <TextInput
              {...form.register('githubUrl')}
              label="GitHub profile URL"
              placeholder="https://github.com/janedoe"
              error={form.formState.errors.githubUrl?.message}
              pendoId={PENDO_IDS.career.form.githubUrl}
            />
            <Group justify="flex-end" mt="xs">
              <Button type="submit" pendoId={PENDO_IDS.career.form.submit}>
                Submit application
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
