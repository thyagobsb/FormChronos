import { useEffect, useState } from 'react';
import { Lightbulb, Sun, Moon, Sparkles } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'classic-dark';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'classic-dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'classic-dark');
    
    if (theme === 'classic-dark') {
      // Classic Dark is the root default, so no class needed or just set it
      root.classList.add('classic-dark');
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);


  return (
    <div className="flex items-center gap-2">
      <Select value={theme} onValueChange={(val) => setTheme(val as Theme)}>
        <SelectTrigger 
          className={cn(
            "w-[140px] h-8 text-xs gap-2 border-none bg-muted/50 hover:bg-muted transition-colors",
            "focus:ring-0 focus:ring-offset-0"
          )}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <SelectValue placeholder="Tema" />
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </div>
          </SelectItem>
          <SelectItem value="classic-dark">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Classic Dark</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
