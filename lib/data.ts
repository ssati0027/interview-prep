export type TagType = 'hot' | 'mnc' | 'hard'

export interface Topic {
  name: string
  tags: TagType[]
}

export interface Section {
  label: string
  topics: Topic[]
}

export interface Pillar {
  id: string
  icon: string
  title: string
  color: string
  sections: Section[]
}

export const PILLARS: Pillar[] = [
  {
    id: 'java', icon: '☕', title: 'Java Internals & OOP Depth', color: 'java',
    sections: [
      { label: 'Language Fundamentals', topics: [
        { name: 'Functional interfaces & backward compatibility', tags: ['hot','mnc'] },
        { name: 'Default & static methods in interfaces', tags: ['hot'] },
        { name: 'Lambda internals — invokedynamic bytecode', tags: ['mnc','hard'] },
        { name: 'Method references — all 4 types & when to use each', tags: ['hot'] },
        { name: 'Stream API — lazy evaluation, intermediate vs terminal ops', tags: ['hot','mnc'] },
        { name: 'Optional — best practices & common anti-patterns', tags: ['hot'] },
        { name: 'Generics, wildcards & type erasure', tags: ['mnc'] },
        { name: 'Covariance, contravariance, invariance', tags: [] },
        { name: 'Serializable vs Externalizable', tags: ['hot','mnc'] },
        { name: 'transient, volatile — differences & when to use', tags: ['mnc'] },
        { name: 'Exception handling best practices — checked vs unchecked design', tags: ['hot'] },
        { name: 'try-with-resources & AutoCloseable contract', tags: ['mnc'] },
        { name: 'var keyword (Java 10) — type inference & limitations', tags: [] },
        { name: 'String pool, intern() & memory implications', tags: ['hot','mnc'] },
      ]},
      { label: 'JVM Internals', topics: [
        { name: 'JVM memory areas — heap, stack, metaspace, code cache', tags: ['mnc','hot'] },
        { name: 'Garbage collection algorithms — G1, ZGC, Shenandoah', tags: ['mnc'] },
        { name: 'GC tuning — heap sizing, pause time goals, GC logs', tags: ['mnc','hard'] },
        { name: 'ClassLoader hierarchy & custom loaders', tags: [] },
        { name: 'JIT compilation — inlining, escape analysis, on-stack replacement', tags: [] },
        { name: 'Java Memory Model — happens-before, visibility, reordering', tags: ['hard','mnc'] },
      ]},
      { label: 'OOP & Modern Java', topics: [
        { name: 'SOLID principles with real-world Java examples', tags: ['hot','mnc'] },
        { name: 'Composition vs Inheritance — prefer composition reasons', tags: ['mnc'] },
        { name: 'Immutability — designing truly immutable classes', tags: ['hot'] },
        { name: 'equals() & hashCode() contract + pitfalls in collections', tags: ['hot'] },
        { name: 'Comparable vs Comparator', tags: [] },
        { name: 'Reflection API — use cases, performance overhead & risks', tags: [] },
        { name: 'Records, sealed classes, pattern matching (Java 16-21)', tags: ['hot'] },
      ]},
    ]
  },
  {
    id: 'design', icon: '🏛', title: 'Design Patterns & Architecture', color: 'design',
    sections: [
      { label: 'Creational', topics: [
        { name: 'Singleton — double-checked locking & enum approach', tags: ['hot','mnc'] },
        { name: 'Factory vs Abstract Factory — when to use which', tags: ['hot','mnc'] },
        { name: 'Builder pattern — telescoping constructor problem', tags: ['hot'] },
        { name: 'Prototype pattern — deep vs shallow copy', tags: [] },
        { name: 'Object Pool pattern — reuse & lifecycle management', tags: ['mnc'] },
      ]},
      { label: 'Structural', topics: [
        { name: 'Decorator pattern — Java I/O streams walkthrough', tags: ['mnc'] },
        { name: 'Adapter vs Bridge pattern — key distinction', tags: [] },
        { name: 'Composite pattern — tree structures', tags: [] },
        { name: 'Proxy pattern — JDK dynamic proxy vs CGLIB', tags: ['mnc','hot'] },
        { name: 'Facade pattern — simplifying subsystems', tags: [] },
        { name: 'Flyweight pattern — sharing to reduce memory', tags: ['mnc'] },
      ]},
      { label: 'Behavioural', topics: [
        { name: 'Strategy pattern — replacing switch/if-else chains', tags: ['hot','mnc'] },
        { name: 'Observer / Event-driven pattern', tags: ['hot'] },
        { name: 'Command pattern & CQRS connection', tags: ['hot','mnc'] },
        { name: 'Template method pattern', tags: ['mnc'] },
        { name: 'Chain of responsibility — filter pipelines', tags: [] },
        { name: 'State pattern — replacing state flag if-else blocks', tags: ['mnc'] },
        { name: 'Mediator pattern — decoupling components', tags: [] },
        { name: 'Null Object pattern — eliminating null checks', tags: ['hot'] },
        { name: 'Iterator pattern — custom iterables in Java', tags: [] },
      ]},
      { label: 'Architecture Patterns', topics: [
        { name: 'CQRS — Command Query Responsibility Segregation', tags: ['hot','mnc','hard'] },
        { name: 'Event sourcing — rebuilding state from events', tags: ['mnc','hard'] },
        { name: 'Hexagonal architecture (Ports & Adapters)', tags: ['mnc','hot'] },
        { name: 'Clean Architecture — layers & the dependency rule', tags: ['mnc','hot'] },
        { name: 'Repository pattern — abstracting persistence layer', tags: ['hot','mnc'] },
        { name: 'Outbox pattern — guaranteed event publishing with DB', tags: ['mnc','hard'] },
        { name: 'Service Locator vs Dependency Injection trade-offs', tags: ['mnc'] },
      ]},
    ]
  },
  {
    id: 'thread', icon: '⚙', title: 'Multithreading & Concurrency', color: 'thread',
    sections: [
      { label: 'Core Concepts', topics: [
        { name: 'Thread lifecycle — all 6 states & transitions', tags: ['hot'] },
        { name: 'synchronized — intrinsic locks, method vs block scope', tags: ['hot','mnc'] },
        { name: 'volatile keyword — visibility vs atomicity distinction', tags: ['hot','mnc'] },
        { name: 'wait() / notify() / notifyAll() — producer-consumer', tags: ['mnc','hot'] },
        { name: 'Deadlock, livelock, starvation — detect & prevent', tags: ['hot','mnc'] },
        { name: 'Thread safety — race conditions & critical sections', tags: ['hot'] },
      ]},
      { label: 'Java Concurrency API', topics: [
        { name: 'Executor framework — ThreadPoolExecutor internals & queue types', tags: ['hot','mnc'] },
        { name: 'Thread pool sizing formula — CPU-bound vs IO-bound tasks', tags: ['hot','mnc'] },
        { name: 'Callable vs Runnable, Future vs CompletableFuture', tags: ['hot','mnc'] },
        { name: 'CompletableFuture — thenCompose, thenCombine, allOf, anyOf', tags: ['hot'] },
        { name: 'ScheduledExecutorService — cron-like scheduling in Java', tags: ['mnc'] },
        { name: 'ReentrantLock vs synchronized — fairness, tryLock', tags: ['mnc'] },
        { name: 'ReadWriteLock — readers-writers problem', tags: ['mnc'] },
        { name: 'StampedLock — optimistic reading pattern', tags: [] },
        { name: 'Semaphore, CountDownLatch, CyclicBarrier, Phaser, Exchanger', tags: ['mnc','hot'] },
      ]},
      { label: 'Concurrent Data Structures', topics: [
        { name: 'ConcurrentHashMap — CAS + bin locking internals (Java 8+)', tags: ['hot','mnc','hard'] },
        { name: 'CopyOnWriteArrayList — use cases & trade-offs', tags: ['mnc'] },
        { name: 'BlockingQueue — LinkedBlocking vs ArrayBlocking vs PriorityBlocking', tags: ['mnc'] },
        { name: 'AtomicInteger, AtomicReference, AtomicStampedReference — CAS', tags: ['hot'] },
        { name: 'LongAdder vs AtomicLong — high-contention performance', tags: ['mnc'] },
      ]},
      { label: 'Advanced & Modern', topics: [
        { name: 'Fork/Join framework & work-stealing algorithm', tags: [] },
        { name: 'Thread-local variables — use & memory leak risk in thread pools', tags: ['mnc'] },
        { name: 'Virtual threads (Project Loom — Java 21) & structured concurrency', tags: ['hot','mnc'] },
        { name: 'Reactive programming — Project Reactor (Mono, Flux, backpressure)', tags: ['hot','mnc','hard'] },
        { name: 'Happens-before guarantee — full JMM rules', tags: ['hard','mnc'] },
        { name: 'Lock-free programming — ABA problem & AtomicStampedReference', tags: ['hard'] },
        { name: 'Memory barriers & CPU cache coherence basics', tags: ['hard'] },
      ]},
    ]
  },
  {
    id: 'system', icon: '🏗', title: 'System Design', color: 'system',
    sections: [
      { label: 'Foundations', topics: [
        { name: 'CAP theorem & PACELC model', tags: ['hot','mnc'] },
        { name: 'Consistency models — eventual, strong, causal, linearizability', tags: ['mnc'] },
        { name: 'Horizontal vs vertical scaling — limits & trade-offs', tags: ['hot'] },
        { name: 'SQL vs NoSQL — choosing the right database for the use case', tags: ['hot','mnc'] },
        { name: 'Consistent hashing with virtual nodes', tags: ['hot','mnc','hard'] },
      ]},
      { label: 'Data & Storage', topics: [
        { name: 'Database sharding — hash, range, directory-based strategies', tags: ['mnc','hot'] },
        { name: 'DB replication — master-slave, multi-master, read replicas', tags: ['mnc'] },
        { name: 'Indexing deep dive — B-tree, composite, covering, partial', tags: ['hot','mnc'] },
        { name: 'Caching strategies — write-through, write-back, cache-aside', tags: ['hot','mnc'] },
        { name: 'Redis — data structures, eviction, pub-sub, Lua scripts', tags: ['hot','mnc'] },
        { name: 'Bloom filters — probabilistic membership & false positives', tags: ['mnc','hard'] },
        { name: 'CDN — push vs pull model, cache invalidation', tags: ['hot','mnc'] },
      ]},
      { label: 'Distributed Systems', topics: [
        { name: 'Message queues — Kafka architecture, partitions, consumer groups', tags: ['hot','mnc','hard'] },
        { name: 'API Gateway — routing, rate limiting, auth, aggregation', tags: ['mnc','hot'] },
        { name: 'Rate limiting algorithms — token bucket, leaky bucket, sliding window', tags: ['mnc','hot','hard'] },
        { name: 'Load balancer algorithms — round-robin, least connections', tags: ['mnc','hot'] },
        { name: 'Service discovery — Eureka, Consul, DNS-based', tags: ['mnc'] },
        { name: 'Distributed transactions — Saga (choreography vs orchestration)', tags: ['hard','mnc'] },
        { name: 'Circuit breaker — states, half-open, Resilience4j', tags: ['hot','mnc'] },
        { name: 'Leader election — Raft consensus, ZooKeeper ZAB', tags: ['mnc','hard'] },
        { name: 'Vector clocks & distributed conflict resolution', tags: ['hard'] },
        { name: 'Two-phase commit (2PC) vs three-phase commit vs Saga', tags: ['hard','mnc'] },
        { name: 'gRPC vs REST vs GraphQL — when to use each', tags: ['hot','mnc'] },
        { name: 'WebSockets & Server-Sent Events — real-time communication', tags: ['mnc'] },
      ]},
      { label: 'Deployment & Observability', topics: [
        { name: 'Deployment strategies — Blue-Green, Canary, Rolling, Feature flags', tags: ['hot','mnc'] },
        { name: 'Docker & Kubernetes — pods, services, HPA, ConfigMaps', tags: ['hot','mnc'] },
        { name: 'CI/CD pipeline design — stages, quality gates, rollback', tags: ['mnc'] },
        { name: 'Observability — metrics, logs, traces (3 pillars)', tags: ['mnc'] },
      ]},
      { label: 'Design Problems', topics: [
        { name: 'Design URL shortener — hashing, redirects, analytics', tags: ['mnc','hot'] },
        { name: 'Design notification system — fan-out, multi-channel', tags: ['mnc'] },
        { name: 'Design rate limiter — distributed, sliding window, per-user', tags: ['mnc','hot','hard'] },
        { name: 'Design Twitter/Instagram feed — pull vs push vs hybrid', tags: ['mnc','hot'] },
        { name: 'Design search autocomplete — trie vs Elasticsearch', tags: ['mnc','hot'] },
        { name: 'Design distributed cache — eviction, partitioning', tags: ['mnc','hard'] },
        { name: 'Design WhatsApp/chat — WebSocket, ordering, delivery guarantees', tags: ['mnc','hard'] },
      ]},
    ]
  },
  {
    id: 'algo', icon: '📊', title: 'DS & Algorithms', color: 'algo',
    sections: [
      { label: 'Core Data Structures', topics: [
        { name: 'Arrays & strings — two-pointer, sliding window patterns', tags: ['hot'] },
        { name: 'HashMap internals — open addressing vs chaining, load factor', tags: ['mnc','hot'] },
        { name: 'Linked list — reversal, cycle detection (Floyd\'s algorithm)', tags: ['hot'] },
        { name: 'Stack & queue — monotonic stack pattern', tags: ['hot'] },
        { name: 'Deque — sliding window maximum & minimum patterns', tags: ['hot'] },
        { name: 'Heap / Priority queue — top-K & merge K sorted lists', tags: ['hot','mnc'] },
        { name: 'Trie — prefix tree for autocomplete & word search', tags: ['mnc'] },
        { name: 'Segment tree & Fenwick tree (BIT) — range queries', tags: ['mnc','hard'] },
      ]},
      { label: 'Trees & Graphs', topics: [
        { name: 'Binary trees — BFS, DFS, LCA, diameter, max path sum', tags: ['hot'] },
        { name: 'BST operations & balancing — AVL & Red-Black concepts', tags: ['mnc'] },
        { name: 'Graph — BFS, DFS, topological sort (Kahn\'s algorithm)', tags: ['hot','mnc'] },
        { name: 'Shortest path — Dijkstra, Bellman-Ford, Floyd-Warshall', tags: ['mnc'] },
        { name: 'Minimum spanning tree — Kruskal\'s & Prim\'s algorithms', tags: ['mnc'] },
        { name: 'Union-Find — path compression & union by rank', tags: ['mnc'] },
      ]},
      { label: 'Algorithms & Techniques', topics: [
        { name: 'Binary search — on answer, rotated array, search space reduction', tags: ['hot'] },
        { name: 'Recursion & backtracking — N-queens, permutations, subsets', tags: ['hot'] },
        { name: 'Dynamic programming — knapsack, LCS, LIS, matrix chain', tags: ['hot','hard','mnc'] },
        { name: 'Greedy algorithms — interval scheduling, activity selection', tags: ['mnc'] },
        { name: 'String algorithms — KMP, Rabin-Karp, Z-algorithm', tags: ['mnc','hard'] },
        { name: 'Matrix problems — spiral, rotation, island counting', tags: ['hot'] },
        { name: 'Bit manipulation — XOR tricks, power of 2, subset enumeration', tags: ['mnc'] },
        { name: 'Reservoir sampling & Fisher-Yates shuffle', tags: [] },
      ]},
      { label: 'System-Level Coding', topics: [
        { name: 'LRU Cache — O(1) get & put using HashMap + DoublyLinkedList', tags: ['hot','mnc','hard'] },
        { name: 'LFU Cache — O(1) all operations using frequency buckets', tags: ['mnc','hard'] },
        { name: 'Time & space complexity — Big-O, amortized, recurrence', tags: ['hot'] },
        { name: 'Problem-solving framework — UMPIRE / Think-Aloud method', tags: [] },
      ]},
    ]
  },
  {
    id: 'spring', icon: '🌱', title: 'Spring Boot & Production Java', color: 'spring',
    sections: [
      { label: 'Spring Core Deep Dive', topics: [
        { name: 'IoC container — bean lifecycle, BeanPostProcessor, BeanFactoryPostProcessor', tags: ['hot','mnc'] },
        { name: 'DI — constructor vs field vs setter & circular dependency handling', tags: ['hot'] },
        { name: 'AOP — pointcuts, joinpoints, advice types, proxy mechanism', tags: ['mnc','hot'] },
        { name: '@Transactional — propagation, isolation, self-invocation pitfall', tags: ['hot','mnc','hard'] },
        { name: 'Spring Bean scopes — singleton, prototype, request, session', tags: ['hot'] },
        { name: 'Spring Events — ApplicationEvent, @EventListener, async events', tags: ['mnc'] },
        { name: '@Async — thread pool config, exception handling, Future types', tags: ['hot','mnc'] },
        { name: '@Scheduled — fixed rate vs fixed delay vs cron expressions', tags: ['mnc'] },
      ]},
      { label: 'Spring Boot & REST', topics: [
        { name: 'Auto-configuration — @ConditionalOnClass, @EnableAutoConfiguration', tags: ['mnc'] },
        { name: 'REST best practices — idempotency, status codes, versioning', tags: ['hot'] },
        { name: 'Exception handling — @ControllerAdvice, ProblemDetail (RFC 7807)', tags: ['hot'] },
        { name: 'Validation — Bean Validation 3.0, custom validators, groups', tags: [] },
        { name: 'Spring Security — JWT, OAuth2, filter chain customization', tags: ['mnc','hot','hard'] },
        { name: 'Spring WebFlux — reactive web, RouterFunction, WebClient', tags: ['hot','mnc'] },
      ]},
      { label: 'Data & Performance', topics: [
        { name: 'JPA/Hibernate — N+1 problem, lazy vs eager, fetch joins', tags: ['hot','mnc','hard'] },
        { name: 'Connection pooling — HikariCP internals & tuning', tags: ['mnc'] },
        { name: 'Caching — @Cacheable, @CacheEvict, Redis integration', tags: ['hot'] },
        { name: 'Spring Batch — chunks, item readers/writers, partitioning', tags: ['mnc'] },
        { name: 'Kafka with Spring — @KafkaListener, consumer groups, offsets', tags: ['mnc','hot'] },
      ]},
      { label: 'Observability & Testing', topics: [
        { name: 'Actuator, Micrometer, Prometheus, Grafana — production metrics', tags: ['mnc'] },
        { name: 'Distributed tracing — Micrometer Tracing, Zipkin, correlation IDs', tags: ['mnc'] },
        { name: 'Testing pyramid — @SpringBootTest vs @WebMvcTest vs unit tests', tags: ['hot'] },
        { name: 'Contract testing — Spring Cloud Contract, consumer-driven contracts', tags: ['mnc'] },
      ]},
    ]
  },
  {
    id: 'db', icon: '🗄', title: 'Databases Deep Dive', color: 'db',
    sections: [
      { label: 'Transactions & Consistency', topics: [
        { name: 'ACID properties — definitions & how each is implemented', tags: ['hot','mnc'] },
        { name: 'Transaction isolation levels — Read Uncommitted → Serializable', tags: ['hot','mnc','hard'] },
        { name: 'Read phenomena — dirty read, non-repeatable read, phantom read', tags: ['hot','mnc'] },
        { name: 'Optimistic vs pessimistic locking — SELECT FOR UPDATE vs @Version', tags: ['hot','mnc'] },
        { name: 'Database deadlocks — detection, prevention, lock ordering', tags: ['mnc','hard'] },
        { name: 'BASE properties (NoSQL) vs ACID — when to accept each', tags: ['mnc'] },
      ]},
      { label: 'Indexing & Query Optimization', topics: [
        { name: 'Index types — B-tree, hash, composite, covering, full-text', tags: ['hot','mnc'] },
        { name: 'Query execution plan — EXPLAIN ANALYZE, cost estimation', tags: ['hot','mnc'] },
        { name: 'Index selectivity, cardinality & when indexes hurt performance', tags: ['mnc','hard'] },
        { name: 'Query optimization — SARGable predicates, avoiding full scans', tags: ['hot','mnc'] },
        { name: 'Normalization — 1NF to BCNF + strategic denormalization', tags: ['mnc'] },
        { name: 'OLTP vs OLAP — star schema, columnar storage', tags: ['mnc'] },
      ]},
      { label: 'Advanced SQL', topics: [
        { name: 'Window functions — ROW_NUMBER, RANK, LAG, LEAD, PARTITION BY', tags: ['hot','mnc'] },
        { name: 'CTEs vs subqueries vs temp tables — performance differences', tags: ['hot','mnc'] },
        { name: 'Joins deep dive — hash vs nested loop vs merge join plans', tags: ['hot'] },
        { name: 'Pagination — OFFSET/LIMIT pitfalls vs keyset (seek method)', tags: ['hot','mnc'] },
        { name: 'Stored procedures vs application-level logic — trade-offs', tags: ['mnc'] },
      ]},
      { label: 'NoSQL & Distributed Databases', topics: [
        { name: 'MongoDB — document model, aggregation pipeline, replica sets', tags: ['mnc','hot'] },
        { name: 'Cassandra — wide-column, partition key design, consistency tuning', tags: ['mnc','hard'] },
        { name: 'Redis — sorted sets, HyperLogLog, streams, TTL strategies', tags: ['hot','mnc'] },
        { name: 'Elasticsearch — inverted index, relevance scoring, mapping', tags: ['mnc'] },
        { name: 'Zero-downtime schema migrations — expand-contract pattern', tags: ['hot','mnc'] },
        { name: 'Connection pool sizing formula — Little\'s Law application', tags: ['mnc'] },
      ]},
    ]
  },
  {
    id: 'behav', icon: '🧠', title: 'Behavioral & Leadership', color: 'behav',
    sections: [
      { label: 'Amazon Leadership Principles', topics: [
        { name: 'Customer Obsession — story prioritizing customer over easy metrics', tags: ['hot','mnc'] },
        { name: 'Ownership — going beyond your scope to fix a systemic problem', tags: ['hot','mnc'] },
        { name: 'Invent & Simplify — improving a complex process you inherited', tags: ['mnc'] },
        { name: 'Bias for Action — making a call with incomplete data', tags: ['mnc'] },
        { name: 'Deliver Results — concrete story with measurable business impact', tags: ['hot','mnc'] },
        { name: 'Disagree & Commit — pushing back on a decision then committing', tags: ['hot','mnc'] },
        { name: 'Earn Trust — handling a production mistake with full transparency', tags: ['mnc'] },
        { name: 'Deep Dive — debugging a critical production issue root-cause story', tags: ['mnc'] },
        { name: 'Hire & Develop the Best — mentoring or raising bar through reviews', tags: ['mnc'] },
      ]},
      { label: 'Technical Soft Skills', topics: [
        { name: 'STAR method — Situation, Task, Action, Result framework', tags: ['hot'] },
        { name: 'System trade-off articulation — "I chose X over Y because A, B, C"', tags: ['hot','mnc'] },
        { name: 'Handling ambiguous requirements — decomposing vague problems', tags: ['hot','mnc'] },
        { name: 'Influencing without authority — leading tech decisions cross-team', tags: ['mnc'] },
        { name: 'Handling technical disagreement with manager or senior engineer', tags: ['mnc'] },
        { name: 'Metrics-driven engineering — using data to justify decisions', tags: ['mnc'] },
        { name: 'Mentoring approach & raising the technical bar on your team', tags: ['mnc'] },
        { name: 'Failure story — what went wrong, your role & what changed after', tags: ['hot','mnc'] },
        { name: 'Questions to ask the interviewer — depth, curiosity & culture fit', tags: ['hot'] },
      ]},
    ]
  },
]

export const PILLAR_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  java:   { text: '#f97316', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.25)' },
  design: { text: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.25)' },
  thread: { text: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.25)' },
  system: { text: '#38bdf8', bg: 'rgba(56,189,248,0.1)',   border: 'rgba(56,189,248,0.25)' },
  algo:   { text: '#f472b6', bg: 'rgba(244,114,182,0.1)',  border: 'rgba(244,114,182,0.25)' },
  spring: { text: '#facc15', bg: 'rgba(250,204,21,0.1)',   border: 'rgba(250,204,21,0.25)' },
  db:     { text: '#fb7185', bg: 'rgba(251,113,133,0.1)',  border: 'rgba(251,113,133,0.25)' },
  behav:  { text: '#67e8f9', bg: 'rgba(103,232,249,0.1)',  border: 'rgba(103,232,249,0.25)' },
}
