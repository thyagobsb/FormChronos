'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const containerVariants = cva('relative grid gap-2 py-4', {
  variants: {
    layout: {
      horizontal: 'md:grid md:grid-cols-12 md:gap-4',
      vertical: 'flex flex-col',
      'flex-row-reverse': 'flex flex-col-reverse gap-2 md:gap-6 md:flex-row-reverse md:justify-between',
    },
  },
  defaultVariants: {
    layout: 'vertical',
  },
});

const labelContainerVariants = cva('flex flex-col gap-1', {
  variants: {
    layout: {
      horizontal: 'md:col-span-4',
      vertical: '',
      'flex-row-reverse': 'flex-grow min-w-0',
    },
  },
  defaultVariants: {
    layout: 'vertical',
  },
});

const dataContainerVariants = cva('', {
  variants: {
    layout: {
      horizontal: 'md:col-span-8',
      vertical: '',
      'flex-row-reverse': 'flex flex-col justify-center items-start md:items-end shrink-0 md:w-1/2 xl:w-2/5 md:min-w-[400px]',
    },
  },
  defaultVariants: {
    layout: 'vertical',
  },
});

const descriptionVariants = cva('text-sm text-muted-foreground', {
  variants: {
    layout: {
      horizontal: 'mt-1',
      vertical: 'mt-1',
      'flex-row-reverse': '',
    },
  },
  defaultVariants: {
    layout: 'vertical',
  },
});

interface FormItemLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  label?: string | React.ReactNode;
  description?: string | React.ReactNode;
  labelOptional?: string | React.ReactNode;
  name?: string;
  error?: string;
}

export const FormItemLayout = React.forwardRef<HTMLDivElement, FormItemLayoutProps>(
  (
    {
      layout = 'vertical',
      label,
      description,
      labelOptional,
      name,
      error,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const hasLabel = Boolean(label);

    const renderDescription = description && (
      <p className={cn(descriptionVariants({ layout }))}>
        {description}
      </p>
    );

    const LabelContent = () => (
      <>
        <span>{label}</span>
        {labelOptional && (
          <span className="text-sm text-muted-foreground ml-1">
            {labelOptional}
          </span>
        )}
      </>
    );

    if (layout === 'flex-row-reverse') {
      return (
        <div ref={ref} {...props} className={cn(containerVariants({ layout }), className, error && "text-destructive")}>
          <div className={cn(dataContainerVariants({ layout }))}>
            {children}
            {error && <p className="text-xs mt-1 font-medium">{error}</p>}
          </div>
          <div className={cn(labelContainerVariants({ layout }))}>
            {hasLabel && (
              <Label className={cn("text-muted-foreground flex gap-2 items-center", error && "text-destructive")} htmlFor={name}>
                <LabelContent />
              </Label>
            )}
            {renderDescription}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} {...props} className={cn(containerVariants({ layout }), className)}>
        {(hasLabel || labelOptional) && (
          <div className={cn(labelContainerVariants({ layout }))}>
            {hasLabel && (
              <Label className={cn("text-muted-foreground flex gap-2 items-center", error && "text-destructive")} htmlFor={name}>
                <LabelContent />
              </Label>
            )}
            {labelOptional && !hasLabel && (
              <span className="text-sm text-muted-foreground">{labelOptional}</span>
            )}
          </div>
        )}
        <div className={cn(dataContainerVariants({ layout }))}>
          {children}
          {error && <p className="text-xs mt-1 font-medium text-destructive">{error}</p>}
          {renderDescription}
        </div>
      </div>
    );
  }
);

FormItemLayout.displayName = 'FormItemLayout';
