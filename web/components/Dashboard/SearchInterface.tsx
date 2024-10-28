import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/aceternity/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { debounce } from 'lodash';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import { ModeToggle } from '../theme/mode-toggle';

// Constants
const DEBOUNCE_DELAY = 500;
const THROTTLE_INTERVAL = 5000;

// Types
interface SearchResult {
  id: number;
  title: string;
  imageUrl: string;
}

type Filter = 'Nature' | 'Architecture' | 'People';

interface SearchParams {
  term: string;
  filters: Filter[];
}

interface ApiResponse {
  results: SearchResult[];
  total: number;
}

// Mock API function
const mockApiCall = (params: SearchParams): Promise<ApiResponse> => {
  return new Promise((resolve) => {
    const allResults: SearchResult[] = [
      { id: 1, title: 'Mountain Landscape', imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' },
      { id: 2, title: 'Urban Scene', imageUrl: 'https://images.unsplash.com/photo-1541559269-5d82f43f6b30' },
      { id: 3, title: 'Ocean View', imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' },
      { id: 4, title: 'Forest Path', imageUrl: 'https://images.unsplash.com/photo-1517206760775-5142dcfc7d55' },
      { id: 5, title: 'Desert Sunset', imageUrl: 'https://images.unsplash.com/photo-1475921723250-b34054f34a1e' },
      { id: 6, title: 'City Lights', imageUrl: 'https://images.unsplash.com/photo-1491959539488-b4a1f68d55d5' },
      { id: 7, title: 'Autumn Colors', imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0' },
      { id: 8, title: 'Spring Blooms', imageUrl: 'https://images.unsplash.com/photo-1527741860835-1a4f1f9e02bc' },
    ];

    // Filter results based on search term and active filters
    const filteredResults = allResults.filter(result => {
      const matchesTerm = params.term.trim() === '' || result.title.toLowerCase().includes(params.term.toLowerCase());
      const matchesFilter = params.filters.length === 0 || params.filters.some(filter => result.title.includes(filter));
      return matchesTerm && matchesFilter;
    });

    // Resolve with the filtered results
    resolve({ results: filteredResults, total: filteredResults.length });
  });
};

// Component
const SearchInterface: React.FC = () => {
  // State with types
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters] = useState<Filter[]>(['Nature', 'Architecture', 'People']);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Reference for the input field
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all results initially
  useEffect(() => {
    const fetchAllResults = async () => {
      const response: ApiResponse = await mockApiCall({ term: '', filters: [] });
      setResults(response.results);
    };

    fetchAllResults();
  }, []);

  // API call with type safety
  const fetchSearchResults = async (params: SearchParams): Promise<void> => {
    try {
      console.log(`Searching for: ${params.term} with filters: ${params.filters.join(', ')}`);
      const response: ApiResponse = await mockApiCall(params);
      setResults(response.results);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Search failed:', error.message);
      }
    }
  };

  // Debounced search function with proper types
  const debouncedSearch = useCallback(
    debounce((term: string, activeFilters: Filter[]) => {
      fetchSearchResults({ term, filters: activeFilters });
    }, DEBOUNCE_DELAY),
    []
  );

  // Throttled search function with proper types
  const throttledSearch = useCallback(
    debounce((term: string, activeFilters: Filter[]) => {
      fetchSearchResults({ term, filters: activeFilters });
    }, THROTTLE_INTERVAL, { leading: true, trailing: true }),
    []
  );

  // Effect to handle search updates
  useEffect(() => {
    if (searchTerm.trim() || activeFilters.length > 0) {
      debouncedSearch(searchTerm, activeFilters);
    } else {
      fetchSearchResults({ term: '', filters: [] });
    }

    return () => {
      debouncedSearch.cancel();
      throttledSearch.cancel();
    };
  }, [searchTerm, activeFilters, debouncedSearch, throttledSearch]);

  // Filter toggle handler
  const handleFilterToggle = (filter: Filter): void => {
    setActiveFilters(prev => {
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter];

      throttledSearch(searchTerm, newFilters);
      return newFilters;
    });
  };

  // Event handlers with proper types
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  // Focus input on '/' key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex justify-between w-full items-center px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-2xl font-bold">Summary</h1>
          </div>
          <ModeToggle />
        </div>
      </header>
      <ScrollArea>
        <div className="w-full max-w-[1600px] mx-auto p-6 space-y-8">
          {/* Search Section */}
          <div className="flex gap-4">
            <div className="flex-1 group/input">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/input:text-primary" />
                <Input
                  ref={inputRef} // Attach ref here
                  className="pl-10 h-12 bg-shadcn-surface hover:bg-shadcn-surface-hover focus:bg-shadcn-surface-active transition-colors"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-12 text-shadcn-text"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </Button>
          </div>

          {/* Filter Tags */}
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilters.includes(filter) ? "default" : "secondary"}
                size="sm"
                onClick={() => handleFilterToggle(filter)}
                className="transition-all text-shadcn-text"
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="group space-y-3 hover:opacity-95 transition-opacity"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-xl text-primary bg-muted flex flex-col items-center justify-center">
                <Plus className="h-12 w-12" />
                <span className='text-xl'>Add video</span>
              </div>
              <h3 className="text-sm font-medium text-shadcn-text text-center">
              </h3>
            </div>
            {results.map((item) => (
              <div
                key={item.id}
                className="group space-y-3 hover:opacity-95 transition-opacity"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-sm font-medium text-shadcn-text text-center">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default SearchInterface;

