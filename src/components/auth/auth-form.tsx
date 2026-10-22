"use client"

// Shared shell and field for the auth screens: Card, label above, 16px input,
// field errors under, error text uses destructive on the card surface
// (design.md).

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}

export function AuthField({
  label,
  name,
  type = "email",
  error,
  autoComplete,
  required = true,
}: {
  label: string
  name: string
  type?: string
  error?: string[]
  autoComplete?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={error?.length ? `${name}-error` : undefined}
      />
      {error?.length ? (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {error.join(" ")}
        </p>
      ) : null}
    </div>
  )
}

export function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-destructive text-sm">
      {message}
    </p>
  )
}

export function SubmitButton({
  children,
  pendingText,
}: {
  children: React.ReactNode
  pendingText: string
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingText : children}
    </Button>
  )
}
