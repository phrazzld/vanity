---
derived_from: simplicity
enforced_by: Code review, Architecture reviews
id: state-management
last_modified: '2025-05-14'
---
# Binding: Frontend State Management

Apply minimalist state management by using the right approach for each need: local
component state for isolated UI, React Context for shared component state, React Query
for server data, React Hook Form for forms, and global state libraries only when truly
necessary.

## Rationale

This binding directly implements our simplicity tenet by addressing one of the most
common sources of frontend complexity: state management. As applications grow,
developers face the temptation to adopt overly complex, one-size-fits-all state
management solutions that quickly become unwieldy. This binding pushes back against that
tendency by promoting a strategic, hierarchical approach to state management.

When every piece of state is managed through a global store—regardless of whether it
belongs there—applications become harder to understand, debug, and maintain. State
changes cascade in unpredictable ways, component reuse becomes difficult, and
performance suffers from excessive re-renders. Think of state management like city
planning: not everything belongs in the central district. Some activities work best in
local neighborhoods (component state), others in community hubs (context), and only a
few truly need to happen downtown (global state).

By carefully selecting the appropriate state management approach for each specific need,
we drastically reduce complexity while improving performance. Local state remains
encapsulated and predictable, shared state has clear boundaries, and global state is
reserved for truly application-wide concerns. This tiered approach makes your
application more maintainable, testable, and scalable—and ultimately delivers a better
user experience with fewer bugs and faster performance.

## Rule Definition

The frontend state management binding establishes these core requirements:

- **Use the Most Appropriate Tool**: Select the simplest, most localized state
  management approach that fully addresses the need at hand. Prefer local component
  state when possible, and only escalate to more complex solutions when necessary.

- **State Locality and Colocation**: Keep state as close as possible to where it's used.
  State that affects only a single component should be managed within that component;
  state shared by a few related components should be lifted to their nearest common
  ancestor or a dedicated context.

- **Separation of Concerns**: Maintain clear boundaries between different types of
  state:

  - UI State: Component appearance, animations, open/closed status
  - Application State: User settings, current view, application mode
  - Server/Domain State: Data from APIs, server responses, cached entities
  - Form State: Input values, validation errors, submission status

- **Immutable Updates**: All state updates must follow immutable patterns. Never mutate
  state directly, always create new state objects that replace the old ones.

- **Clear Ownership**: Each piece of state should have a clear, single owner responsible
  for updating it. Avoid distributed state updates where multiple components can modify
  the same data.

- **Explicit Update Patterns**: Use well-defined patterns for state updates:

  - Actions and reducers for complex state logic
  - Event handlers and setters for simple updates
  - Provider patterns for shared state

Exceptions to these rules should be extremely rare and only for well-justified
performance optimizations in critical paths, with detailed documentation explaining the
deviation.

## Practical Implementation

1. **Component State for UI Elements**: Use React's built-in hooks for local component
   state:

   - Use `useState` for simple, independent values:

     ```jsx
     const [isOpen, setIsOpen] = useState(false);
     const [count, setCount] = useState(0);
     ```

   - Use `useReducer` for complex, interrelated state:

     ```jsx
     const [state, dispatch] = useReducer(reducer, initialState);
     // Where state might have related properties like:
     // { isLoading, error, data, page, sortBy, filters }
     ```

1. **Context API for Shared Component State**: Create focused contexts for state shared
   between related components:

   - Keep contexts small and focused on specific concerns
   - Provide helper hooks to access context values and actions
   - Separate read operations from write operations when possible

   ```jsx
   // Create a focused context
   const ThemeContext = createContext();

   // Provider component with state
   function ThemeProvider({ children }) {
     const [theme, setTheme] = useState('light');
     const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

     return (
       <ThemeContext.Provider value={{ theme, toggleTheme }}>
         {children}
       </ThemeContext.Provider>
     );
   }

   // Custom hook for consuming the context
   function useTheme() {
     const context = useContext(ThemeContext);
     if (!context) {
       throw new Error('useTheme must be used within a ThemeProvider');
     }
     return context;
   }
   ```

1. **Server State with TanStack Query**: Use React Query for all server-related data
   operations:

   - Separate server state from client state
   - Leverage built-in caching, deduplication, and background updates
   - Implement proper loading, error, and success states

   ```jsx
   function ProductList() {
     const { data, isLoading, error } = useQuery({
       queryKey: ['products'],
       queryFn: fetchProducts,
       staleTime: 5 * 60 * 1000, // 5 minutes
     });

     if (isLoading) return <Loading />;
     if (error) return <ErrorMessage error={error} />;

     return <ProductGrid products={data} />;
   }
   ```

1. **Form State with React Hook Form**: Use dedicated form libraries for all
   form-related state:

   - Leverage form-specific validation and state management
   - Separate form state from application state
   - Implement clear submission and error handling patterns

   ```jsx
   function ContactForm() {
     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

     const onSubmit = async (data) => {
       try {
         await submitContactForm(data);
         toast.success('Form submitted successfully!');
         reset();
       } catch (error) {
         toast.error('Error submitting form');
       }
     };

     return (
       <form onSubmit={handleSubmit(onSubmit)}>
         <input
           {...register('name', { required: 'Name is required' })}
           placeholder="Name"
         />
         {errors.name && <span>{errors.name.message}</span>}

         {/* Other form fields */}

         <button type="submit" disabled={isSubmitting}>
           {isSubmitting ? 'Submitting...' : 'Submit'}
         </button>
       </form>
     );
   }
   ```

1. **Global State for Complex Applications**: For truly application-wide state, use a
   dedicated state management library:

   - Prefer Zustand for most cases due to its simplicity and hooks-based API
   - Use Redux only for complex applications with extensive state interdependencies
   - Organize global state by domain or feature, not by technical concerns

   ```jsx
   // Using Zustand for global state
   const useStore = create((set) => ({
     user: null,
     isAuthenticated: false,

     login: async (credentials) => {
       const user = await authService.login(credentials);
       set({ user, isAuthenticated: true });
     },

     logout: () => {
       authService.logout();
       set({ user: null, isAuthenticated: false });
     },
   }));
   ```

## Examples

```jsx
// ❌ BAD: Everything in global state
// store.js
const store = createStore({
  // UI state that should be local
  isModalOpen: false,
  activeTab: 'home',

  // Form state that should use a form library
  firstName: '',
  lastName: '',
  email: '',
  formErrors: {},

  // Server state that should use React Query
  users: [],
  usersLoading: false,
  usersError: null,

  // Actions mixed together
  setModalOpen: (state, isOpen) => ({ ...state, isModalOpen: isOpen }),
  setActiveTab: (state, tab) => ({ ...state, activeTab: tab }),
  setFirstName: (state, name) => ({ ...state, firstName: name }),
  // ... many more actions
});

// Component.jsx
function Component() {
  const {
    isModalOpen, setModalOpen,
    users, usersLoading, fetchUsers
  } = useStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Component using global state for everything
}

// ✅ GOOD: Appropriate state management for each concern
// Component with local state
function TabPanel() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div>
      <TabList activeTab={activeTab} onChange={setActiveTab} />
      <TabContent activeTab={activeTab} />
    </div>
  );
}

// Server state with React Query
function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;

  return <UserTable users={users} />;
}

// Form state with React Hook Form
function ProfileForm() {
  const { register, handleSubmit, formState } = useForm();

  const onSubmit = async (data) => {
    await updateProfile(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with register */}
    </form>
  );
}

// Global state (authentication) with Zustand
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {/* auth logic */},
  logout: () => {/* logout logic */},
}));

function AuthStatus() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return isAuthenticated ? (
    <div>
      Welcome, {user.name}
      <button onClick={logout}>Logout</button>
    </div>
  ) : <LoginButton />;
}
```

```jsx
// ❌ BAD: Overly complex state management for simple UI state
// Using Redux for a simple toggle
// actions.js
export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const toggleSidebar = () => ({ type: TOGGLE_SIDEBAR });

// reducer.js
const initialState = { isSidebarOpen: false };

export function uiReducer(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    default:
      return state;
  }
}

// Component.jsx
function Sidebar() {
  const isSidebarOpen = useSelector(state => state.ui.isSidebarOpen);
  const dispatch = useDispatch();

  return (
    <>
      <button onClick={() => dispatch(toggleSidebar())}>
        Toggle Sidebar
      </button>
      {isSidebarOpen && <div className="sidebar">Sidebar content</div>}
    </>
  );
}

// ✅ GOOD: Appropriate simplicity for UI state
function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle Sidebar
      </button>
      {isOpen && <div className="sidebar">Sidebar content</div>}
    </>
  );
}
```

```jsx
// ❌ BAD: Mixed state management concerns
function ProductPage({ productId }) {
  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Server state managed manually (should use React Query)
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global state
  const { cart, addToCart } = useCartStore();

  // Manual fetch with useEffect - prone to race conditions, no caching
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const result = await api.fetchProduct(productId);
        setProduct(result);
        setError(null);
      } catch (e) {
        setError(e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  // Complex component handling multiple state concerns
  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
      <button onClick={() => setIsFilterOpen(!isFilterOpen)}>
        Toggle Filters
      </button>
      {isFilterOpen && <Filters />}
    </div>
  );
}

// ✅ GOOD: Clean separation of state concerns
function ProductPage({ productId }) {
  // UI state: Local component state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Server state: React Query
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.fetchProduct(productId),
  });

  // Global state: Only what's needed
  const addToCart = useCartStore(state => state.addToCart);

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
      <button onClick={() => setIsFilterOpen(!isFilterOpen)}>
        Toggle Filters
      </button>
      {isFilterOpen && <Filters />}
    </div>
  );
}
```

## Related Bindings

- [component-architecture.md](../../docs/bindings/core/component-architecture.md): Component architecture and
  state management work hand in hand. Well-designed component boundaries make state
  management simpler by encapsulating related state and behavior. This binding builds on
  component architecture by defining how state should flow through the component
  hierarchy.

- [immutable-by-default.md](../../docs/bindings/core/immutable-by-default.md): State immutability is a
  fundamental requirement for predictable frontend applications. This binding reinforces
  the immutable-by-default binding by applying it specifically to React's state
  management patterns, ensuring state updates are predictable and traceable.

- [pure-functions.md](../../docs/bindings/core/pure-functions.md): State management logic should follow pure
  function principles. Reducers, selectors, and state transformations should be pure
  functions without side effects, making state changes predictable and testable.

- [dependency-management.md](../../docs/bindings/core/dependency-management.md): Careful selection of state
  management libraries is an important aspect of dependency management. This binding
  complements dependency management by providing guidance on when to introduce state
  management libraries versus using built-in React capabilities.
