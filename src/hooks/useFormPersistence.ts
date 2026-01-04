import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export function useFormPersistence(
  form: UseFormReturn<any>,
  token: string,
  onSave?: () => void
) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const STORAGE_KEY = `form_chronos_${token}`;

  // Recuperar dados
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        form.reset(parsed);
      } catch (e) {
        console.error('Erro ao recuperar auto-save:', e);
      }
    }
  }, [STORAGE_KEY, form]);

  // Auto-save a cada 30 segundos se houver mudanças
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (timerRef.current) return;

      timerRef.current = setTimeout(() => {
        setStatus('saving');
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
          setStatus('saved');
          if (onSave) onSave();
          
          // Voltar para idle após 3s
          setTimeout(() => setStatus('idle'), 3000);
        } catch (e) {
          console.error('Erro no auto-save:', e);
          setStatus('error');
        } finally {
          timerRef.current = null;
        }
      }, 30000); // 30 segundos
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [STORAGE_KEY, form, onSave]);

  // Aviso ao sair
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  return { status };
}
