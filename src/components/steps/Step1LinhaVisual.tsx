import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { FormSchema } from '@/lib/validations';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormItemLayout } from '@/components/common/FormItemLayout';

interface Step1Props {
  form: UseFormReturn<FormSchema>;
}

export const Step1LinhaVisual: React.FC<Step1Props> = ({ form }) => {
  const { setValue, watch, formState: { errors } } = form;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">Identidade Visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormItemLayout
            label="Background das Artes"
            error={(errors.linha_visual as any)?.background?.message}
          >
            <FileUpload
              dimensions="2560x2560px"
              defaultValue={watch("linha_visual.background")}
              onUploadComplete={(url) => setValue("linha_visual.background", url, { shouldValidate: true })}
            />
          </FormItemLayout>
          
          <FormItemLayout
            label="Logo do Evento 01"
            error={(errors.linha_visual as any)?.logo_01_evento?.message}
          >
            <FileUpload
              dimensions="2472x810px"
              defaultValue={watch("linha_visual.logo_01_evento")}
              onUploadComplete={(url) => setValue("linha_visual.logo_01_evento", url, { shouldValidate: true })}
            />
          </FormItemLayout>

          <FormItemLayout
            label="Logo do Evento 02"
            error={(errors.linha_visual as any)?.logo_02_evento?.message}
          >
            <FileUpload
              dimensions="1435x1045px"
              defaultValue={watch("linha_visual.logo_02_evento")}
              onUploadComplete={(url) => setValue("linha_visual.logo_02_evento", url, { shouldValidate: true })}
            />
          </FormItemLayout>
        </CardContent>
      </Card>
    </div>
  );
};
