# Frontend Guidelines

## Overview

This document outlines the frontend-specific coding standards and best practices for React components, hooks, and client-side development. These guidelines complement the general coding guidelines and focus on frontend-specific patterns and optimizations.

## Component Organization

### Single Responsibility Principle
- **One Purpose**: Each component should have one clear purpose
- **Composition over Inheritance**: Use component composition instead of complex inheritance
- **Props Interface**: Define clear prop interfaces for all components
- **Default Props**: Use default parameters instead of defaultProps for better TypeScript support

### Component Refactoring Patterns
- **Folder Structure**: Break down large components into focused sub-components within dedicated folders
- **Main Orchestrator**: Use an `index.tsx` file to orchestrate all sub-components
- **Consistent Naming**: Use descriptive names that clearly indicate the component's purpose
- **Shared Logic**: Extract shared logic into custom hooks or utility functions
- **Client Components**: Mark components with `'use client'` directive when using React hooks

```typescript
// ✅ Good - Refactored component structure
// /src/app/_components/agents/domain-expert-dashboard/
// ├── index.tsx                 (Main orchestrator)
// ├── WelcomeSection.tsx        (Welcome message and stats)
// ├── StatsCards.tsx           (Statistics display)
// ├── SearchAndActions.tsx     (Search functionality)
// ├── AgentsGrid.tsx           (Agents listing)
// └── RecentConversations.tsx       (Recent conversations display)

// Main orchestrator component
export function DomainExpertDashboard({
    assignedAgents,
    recentConversations,
    user,
}: DomainExpertDashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Shared logic and state management
    const filteredAgents = useMemo(() => {
        return assignedAgents.filter(agent =>
            agent.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [assignedAgents, searchTerm]);

    return (
        <div className="space-y-6">
            <WelcomeSection
                activeConversationsCount={activeConversations.length}
                assignedAgentsCount={assignedAgents.length}
                user={user}
            />
            <StatsCards
                activeConversationsCount={activeConversations.length}
                assignedAgentsCount={assignedAgents.length}
                completedConversationsCount={completedConversations.length}
                totalConversationsCount={conversationsWithAgentInfos.length}
            />
            <SearchAndActions
                onSearchChange={setSearchTerm}
                searchTerm={searchTerm}
            />
            <AgentsGrid
                assignedAgents={assignedAgents}
                filteredAgents={filteredAgents}
                conversationsWithAgentInfos={conversationsWithAgentInfos}
            />
            <RecentConversations conversationsWithAgentInfos={conversationsWithAgentInfos} />
        </div>
    );
}

// ✅ Good - Focused sub-component
interface WelcomeSectionProps {
    activeConversationsCount: number;
    assignedAgentsCount: number;
    user: UserProfile;
}

export function WelcomeSection({
    activeConversationsCount,
    assignedAgentsCount,
    user,
}: WelcomeSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome back, {user.name ?? user.email}!</CardTitle>
                <CardDescription>
                    You have access to {assignedAgentsCount} agent
                    {assignedAgentsCount === 1 ? '' : 's'}
                    {activeConversationsCount > 0 &&
                        ` and ${activeConversationsCount} active conversation${activeConversationsCount === 1 ? '' : 's'}`}
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
```

### Component Decomposition Guidelines
- **Logical Separation**: Break components based on logical UI sections (header, content, footer)
- **Reusability**: Extract components that could be reused in other contexts
- **Complexity Threshold**: Refactor when components exceed 200-300 lines
- **State Management**: Keep state management in the main orchestrator component
- **Props Drilling**: Avoid deep props drilling by using context or state lifting

```typescript
// ✅ Good - Component decomposition example
// Original large component broken into focused pieces:

// HeaderSection.tsx - Navigation and actions
export function HeaderSection({ agent }: HeaderSectionProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    const handleDuplicate = () => {
        startTransition(async () => {
            const data = await createAgentMutation.mutateAsync({
                name: agent.name,
                description: agent.description ?? undefined,
                systemContext: agent.systemContext,
            });
            setTimeout(() => {
                router.push(`/agents/${data.id}`);
            }, 1500);
        });
    };

    return (
        <div className="flex items-center justify-between">
            <Link href="/agents" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Agents
            </Link>
            <div className="flex gap-2">
                <Link href={`/agents/${agent.id}/edit`}>
                    <Button variant="outline">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
                <Button variant="outline" onClick={handleDuplicate} disabled={isPending}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                </Button>
            </div>
        </div>
    );
}

// AgentOverview.tsx - Statistics and basic info
export function AgentOverview({ agent }: AgentOverviewProps) {
    const isArchived = agent.status === AgentStatus.ARCHIVED;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-2xl">{agent.name}</CardTitle>
                            <Badge variant={isArchived ? 'secondary' : 'default'}>
                                {isArchived ? 'Archived' : 'Active'}
                            </Badge>
                        </div>
                        {agent.description && (
                            <CardDescription className="max-w-2xl text-base">
                                {agent.description}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<Users className="h-5 w-5 text-blue-600" />}
                        label="Assignments"
                        value={agent.assignmentsCount}
                        bgColor="bg-blue-100"
                    />
                    {/* More stat cards... */}
                </div>
            </CardContent>
        </Card>
    );
}
```

```typescript
// ✅ Good - Clear component with defined props
interface AgentCardProps {
    agent: AIAgent;
    onSelect?: (agent: AIAgent) => void;
    isSelected?: boolean;
    className?: string;
}

export function AgentCard({ 
    agent, 
    onSelect, 
    isSelected = false, 
    className 
}: AgentCardProps) {
    return (
        <div className={cn("agent-card", { selected: isSelected }, className)}>
            <h3>{agent.name}</h3>
            <p>{agent.description}</p>
            {onSelect && (
                <button onClick={() => onSelect(agent)}>
                    Select Agent
                </button>
            )}
        </div>
    );
}

// ❌ Avoid - Unclear props and responsibilities
export function AgentCard(props: any) {
    return <div>{props.children}</div>;
}
```

### Component Structure
- **Export Order**: Export components at the bottom of the file
- **Type Definitions**: Define interfaces before component implementation
- **Helper Functions**: Keep helper functions outside the component when possible
- **Conditional Rendering**: Use early returns for conditional rendering

```typescript
// ✅ Good - Well-structured component
interface UserProfileProps {
    user: User;
    onEdit?: () => void;
    showActions?: boolean;
}

function formatUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
}

export function UserProfile({ user, onEdit, showActions = true }: UserProfileProps) {
    if (!user) return null;
    
    const displayName = formatUserDisplayName(user);
    
    return (
        <div className="user-profile">
            <h2>{displayName}</h2>
            <p>{user.email}</p>
            {showActions && onEdit && (
                <button onClick={onEdit}>Edit Profile</button>
            )}
        </div>
    );
}
```

## React Hooks Guidelines

### Custom Hooks
- **Single Purpose**: Each custom hook should have one clear responsibility
- **Hook Naming**: Custom hooks should start with 'use'
- **Hook Composition**: Compose multiple simple hooks instead of one complex hook
- **Return Objects**: Return objects with descriptive property names

```typescript
// ✅ Good - Custom hook with clear purpose
export function useAgentData(agentId: string) {
    const [agent, setAgent] = useState<AIAgent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!agentId) return;
        
        setLoading(true);
        setError(null);
        
        fetchAgent(agentId)
            .then(setAgent)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [agentId]);

    return { agent, loading, error };
}

// ✅ Good - Composed hooks
export function useAgentManagement(agentId: string) {
    const { agent, loading, error } = useAgentData(agentId);
    const [isEditing, setIsEditing] = useState(false);
    
    const startEditing = useCallback(() => setIsEditing(true), []);
    const stopEditing = useCallback(() => setIsEditing(false), []);
    
    return {
        agent,
        loading,
        error,
        isEditing,
        startEditing,
        stopEditing
    };
}

// ❌ Avoid - Complex hook with multiple responsibilities
export function useAgentData(agentId: string) {
    // Too many responsibilities in one hook
}
```

### Hook Dependencies
- **Complete Dependencies**: Always include all dependencies in useEffect dependency arrays
- **Stable References**: Use useCallback and useMemo for stable references
- **Dependency Analysis**: Use ESLint rules to catch missing dependencies

```typescript
// ✅ Good - Complete dependencies
export function useAgentConversations(agentId: string, userId: string) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    
    useEffect(() => {
        if (!agentId || !userId) return;
        
        fetchAgentConversations(agentId, userId)
            .then(setConversations)
            .catch(logger.error);
    }, [agentId, userId]); // All dependencies included
    
    return conversations;
}

// ❌ Avoid - Missing dependencies
export function useAgentConversations(agentId: string, userId: string) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    
    useEffect(() => {
        fetchAgentConversations(agentId, userId)
            .then(setConversations)
            .catch(logger.error);
    }, [agentId]); // Missing userId dependency
}
```

## State Management

### Local State First
- **Start Local**: Use local state when possible
- **Lift When Needed**: Lift state up only when multiple components need it
- **Avoid Prop Drilling**: Use context or state management libraries for deep prop drilling
- **State Location**: Keep state as close to where it's used as possible

```typescript
// ✅ Good - Local state for component-specific data
export function AgentForm() {
    const [formData, setFormData] = useState<AgentFormData>({
        name: '',
        description: '',
        category: ''
    });
    
    const handleInputChange = (field: keyof AgentFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    return (
        <form>
            <input 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
            />
        </form>
    );
}
```

### Immutable Updates
- **Always Immutable**: Never mutate state directly
- **Spread Operator**: Use spread operator for object updates
- **Array Methods**: Use immutable array methods (map, filter, concat)
- **Deep Updates**: Use libraries like Immer for complex nested updates

```typescript
// ✅ Good - Immutable state updates
const [agents, setAgents] = useState<AIAgent[]>([]);

const addAgent = (newAgent: AIAgent) => {
    setAgents(prev => [...prev, newAgent]);
};

const updateAgent = (id: string, updates: Partial<AIAgent>) => {
    setAgents(prev => prev.map(agent => 
        agent.id === id ? { ...agent, ...updates } : agent
    ));
};

const removeAgent = (id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
};

// ❌ Avoid - Mutating state directly
const addAgent = (newAgent: AIAgent) => {
    agents.push(newAgent); // Mutation!
    setAgents(agents);
};
```

### State Normalization
- **Normalize Complex Data**: Use normalized state structure for complex data
- **Avoid Duplication**: Store entities by ID to avoid duplication
- **Derived State**: Compute derived state instead of storing it

```typescript
// ✅ Good - Normalized state
interface NormalizedState {
    agents: Record<string, AIAgent>;
    conversations: Record<string, Conversation>;
    agentConversations: Record<string, string[]>; // agentId -> conversationIds
}

const [state, setState] = useState<NormalizedState>({
    agents: {},
    conversations: {},
    agentConversations: {}
});

// Derived state
const getAgentConversations = (agentId: string) => {
    const conversationIds = state.agentConversations[agentId] || [];
    return conversationIds.map(id => state.conversations[id]).filter(Boolean);
};
```

## Error Boundaries and Error Handling

### Error Boundaries
- **Component-Level**: Use error boundaries for component-level error handling
- **Graceful Fallbacks**: Provide meaningful fallback UI
- **Error Logging**: Log errors for debugging while showing user-friendly messages
- **Recovery Options**: Provide ways for users to recover from errors

```typescript
// ✅ Good - Error boundary with fallback
interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function AgentListErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            fallback={({ error, retry }) => (
                <div className="error-fallback">
                    <h3>Something went wrong loading agents</h3>
                    <p>Please try again or contact support if the problem persists.</p>
                    <button onClick={retry}>Try Again</button>
                </div>
            )}
            onError={(error) => logger.error('Agent list error:', error)}
        >
            {children}
        </ErrorBoundary>
    );
}
```

### Component Error Handling
- **Early Returns**: Use early returns for error states
- **Loading States**: Always handle loading states
- **Empty States**: Provide meaningful empty state UI
- **User-Friendly Messages**: Show clear, actionable error messages

```typescript
// ✅ Good - Component with comprehensive error handling
export function AgentList() {
    const { agents, loading, error } = useAgents();
    
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message="Failed to load agents" />;
    if (!agents.length) return <EmptyState message="No agents found" />;
    
    return (
        <div className="agent-list">
            {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
            ))}
        </div>
    );
}
```

## Performance Optimization

### React.memo and Memoization
- **React.memo**: Use for expensive components that re-render frequently
- **useMemo**: Use for expensive calculations
- **useCallback**: Use for stable function references
- **Dependency Arrays**: Be careful with dependency arrays in memoized functions

```typescript
// ✅ Good - Optimized component
export const AgentCard = React.memo(function AgentCard({ 
    agent, 
    onSelect 
}: AgentCardProps) {
    const handleSelect = useCallback(() => {
        onSelect?.(agent);
    }, [agent, onSelect]);

    const formattedDate = useMemo(() => {
        return format(new Date(agent.createdAt), 'MMM dd, yyyy');
    }, [agent.createdAt]);

    return (
        <div className="agent-card" onClick={handleSelect}>
            <h3>{agent.name}</h3>
            <p>{agent.description}</p>
            <span>{formattedDate}</span>
        </div>
    );
});
```

### Code Splitting and Lazy Loading
- **Route-Level Splitting**: Split code at route level
- **Component-Level Splitting**: Lazy load large components
- **Dynamic Imports**: Use dynamic imports for conditional loading
- **Loading States**: Provide loading states for lazy-loaded components

```typescript
// ✅ Good - Lazy loading with loading state
const AgentManagementDashboard = lazy(() => 
    import('./AgentManagementDashboard')
);

export function AdminPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AgentManagementDashboard />
        </Suspense>
    );
}

// ✅ Good - Conditional lazy loading
const loadAdvancedFeatures = () => import('./AdvancedFeatures');

export function FeatureToggle() {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [AdvancedFeatures, setAdvancedFeatures] = useState<React.ComponentType | null>(null);
    
    const handleToggleAdvanced = async () => {
        if (!AdvancedFeatures) {
            const module = await loadAdvancedFeatures();
            setAdvancedFeatures(() => module.default);
        }
        setShowAdvanced(!showAdvanced);
    };
    
    return (
        <div>
            <button onClick={handleToggleAdvanced}>
                {showAdvanced ? 'Hide' : 'Show'} Advanced Features
            </button>
            {showAdvanced && AdvancedFeatures && <AdvancedFeatures />}
        </div>
    );
}
```

### Bundle Optimization
- **Tree Shaking**: Use named imports for better tree shaking
- **Dynamic Imports**: Use dynamic imports for large dependencies
- **Bundle Analysis**: Regularly analyze bundle size
- **Dead Code Elimination**: Remove unused code and dependencies

```typescript
// ✅ Good - Tree-shakable imports
import { format, addDays } from 'date-fns';
import { groupBy, pick } from 'lodash';

// ✅ Good - Dynamic imports for large libraries
const loadChartLibrary = () => import('chart.js');

export function ChartComponent() {
    const [Chart, setChart] = useState<any>(null);
    
    useEffect(() => {
        loadChartLibrary().then(module => {
            setChart(() => module.default);
        });
    }, []);
    
    if (!Chart) return <div>Loading chart...</div>;
    
    return <Chart data={chartData} />;
}
```

## Accessibility Guidelines

### Semantic HTML
- **Appropriate Elements**: Use semantic HTML elements for content structure
- **Heading Hierarchy**: Maintain proper heading hierarchy (h1, h2, h3, etc.)
- **Landmark Elements**: Use landmark elements (main, nav, aside, etc.)
- **Form Elements**: Use proper form elements with labels

```typescript
// ✅ Good - Semantic HTML structure
export function AgentDetailPage({ agent }: { agent: AIAgent }) {
    return (
        <main>
            <header>
                <h1>{agent.name}</h1>
                <nav aria-label="Agent navigation">
                    <a href="#overview">Overview</a>
                    <a href="#conversations">Conversations</a>
                </nav>
            </header>
            
            <section id="overview" aria-labelledby="overview-heading">
                <h2 id="overview-heading">Overview</h2>
                <p>{agent.description}</p>
            </section>
            
            <section id="conversations" aria-labelledby="conversations-heading">
                <h2 id="conversations-heading">Conversations</h2>
                <AgentConversations agentId={agent.id} />
            </section>
        </main>
    );
}
```

### ARIA Labels and Roles
- **ARIA Labels**: Provide ARIA labels for interactive elements
- **ARIA Descriptions**: Use aria-describedby for additional context
- **Role Attributes**: Use role attributes when semantic HTML isn't sufficient
- **Live Regions**: Use aria-live for dynamic content updates

```typescript
// ✅ Good - Accessible interactive component
export function AgentCard({ agent, onSelect }: AgentCardProps) {
    return (
        <article 
            className="agent-card"
            role="button"
            tabIndex={0}
            aria-label={`Agent ${agent.name}: ${agent.description}`}
            aria-describedby={`agent-${agent.id}-details`}
            onClick={() => onSelect?.(agent)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect?.(agent);
                }
            }}
        >
            <h3>{agent.name}</h3>
            <p id={`agent-${agent.id}-details`}>{agent.description}</p>
        </article>
    );
}
```

### Keyboard Navigation
- **Tab Order**: Ensure logical tab order through interactive elements
- **Focus Management**: Manage focus appropriately in dynamic content
- **Keyboard Shortcuts**: Provide keyboard shortcuts for common actions
- **Skip Links**: Provide skip links for main content

```typescript
// ✅ Good - Keyboard accessible component
export function AgentSearch({ onSearch }: { onSearch: (query: string) => void }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setQuery('');
            inputRef.current?.focus();
        }
    };
    
    return (
        <form onSubmit={handleSubmit} role="search">
            <label htmlFor="agent-search">Search agents</label>
            <input
                id="agent-search"
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search agents..."
                aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
                Press Enter to search, Escape to clear
            </div>
            <button type="submit">Search</button>
        </form>
    );
}
```

## Form Handling

### React Hook Form with Zod Validation
- **React Hook Form**: Use React Hook Form for form state management and validation
- **Zod Schemas**: Define validation schemas with Zod for type-safe validation
- **Real-time Validation**: Use `mode: 'onChange'` for immediate feedback
- **Server-Side Validation**: Always validate on the server as well
- **Error Display**: Show validation errors clearly and accessibly
- **Character Counters**: Display character counts for text fields with limits

```typescript
// ✅ Good - Form with React Hook Form and Zod validation
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define Zod schema for validation
const agentFormSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(MAX_AGENT_NAME_LENGTH, `Name must be ${MAX_AGENT_NAME_LENGTH} characters or less`),
    description: z.string()
        .max(MAX_DESCRIPTION_LENGTH, `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`)
        .optional(),
    systemContext: z.string()
        .min(1, 'System context is required')
        .max(MAX_SYSTEM_CONTEXT_LENGTH, `System context must be ${MAX_SYSTEM_CONTEXT_LENGTH} characters or less`)
});

type AgentFormData = z.infer<typeof agentFormSchema>;

export function AgentForm({ onSubmit }: { onSubmit: (data: AgentFormData) => void }) {
    const {
        formState: { errors, isDirty, isSubmitting, isValid },
        handleSubmit,
        register,
        reset,
        setValue,
        watch,
    } = useForm<AgentFormData>({
        resolver: zodResolver(agentFormSchema),
        defaultValues: {
            name: '',
            description: '',
            systemContext: '',
        },
        mode: 'onChange', // Real-time validation
    });

    // Watch form values for character counts and preview
    const watchedValues = watch();
    const nameLength = watchedValues.name?.length ?? 0;
    const descriptionLength = watchedValues.description?.length ?? 0;
    const systemContextLength = watchedValues.systemContext?.length ?? 0;

    const onSubmitForm = (data: AgentFormData) => {
        startTransition(async () => {
            await onSubmit(data);
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Agent Name*</Label>
                    <Input
                        id="name"
                        {...register('name')}
                        placeholder="Enter agent name"
                        className={errors.name ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                        <span className="text-red-500">{errors.name?.message}</span>
                        <span
                            className={
                                nameLength > MAX_AGENT_NAME_LENGTH ? 'text-red-500' : ''
                            }
                        >
                            {nameLength}/{MAX_AGENT_NAME_LENGTH} characters
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Brief description of what this agent does"
                        rows={3}
                        className={errors.description ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                        <span className="text-red-500">
                            {errors.description?.message}
                        </span>
                        <span
                            className={
                                descriptionLength > MAX_DESCRIPTION_LENGTH
                                    ? 'text-red-500'
                                    : ''
                            }
                        >
                            {descriptionLength}/{MAX_DESCRIPTION_LENGTH} characters
                        </span>
                    </div>
                </div>
            </div>

            {/* System Context with Markdown Editor */}
            <div className="space-y-2">
                <Label htmlFor="systemContext">System Context*</Label>
                <div className="min-h-[500px] overflow-hidden rounded-lg border">
                    <MarkdownEditor
                        value={watchedValues.systemContext ?? ''}
                        onChange={(value) => setValue('systemContext', value ?? '')}
                        preview="live"
                        autoFocus={false}
                    />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span className="text-red-500">
                        {errors.systemContext?.message}
                    </span>
                    <span
                        className={
                            systemContextLength > MAX_SYSTEM_CONTEXT_LENGTH
                                ? 'text-red-500'
                                : ''
                        }
                    >
                        {systemContextLength}/{MAX_SYSTEM_CONTEXT_LENGTH.toLocaleString()} characters
                    </span>
                </div>
            </div>

            <Button
                type="submit"
                disabled={!isValid || !isDirty || isSubmitting}
                className="min-w-[100px]"
            >
                {isSubmitting ? 'Saving...' : 'Create Agent'}
            </Button>
        </form>
    );
}
```

### Form State Management Patterns
- **Form State**: Use React Hook Form's built-in state management
- **Dirty State**: Track if form has been modified with `isDirty`
- **Validation State**: Use `isValid` to enable/disable submit button
- **Loading State**: Handle submission state with `isSubmitting`
- **Reset Functionality**: Use `reset()` to clear form or load template data

```typescript
// ✅ Good - Form state management patterns
export function AgentForm({ agent, onSubmit }: { agent?: AIAgent; onSubmit: (data: AgentFormData) => void }) {
    const {
        formState: { errors, isDirty, isSubmitting, isValid },
        handleSubmit,
        register,
        reset,
        setValue,
        watch,
    } = useForm<AgentFormData>({
        resolver: zodResolver(agentFormSchema),
        defaultValues: {
            name: agent?.name ?? '',
            description: agent?.description ?? '',
            systemContext: agent?.systemContext ?? '',
        },
        mode: 'onChange',
    });

    // Template selection handler
    const handleTemplateSelect = (templateKey: AgentTemplateName) => {
        const template = AGENT_TEMPLATES[templateKey];
        if (template) {
            reset({
                name: template.name,
                description: template.description,
                systemContext: template.systemContext,
            });
        }
    };

    // Submit handler with transition
    const onSubmitForm = (data: AgentFormData) => {
        startTransition(async () => {
            await onSubmit(data);
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)}>
            {/* Form fields */}
            
            <Button
                type="submit"
                disabled={!isValid || !isDirty || isSubmitting}
            >
                {isSubmitting ? 'Saving...' : agent ? 'Update Agent' : 'Create Agent'}
            </Button>
        </form>
    );
}
```

### Error Handling and User Feedback
- **Mutation Errors**: Display Server Action errors with Alert components
- **Success Messages**: Show success feedback after form submission
- **Loading States**: Provide visual feedback during submission
- **Accessibility**: Use proper ARIA attributes for error states

```typescript
// ✅ Good - Error handling and user feedback
export function AgentForm({ onSubmit }: { onSubmit: (data: AgentFormData) => void }) {
    const { createAgentMutation } = useAgentAdminCommands();
    
    const onSubmitForm = (data: AgentFormData) => {
        startTransition(async () => {
            await createAgentMutation.mutateAsync(data);
        });
    };

    const currentError = createAgentMutation.error;
    const isLoading = createAgentMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmitForm)}>
            {/* Error Messages */}
            {currentError && (
                <Alert variant="destructive">
                    <AlertDescription>{currentError.message}</AlertDescription>
                </Alert>
            )}

            {/* Success Messages */}
            {createAgentMutation.isSuccess && (
                <Alert>
                    <AlertDescription className="text-green-700">
                        Agent created successfully!
                    </AlertDescription>
                </Alert>
            )}

            {/* Form fields */}
            
            <Button
                type="submit"
                disabled={!isValid || isLoading || isSubmitting}
            >
                {isLoading || isSubmitting ? 'Saving...' : 'Create Agent'}
            </Button>
        </form>
    );
}
```

### Form Layout and Organization
- **Tabbed Interface**: Use tabs to organize form sections (Form, Templates, Preview)
- **Card Layout**: Group related fields in Card components
- **Character Counters**: Display character counts for all text fields
- **Template Integration**: Provide template selection for common use cases
- **Preview Mode**: Allow users to preview their form data

```typescript
// ✅ Good - Organized form layout with tabs
export function AgentForm() {
    const [activeTab, setActiveTab] = useState('form');

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="form">
                        <Bot className="mr-2 h-4 w-4" />
                        Agent Form
                    </TabsTrigger>
                    <TabsTrigger value="templates">
                        <FileText className="mr-2 h-4 w-4" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Configure the agent's name and description
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Form fields */}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Templates</CardTitle>
                            <CardDescription>
                                Start with a pre-configured template for common agent types
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Template selection */}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preview" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Preview</CardTitle>
                            <CardDescription>
                                Preview how your agent will appear to users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Preview content */}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
}
```

### Form Validation Best Practices
- **Zod Schemas**: Define comprehensive validation schemas with clear error messages
- **Character Limits**: Enforce character limits with visual feedback
- **Required Fields**: Clearly mark required fields with asterisks
- **Real-time Validation**: Provide immediate feedback as users type
- **Server Validation**: Always validate on the server for security

```typescript
// ✅ Good - Comprehensive validation schema
const agentFormSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(MAX_AGENT_NAME_LENGTH, `Name must be ${MAX_AGENT_NAME_LENGTH} characters or less`)
        .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
    description: z.string()
        .max(MAX_DESCRIPTION_LENGTH, `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`)
        .optional(),
    systemContext: z.string()
        .min(1, 'System context is required')
        .max(MAX_SYSTEM_CONTEXT_LENGTH, `System context must be ${MAX_SYSTEM_CONTEXT_LENGTH} characters or less`)
        .refine(
            (value) => value.trim().length > 0,
            'System context cannot be empty or only whitespace'
        ),
});

// Export the inferred type for use in components
export type AgentFormData = z.infer<typeof agentFormSchema>;
```

## UI Component Library Guidelines

### Preferred Library: ShadCN UI

**ShadCN UI** is the standard for building UI components in this project. ShadCN is not a traditional component library - it's a collection of reusable components built on top of **Radix UI** and styled with **Tailwind CSS**.

#### What is ShadCN?
- **Component Collection**: Copy-paste components that you own and control
- **Built on Radix UI**: Uses Radix UI primitives for accessibility and behavior
- **Styled with Tailwind**: Fully customizable with Tailwind CSS
- **TypeScript First**: Full TypeScript support with proper type definitions
- **No Package Dependency**: Components are copied to your codebase, not installed as npm package

#### Theme Configuration
This project uses **Blue** as the primary theme color. All ShadCN components use CSS variables for theming, configured in `src/app/globals.css`.

#### Adding New Components
Use the ShadCN CLI to add new components:

```bash
# Add a new component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add card dialog tabs
```

Components are installed to `src/app/_components/ui/` and automatically configured to use the project's theme.

### Preferred Library: Radix UI (via ShadCN)

**Radix UI** primitives are used through ShadCN components for building accessible, unstyled UI component behavior in this project.

#### Why Radix UI?
- **Accessibility First**: Built with accessibility as a core principle, following WAI-ARIA guidelines
- **Unstyled**: Provides behavior and accessibility without imposing visual design
- **Composable**: Flexible component architecture that allows for custom implementations
- **TypeScript Support**: Excellent TypeScript integration with proper type definitions
- **Performance**: Optimized for performance with minimal bundle impact
- **Customizable**: Easy to style with Tailwind CSS or any styling solution

#### Component Usage Patterns

```typescript
// ✅ Good - Using Radix UI components with proper styling
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from 'lucide-react';

export function RoleSelect({ value, onValueChange }: RoleSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <Select.Value placeholder="Select a role..." />
        <Select.Icon asChild>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <Select.Viewport className="p-1">
            <Select.Item value="USER" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
              <Select.ItemText>Domain Expert</Select.ItemText>
            </Select.Item>
            <Select.Item value="ADMIN" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
              <Select.ItemText>Administrator</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

// ✅ Good - Dialog component with Radix UI
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function ConfirmDialog({ children, title, description, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Dialog.Close asChild>
              <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Cancel
              </button>
            </Dialog.Close>
            <button 
              onClick={onConfirm}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Confirm
            </button>
          </div>
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

#### Integration with React Hook Form

Radix UI components integrate seamlessly with React Hook Form:

```typescript
// ✅ Good - Radix Select with React Hook Form
import { Controller } from 'react-hook-form';
import * as Select from '@radix-ui/react-select';

export function FormSelect({ control, name, options, placeholder }: FormSelectProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Select.Root value={field.value} onValueChange={field.onChange}>
            <Select.Trigger 
              className={`flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ${
                fieldState.error ? 'border-red-500' : 'border-input'
              }`}
            >
              <Select.Value placeholder={placeholder} />
              <Select.Icon asChild>
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                <Select.Viewport className="p-1">
                  {options.map((option) => (
                    <Select.Item 
                      key={option.value} 
                      value={option.value}
                      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          {fieldState.error && (
            <p className="text-sm text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
```

#### Styling Guidelines

- **Use Tailwind CSS**: Style Radix components with Tailwind utility classes
- **Consistent Design Tokens**: Use design system tokens for colors, spacing, and typography
- **Focus States**: Ensure proper focus indicators for keyboard navigation
- **Dark Mode Support**: Include dark mode variants in styling

#### Common Radix Components to Use

- **Select**: For dropdown selections (preferred over native `<select>`)
- **Dialog**: For modals and confirmations
- **Dropdown Menu**: For action menus and context menus
- **Tooltip**: For helpful hints and additional information
- **Tabs**: For organizing content into sections
- **Accordion**: For collapsible content sections
- **Checkbox/Radio**: For form inputs with better styling control
- **Switch**: For boolean toggles
- **Slider**: For range inputs
- **Progress**: For loading and progress indicators

#### Accessibility Benefits

Radix UI components come with built-in accessibility features:
- **Keyboard Navigation**: Full keyboard support out of the box
- **Screen Reader Support**: Proper ARIA attributes and roles
- **Focus Management**: Automatic focus handling for complex interactions
- **High Contrast**: Respects user's high contrast preferences
- **Reduced Motion**: Respects user's motion preferences

#### ShadCN Component Guidelines

**Component Structure**:
- All ShadCN components are located in `src/app/_components/ui/`
- Components use the `cn()` utility from `~/app/_utils` for className merging
- Components are built with Radix UI primitives and styled with Tailwind CSS
- Use `class-variance-authority` (CVA) for variant-based styling

**Usage Pattern**:
```typescript
// ✅ Correct: Import from ui components
import { Button } from '~/app/_components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/app/_components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="lg">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

**Customization**:
```typescript
// ✅ Correct: Extend components with custom classes
<Button className="w-full mt-4" variant="outline">
  Custom Styled Button
</Button>

// ✅ Correct: Use variant props for predefined styles
<Button variant="destructive" size="sm">
  Delete
</Button>
```

**Available Components**:
- Form elements: `button`, `input`, `textarea`, `select`, `checkbox`, `label`
- Layout: `card`, `tabs`, `accordion`, `table`
- Overlays: `dialog`, `alert-dialog`, `dropdown-menu`
- Feedback: `alert`, `badge`, `progress`

#### Migration from Native Elements

When replacing native HTML elements with ShadCN components:

```typescript
// ❌ Avoid - Native select with limited styling options
<select className="form-select">
  <option value="USER">Domain Expert</option>
  <option value="ADMIN">Administrator</option>
</select>

// ✅ Good - Radix Select with full customization
<Select.Root>
  <Select.Trigger className="custom-select-trigger">
    <Select.Value placeholder="Select role..." />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Viewport>
        <Select.Item value="USER">
          <Select.ItemText>Domain Expert</Select.ItemText>
        </Select.Item>
        <Select.Item value="ADMIN">
          <Select.ItemText>Administrator</Select.ItemText>
        </Select.Item>
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

## Testing Guidelines

### Component Testing
- **Render Testing**: Test that components render without errors
- **Props Testing**: Test components with different prop combinations
- **User Interaction**: Test user interactions and event handlers
- **Accessibility Testing**: Test accessibility features

```typescript
// ✅ Good - Comprehensive component test
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentCard } from './AgentCard';

describe('AgentCard', () => {
    const mockAgent = {
        id: '1',
        name: 'Test Agent',
        description: 'A test agent',
        createdAt: '2024-01-01T00:00:00Z'
    };
    
    it('renders agent information correctly', () => {
        render(<AgentCard agent={mockAgent} />);
        
        expect(screen.getByText('Test Agent')).toBeInTheDocument();
        expect(screen.getByText('A test agent')).toBeInTheDocument();
    });
    
    it('calls onSelect when clicked', () => {
        const onSelect = jest.fn();
        render(<AgentCard agent={mockAgent} onSelect={onSelect} />);
        
        fireEvent.click(screen.getByRole('button'));
        expect(onSelect).toHaveBeenCalledWith(mockAgent);
    });
    
    it('is keyboard accessible', () => {
        const onSelect = jest.fn();
        render(<AgentCard agent={mockAgent} onSelect={onSelect} />);
        
        const card = screen.getByRole('button');
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith(mockAgent);
    });
});
```

### Hook Testing
- **Hook Isolation**: Test hooks in isolation using renderHook
- **State Changes**: Test state changes and side effects
- **Error Handling**: Test error scenarios
- **Dependencies**: Test hook behavior with different dependencies

```typescript
// ✅ Good - Hook testing
import { renderHook, act } from '@testing-library/react';
import { useAgentData } from './useAgentData';

describe('useAgentData', () => {
    it('fetches agent data successfully', async () => {
        const mockAgent = { id: '1', name: 'Test Agent' };
        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: () => Promise.resolve(mockAgent)
        } as Response);
        
        const { result } = renderHook(() => useAgentData('1'));
        
        expect(result.current.loading).toBe(true);
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.loading).toBe(false);
        expect(result.current.agent).toEqual(mockAgent);
        expect(result.current.error).toBeNull();
    });
    
    it('handles fetch errors', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Fetch failed'));
        
        const { result } = renderHook(() => useAgentData('1'));
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.loading).toBe(false);
        expect(result.current.agent).toBeNull();
        expect(result.current.error).toBe('Fetch failed');
    });
});
```

## Conclusion

These frontend guidelines ensure our React components are maintainable, accessible, and performant. When developing frontend components, prioritize:

1. **Component Clarity** over complexity
2. **Accessibility** over visual appeal (when they conflict)
3. **Performance** over premature optimization
4. **User Experience** over developer convenience
5. **Testing** over assuming correctness

Always consider the end user's experience and ensure your components work across different devices, browsers, and accessibility tools.