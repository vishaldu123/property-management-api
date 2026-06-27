declare module '@hookform/resolvers/zod' {
  import { Resolver } from 'react-hook-form'
  import { ZodSchema } from 'zod'

  export function zodResolver<T extends ZodSchema>(_schema: T): Resolver<T['_output']> // eslint-disable-line @typescript-eslint/no-unused-vars
}
