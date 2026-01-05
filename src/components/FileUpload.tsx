import React, { useCallback, useState } from 'react';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label?: string;
  required?: boolean;
  defaultValue?: string;
  dimensions?: string;
  accept?: string;
  maxSize?: number; // em MB
  onUploadComplete: (url: string) => void;
  error?: string;
  name?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = '',
  defaultValue = '',
  dimensions,
  accept = 'image/png, image/jpeg, image/svg+xml',
  maxSize = 10,
  onUploadComplete,
  error,
  name
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(defaultValue);

  // Sincronizar preview se defaultValue mudar externamente (ex: navegação)
  React.useEffect(() => {
    if (defaultValue) {
      setPreview(defaultValue);
    }
  }, [defaultValue]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      alert(`O arquivo deve ter no máximo ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-uploads')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erro ao fazer upload do arquivo.');
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, onUploadComplete]);

  const removeFile = () => {
    setPreview('');
    onUploadComplete('');
  };

  return (
    <div className="space-y-2" data-name={name}>
      {label && <Label className={cn(error && "text-destructive")}>{label}</Label>}
      <div 
        className={cn(
          "relative group border-2 border-dashed rounded-lg transition-all duration-200",
          preview ? "border-primary/50 bg-background/50" : "border-muted-foreground/20 hover:border-primary/50 bg-background/50",
          error && "border-destructive/50 bg-destructive/5"
        )}
      >
        {preview ? (
          <div className="p-4 flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-[0.4rem] border overflow-hidden flex items-center justify-center bg-[#a3a3a3]">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium truncate">Arquivo pronto</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Upload concluído com sucesso</p>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={removeFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 py-10 cursor-pointer">
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              {isUploading ? <Loader2 className="h-6 w-6 text-primary animate-spin" /> : <Upload className="h-6 w-6 text-primary" />}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Clique para fazer upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG S/ Fundo</p>
            </div>
            {dimensions && (
              <div className="mt-1 flex justify-center">
                <span className="text-[9px] font-medium uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Dimensão ideal: {dimensions}
                </span>
              </div>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
};
