import type { BuildContextMemory } from './types';

export const mockMemory: BuildContextMemory = {
  project_identity: {
    name: 'Buiry',
    description:
      'BUild context memoRY — Developer infrastructure for persistent AI agent memory and dataset harvesting.',
    version: '0.1.0',
    stack: ['TypeScript', 'React', 'Python', 'Sui'],
    architecture_summary:
      'MCP server (npx buiry-mcp) for local session memory via JSON. ADK multi-agent system calling MCP tools via stdio. React dashboard for visualization.',
    repo_url: 'https://github.com/Benedict258/Buiry',
    created_at: '2026-05-08T00:00:00Z',
    buiry_version: '1.0.0',
  },
  config: {
    max_sessions_in_context: 10,
    auto_summarize_after: 15,
    dataset_capture: true,
    dataset_domain: 'developer-tools',
  },
  summary: {
    current_phase: 'Phase 2: Core Features',
    overall_status: 'active',
    last_updated: '2026-07-01T14:32:00Z',
    total_sessions: 12,
    open_issues: 3,
  },
  sessions: [
    {
      session_id: 'session_047',
      timestamp: '2026-07-01T14:32:00Z',
      ai_agent: 'Claude Code',
      current_phase: 'Optimization',
      progress: {
        completed: [
          'WebSocket handshake optimized with connection pooling',
          'Buffer allocation leak identified and patched in data ingestion',
        ],
        in_progress: [
          'Memory usage profiling on concurrent sessions',
          'Reducing token overhead in context serialization',
        ],
        blocked: [],
      },
      last_session_summary:
        'Resuming work on the MCP Server integration. Last checkpoint focused on the WebSocket handshake optimization. Identifying leaks in the buffer allocation logic.',
      changes_made: [
        'Refactored ws-handshake.ts to reuse TLS sessions',
        'Added buffer pool recycling in data-ingest/buffer.ts',
        'Updated connection timeout defaults from 30s to 10s',
        'Added memory profiling instrumentation to session-handler.ts',
      ],
      file_module_map: [
        {
          file: 'packages/buiry-mcp/src/ws-handshake.ts',
          purpose: 'WebSocket handshake with TLS session reuse',
          last_modified: '2026-07-01T14:30:00Z',
        },
        {
          file: 'packages/buiry-mcp/src/data-ingest/buffer.ts',
          purpose: 'Buffer pool for data ingestion pipeline',
          last_modified: '2026-07-01T14:25:00Z',
        },
        {
          file: 'packages/buiry-mcp/src/session-handler.ts',
          purpose: 'Session lifecycle management and context serialization',
          last_modified: '2026-07-01T14:32:00Z',
        },
      ],
      decisions_log: [
        {
          decision: 'Reuse TLS sessions instead of creating new contexts per connection',
          reason: 'Reduces handshake latency by 40% on repeated connections to the same MCP client',
          alternatives_considered: 'Keep per-connection TLS contexts (current), use connection multiplexing',
        },
        {
          decision: 'Implement buffer pool recycling instead of GC-dependent allocation',
          reason: 'Predictable memory usage under high concurrency. Prevents GC spikes that cause timeout errors.',
          alternatives_considered: 'Increase heap size, use WeakRef for buffer tracking',
        },
      ],
      known_issues: [
        {
          issue: 'Memory spike when 50+ sessions run concurrently',
          severity: 'medium',
          status: 'in-progress',
        },
      ],
      errors_encountered: [
        {
          error: 'Buffer overflow in data-ingest pipeline under load',
          context: 'Happened during 100-session stress test with concurrent writes',
          resolution: 'Implemented buffer pool recycling with max 256MB cap per pipeline',
        },
      ],
      next_steps: [
        'Complete memory profiling across 100 concurrent sessions',
        'Benchmark token reduction from context serialization optimization',
        'Implement lazy loading for file_module_map in get_context tool',
      ],
      dataset_signals: [],
      notes: 'Active session. Focus on performance optimization before Phase 2 feature work.',
    },
    {
      session_id: 'session_046',
      timestamp: '2026-07-01T11:05:00Z',
      ai_agent: 'Cursor',
      current_phase: 'Debugging',
      progress: {
        completed: [
          'Root-caused race condition in auth middleware',
          'Fixed stale cache invalidation in session token store',
        ],
        in_progress: [],
        blocked: [],
      },
      last_session_summary:
        'Investigation of race condition in the Auth Middleware. Identified stale cache invalidation as the root cause.',
      changes_made: [
        'Fixed cache invalidation race in auth/middleware.ts',
        'Added mutex lock to session token refresh path',
        'Updated cache TTL from 60s to 30s for stale reads',
      ],
      file_module_map: [
        {
          file: 'packages/buiry-mcp/src/auth/middleware.ts',
          purpose: 'Authentication middleware with cache-based token validation',
          last_modified: '2026-07-01T11:00:00Z',
        },
        {
          file: 'packages/buiry-mcp/src/auth/token-store.ts',
          purpose: 'In-memory session token cache with TTL eviction',
          last_modified: '2026-07-01T11:05:00Z',
        },
      ],
      decisions_log: [
        {
          decision: 'Use mutex lock on token refresh instead of optimistic concurrency',
          reason: 'Race condition only occurs during concurrent refresh attempts. Mutex eliminates the condition entirely without added complexity.',
          alternatives_considered: 'Optimistic concurrency with retry, distributed lock with Redis',
        },
      ],
      known_issues: [
        {
          issue: 'Cache TTL too aggressive — frequent re-auth on slow connections',
          severity: 'low',
          status: 'open',
        },
      ],
      errors_encountered: [],
      next_steps: [
        'Add integration test for concurrent token refresh',
        'Monitor cache hit rate after TTL change',
      ],
      dataset_signals: [],
    },
    {
      session_id: 'session_045',
      timestamp: '2026-06-30T18:47:00Z',
      ai_agent: 'Claude Code',
      current_phase: 'Feature Addition',
      progress: {
        completed: [
          'Implemented WebGL rendering engine for dashboard view',
          'Built real-time session activity bar chart component',
          'Added animated transitions for chart data updates',
        ],
        in_progress: [],
        blocked: [],
      },
      last_session_summary:
        'Implementation of the WebGL rendering engine for the dashboard view. Real-time bar chart with animated transitions.',
      changes_made: [
        'Created src/lib/webgl/chart-renderer.ts',
        'Added session activity bar chart to Dashboard',
        'Implemented smooth data transition animations',
        'Added WebGL context loss recovery',
      ],
      file_module_map: [
        {
          file: 'apps/web/src/lib/webgl/chart-renderer.ts',
          purpose: 'WebGL-based chart renderer for high-performance data visualization',
          last_modified: '2026-06-30T18:45:00Z',
        },
        {
          file: 'apps/web/src/components/dashboard/ActivityChart.tsx',
          purpose: 'Session activity bar chart with WebGL rendering',
          last_modified: '2026-06-30T18:47:00Z',
        },
      ],
      decisions_log: [
        {
          decision: 'Use WebGL for chart rendering instead of SVG or Canvas 2D',
          reason: 'Handles 1000+ data points at 60fps. SVG becomes sluggish past 200 elements.',
          alternatives_considered: 'SVG with D3.js, Canvas 2D with custom hit testing',
        },
      ],
      known_issues: [],
      errors_encountered: [],
      next_steps: [
        'Add tooltip interaction on chart hover',
        'Export chart data as PNG',
      ],
      dataset_signals: [],
      notes: 'Completed. WebGL renderer is stable and performant. Ready for integration with live MCP data.',
    },
    {
      session_id: 'session_044',
      timestamp: '2026-06-30T15:22:00Z',
      ai_agent: 'Cursor',
      current_phase: 'Refactoring',
      progress: {
        completed: [
          'Migrated authentication module from legacy session tokens to JWT',
          'Removed legacy session token code paths',
          'Updated all auth middleware to use JWT validation',
        ],
        in_progress: [],
        blocked: [],
      },
      last_session_summary:
        'Migrated authentication module from legacy session tokens to JWT. All middleware updated.',
      changes_made: [
        'Created src/auth/jwt-provider.ts',
        'Migrated auth/middleware.ts from session tokens to JWT',
        'Removed legacy session-store.ts',
        'Updated tests for JWT-based auth flow',
      ],
      file_module_map: [
        {
          file: 'packages/buiry-mcp/src/auth/jwt-provider.ts',
          purpose: 'JWT token generation and validation',
          last_modified: '2026-06-30T15:20:00Z',
        },
        {
          file: 'packages/buiry-mcp/src/auth/middleware.ts',
          purpose: 'Auth middleware — migrated to JWT',
          last_modified: '2026-06-30T15:22:00Z',
        },
      ],
      decisions_log: [
        {
          decision: 'Migrate from session tokens to JWT for MCP server auth',
          reason: 'JWTs are stateless and work across multiple MCP server instances without shared session storage.',
          alternatives_considered: 'Keep session tokens with Redis store, use API keys only',
        },
      ],
      known_issues: [],
      errors_encountered: [],
      next_steps: [
        'Add refresh token rotation',
        'Implement token revocation list',
      ],
      dataset_signals: [],
      notes: 'Refactoring complete. All legacy auth code removed. JWT validation tested with 1000+ requests.',
    },
  ],
};
