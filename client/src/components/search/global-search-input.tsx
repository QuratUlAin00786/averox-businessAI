import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Building,
  UserIcon,
  Target,
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchResult {
  id: number;
  title: string;
  description?: string;
  type: 'account' | 'contact' | 'lead' | 'opportunity' | 'task' | 'event';
  url: string;
}

export function GlobalSearchInput() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  // Search API call with debouncing
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'account':
        return <Building className="h-4 w-4" />;
      case 'contact':
        return <UserIcon className="h-4 w-4" />;
      case 'lead':
        return <Users className="h-4 w-4" />;
      case 'opportunity':
        return <Target className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'account':
        return 'bg-blue-100 text-blue-800';
      case 'contact':
        return 'bg-green-100 text-green-800';
      case 'lead':
        return 'bg-purple-100 text-purple-800';
      case 'opportunity':
        return 'bg-orange-100 text-orange-800';
      case 'task':
        return 'bg-yellow-100 text-yellow-800';
      case 'event':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelect = (result: SearchResult) => {
    setLocation(result.url);
    setIsOpen(false);
    setSearchQuery("");
    searchRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery("");
      searchRef.current?.blur();
    }
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="flex items-center w-full max-w-2xl px-2 ml-4 md:ml-0">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-neutral-400" />
            </div>
            <Input 
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(e.target.value.length >= 2);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.length >= 2 && setIsOpen(true)}
              className="block w-full py-2 pl-10 pr-20 text-sm placeholder-neutral-400 bg-neutral-50 border-neutral-200"
              placeholder="Search accounts, contacts, leads..." 
              type="search"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center px-2 font-sans text-xs text-neutral-400 bg-white border border-neutral-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
              )}
              {!isLoading && searchResults.length > 0 && (
                <CommandGroup heading="Search Results">
                  {searchResults.slice(0, 8).map((result: SearchResult) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          <Badge variant="secondary" className={`text-xs ${getTypeColor(result.type)}`}>
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}