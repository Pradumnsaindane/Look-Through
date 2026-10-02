import { AppError } from '../errors/AppError'

export type Validator<T> = (value: unknown) => T

export function requiredString(field: string): Validator<string> {
  return (value) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new AppError('VALIDATION_ERROR', `${field} is required.`, 400, { field })
    }
    return value.trim()
  }
}

export function optionalString(field: string): Validator<string | undefined> {
  return (value) => {
    if (value === undefined || value === null || value === '') return undefined
    return requiredString(field)(value)
  }
}

export function positiveInteger(field: string): Validator<number> {
  return (value) => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      throw new AppError('VALIDATION_ERROR', `${field} must be a positive integer.`, 400, { field })
    }
    return value
  }
}

export function assertOrganizationScope(organizationId: string, expectedOrganizationId: string): void {
  if (organizationId !== expectedOrganizationId) {
    throw new AppError('FORBIDDEN', 'The requested resource is outside the active organization.', 403)
  }
}
